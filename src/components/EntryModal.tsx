import React, { useState, useEffect } from 'react';
import { getIOUContacts, createOrUpdateContact } from '@/app/actions/iou';
import { type EntryPayload } from '@/app/actions/ledger';
import { Entry, EntryFormRow } from './EntryFormRow';

interface EditingEntry {
  _id?: string;
  description?: string;
  amount?: number | string;
  payment_method?: string;
  is_iou?: boolean;
  date?: string;
  iou_details?: {
    contact?: string;
    iou_type?: 'debt' | 'receivable';
    iou_action?: 'create' | 'repay';
    details?: string;
  };
}

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: 'expense' | 'cashin', payload: EntryPayload | EntryPayload[], id?: string) => Promise<void> | void;
  onDelete?: (type: 'expense' | 'cashin', id: string) => Promise<void> | void;
  type: 'expense' | 'cashin';
  dateStr: string;
  paymentMethods: { _id?: string; id?: string; name: string; balance: number }[];
  editEntry?: EditingEntry | null;
}

export function EntryModal({ isOpen, onClose, onSubmit, onDelete, type, dateStr, paymentMethods, editEntry = null }: EntryModalProps) {
  const [entries, setEntries] = useState<Entry[]>([{ 
    description: '', 
    amount: '', 
    payment_method: '',
    is_iou: false,
    iou_contact_id: '',
    iou_type: type === 'expense' ? 'receivable' : 'debt',
    iou_action: 'create',
    iou_details: ''
  }]);
  const [selectedDate, setSelectedDate] = useState(dateStr);
  const [iouContacts, setIouContacts] = useState<{ _id?: string; name?: string; total_receivable?: number; total_debt?: number; [key: string]: unknown }[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isEditing = !!editEntry;
  const defaultMethod = paymentMethods.length > 0 ? paymentMethods[0].name : 'Cash';

  useEffect(() => {
    if (isOpen) {
      // Fetch contacts
      // Fetch fresh contacts and clear any stale selections pointing to deleted contacts
      getIOUContacts().then(freshContacts => {
        setIouContacts(freshContacts);
        const validIds = new Set(freshContacts.map((c: { _id?: string; [key: string]: unknown }) => c._id));
        setEntries(prev => prev.map(e =>
          e.iou_contact_id && !validIds.has(e.iou_contact_id)
            ? { ...e, iou_contact_id: '' }
            : e
        ));
      });

      if (isEditing && editEntry) {
        setEntries([{
          description: editEntry.description || '',
          amount: String(editEntry.amount || ''),
          payment_method: editEntry.payment_method || defaultMethod,
          is_iou: editEntry.is_iou || false,
          iou_contact_id: editEntry.iou_details?.contact || '',
          iou_type: editEntry.iou_details?.iou_type || (type === 'expense' ? 'receivable' : 'debt'),
          iou_action: editEntry.iou_details?.iou_action || 'create',
          iou_details: editEntry.iou_details?.details || ''
        }]);
        setSelectedDate(editEntry.date || dateStr);
      } else {
        setEntries([{ 
          description: '', 
          amount: '', 
          payment_method: defaultMethod,
          is_iou: false,
          iou_contact_id: '',
          iou_type: type === 'expense' ? 'receivable' : 'debt',
          iou_action: 'create',
          iou_details: ''
        }]);
        setSelectedDate(dateStr);
      }
    }
  }, [isOpen, isEditing, editEntry, paymentMethods, dateStr, defaultMethod, type]);

  if (!isOpen) return null;

  const handleAddMore = () => {
    setEntries([...entries, { 
      description: '', 
      amount: '', 
      payment_method: defaultMethod,
      is_iou: false,
      iou_contact_id: '',
      iou_type: type === 'expense' ? 'receivable' : 'debt',
      iou_action: 'create',
      iou_details: ''
    }]);
  };

  const handleRemoveEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const handleEntryChange = (index: number, updates: Partial<Entry>) => {
    setEntries(prev => {
        const newEntries = [...prev];
        const entry = { ...newEntries[index], ...updates };
        
        // Automatically set iou_type and iou_action based on transaction type if not set
        if (updates.is_iou === true) {
            if (!entry.iou_type) {
                entry.iou_type = type === 'expense' ? 'receivable' : 'debt';
            }
            if (!entry.iou_action) {
                entry.iou_action = 'create';
            }
        }
        
        newEntries[index] = entry;
        return newEntries;
    });
  };

  const handleCreateContact = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;
    
    try {
      const contact = await createOrUpdateContact(newContactName);
      setIouContacts([...iouContacts, contact]);
      setNewContactName('');
      setIsAddingContact(false);
      // If we only have one entry, auto-select this contact
      if (entries.length === 1) {
        handleEntryChange(0, { iou_contact_id: contact._id });
      }
    } catch (error: unknown) {
      alert(`Failed to add contact: ${(error as Error).message || 'Unknown error'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'expense') {
      const methodTotals: Record<string, number> = {};
      entries.forEach(entry => {
        const amt = parseInt(entry.amount, 10) || 0;
        methodTotals[entry.payment_method] = (methodTotals[entry.payment_method] || 0) + amt;
      });

      for (const methodName in methodTotals) {
        const method = paymentMethods.find(pm => pm.name === methodName);
        let availableBalance = method ? (Number(method.balance) || 0) : 0;
        
        if (isEditing && editEntry?.payment_method === methodName) {
          availableBalance += Number(editEntry.amount);
        }

        if (methodTotals[methodName] > availableBalance) {
          alert(`Insufficient balance in ${methodName}.\nAvailable: ৳ ${availableBalance}\nRequested: ৳ ${methodTotals[methodName]}`);
          return;
        }
      }
    }

    const mapEntryToPayload = (entry: Entry): EntryPayload => {
        const payload: EntryPayload = {
            date: selectedDate,
            description: entry.description,
            amount: parseInt(entry.amount, 10),
            payment_method: entry.payment_method
        };

        if (entry.is_iou && entry.iou_contact_id) {
            payload.iou = {
                contactId: entry.iou_contact_id,
                iouType: entry.iou_type || (type === 'expense' ? 'receivable' : 'debt'),
                iouAction: entry.iou_action || 'create',
                details: entry.iou_details
            };
        }

        return payload;
    };

    setIsSubmitting(true);
    try {
      if (isEditing && editEntry?._id) {
        await onSubmit(type, mapEntryToPayload(entries[0]), editEntry._id);
      } else {
        const payloads = entries.map((entry: Entry) => mapEntryToPayload(entry));
        await onSubmit(type, payloads);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete && editEntry?._id && window.confirm('Delete this entry?')) {
      setIsDeleting(true);
      try {
        await onDelete(type, editEntry._id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[9999] px-4 pt-20 pb-4 sm:p-4">
      <div className={`bg-white rounded-3xl shadow-2xl ${isEditing ? 'max-w-2xl' : 'max-w-3xl'} w-full max-h-[82vh] sm:max-h-[88vh] flex flex-col overflow-hidden transform transition-all border border-white/20 animate-in zoom-in-95 duration-200`}>
        
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-base sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${type === 'expense' ? 'bg-red-500' : 'bg-green-500'}`}></div>
              {isEditing ? 'Edit' : 'Add'} {type === 'expense' ? 'Expense' : 'Money'}
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}
            </p>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="relative group">
              <input 
                type="date" 
                className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button type="button" className="p-2 sm:p-3 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-xl sm:rounded-2xl transition-all border border-slate-100 shadow-sm flex items-center justify-center relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg sm:rounded-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-6 scrollbar-hide">
            {entries.map((entry, index) => (
              <EntryFormRow
                key={index}
                index={index}
                entry={entry}
                entriesCount={entries.length}
                isEditing={isEditing}
                type={type}
                iouContacts={iouContacts}
                paymentMethods={paymentMethods}
                handleRemoveEntry={handleRemoveEntry}
                handleEntryChange={handleEntryChange}
                isAddingContact={isAddingContact}
                setIsAddingContact={setIsAddingContact}
                newContactName={newContactName}
                setNewContactName={setNewContactName}
                handleCreateContact={handleCreateContact}
              />
            ))}
            
            {!isEditing && (
              <button 
                type="button" 
                onClick={handleAddMore}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-blue-600 hover:text-blue-600 hover:bg-slate-50 transition-all font-bold flex items-center justify-center gap-2 group"
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                Add Multiple Entries
              </button>
            )}
          </div>
          
          {/* Modal Footer */}
          <div className="px-4 py-3 sm:px-6 sm:py-5 bg-slate-50 border-t border-slate-100 shrink-0">
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:justify-between items-stretch sm:items-center">
              
              {/* Primary Actions Group */}
              <div className="contents sm:flex sm:order-2 sm:items-center sm:gap-3">
                <button 
                  type="submit" 
                  disabled={isSubmitting || isDeleting}
                  className="col-span-2 order-1 sm:order-2 btn-primary !py-3 sm:!py-2.5 !px-8 !rounded-2xl !shadow-xl !text-sm sm:!text-base flex items-center justify-center disabled:opacity-80 disabled:cursor-wait"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditing ? 'Saving...' : 'Adding...'}
                    </>
                  ) : (
                    isEditing ? 'Save Changes' : `Add ${type === 'expense' ? 'Expense' : 'Money'}`
                  )}
                </button>

                <button 
                  type="button" 
                  onClick={onClose} 
                  disabled={isSubmitting || isDeleting}
                  className={`${isEditing ? 'col-span-1' : 'col-span-2'} order-2 sm:order-1 btn-outline !py-3 sm:!py-2.5 !px-6 !rounded-2xl !text-sm sm:!text-base disabled:opacity-80`}
                >
                  Cancel
                </button>
              </div>

              <div className={`${isEditing ? 'col-span-1 order-3' : 'hidden sm:block'} sm:order-1`}>
                {isEditing && (
                  <button 
                    type="button" 
                    onClick={handleDelete}
                    disabled={isSubmitting || isDeleting}
                    className="w-full sm:w-auto btn-danger !py-3 sm:!py-2.5 !px-5 !rounded-2xl !text-sm flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-wait"
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
