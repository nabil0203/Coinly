import React, { useState, useEffect } from 'react';
import { getIOUContacts, createOrUpdateContact } from '@/app/actions/iou';
import { type EntryPayload } from '@/app/actions/ledger';
import { Entry, EntryFormRow } from './EntryFormRow';

interface EditingEntry {
  _id?: string;
  description?: string;
  amount?: number | string;
  payment_method?: string;
  date?: string;
  // Inline IOU sub-document (new schema)
  iou?: {
    contact_id?: string;
    iou_type?: 'debt' | 'receivable';
    iou_action?: 'create' | 'repay';
    details?: string;
  } | null;
}

interface EntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: 'expense' | 'cashin', payload: EntryPayload | EntryPayload[], id?: string) => Promise<void> | void;
  onDelete?: (type: 'expense' | 'cashin', id: string) => Promise<void> | void;
  type: 'expense' | 'cashin';
  dateStr: string;
  paymentMethods: { _id?: string; id?: string; name: string; balance: number }[];
  editEntry?: EditingEntry | null;
}

const makeDefaultEntry = (type: 'expense' | 'cashin', defaultMethod: string): Entry => ({
  description: '',
  amount: '',
  payment_method: defaultMethod,
  is_iou: false,
  iou_contact_id: '',
  iou_type: type === 'expense' ? 'receivable' : 'debt',
  iou_action: 'create',
  iou_details: ''
});

export function EntryForm({ isOpen, onClose, onSubmit, onDelete, type, dateStr, paymentMethods, editEntry = null }: EntryFormProps) {
  const defaultMethod = paymentMethods.length > 0 ? paymentMethods[0].name : 'Cash';
  const [entries, setEntries] = useState<Entry[]>([makeDefaultEntry(type, '')]);
  const [selectedDate, setSelectedDate] = useState(dateStr);
  const [iouContacts, setIouContacts] = useState<{ _id?: string; name?: string; total_receivable?: number; total_debt?: number; [key: string]: unknown }[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isEditing = !!editEntry;

  // Semantic accent per type
  const accent = type === 'expense'
    ? { color: '#F43F5E', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.30)', glow: 'rgba(244,63,94,0.25)' }
    : { color: '#818CF8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.30)', glow: 'rgba(99,102,241,0.22)' };

  useEffect(() => {
    if (isOpen) {
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
          is_iou: !!editEntry.iou,
          iou_contact_id: editEntry.iou?.contact_id || '',
          iou_type: editEntry.iou?.iou_type || (type === 'expense' ? 'receivable' : 'debt'),
          iou_action: editEntry.iou?.iou_action || 'create',
          iou_details: editEntry.iou?.details || ''
        }]);
        setSelectedDate(editEntry.date || dateStr);
      } else {
        setEntries([makeDefaultEntry(type, defaultMethod)]);
        setSelectedDate(dateStr);
      }
    }
  }, [isOpen, isEditing, editEntry, paymentMethods, dateStr, defaultMethod, type]);

  if (!isOpen) return null;

  const handleAddMore = () => {
    setEntries([...entries, makeDefaultEntry(type, defaultMethod)]);
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
      if (updates.is_iou === true) {
        if (!entry.iou_type) entry.iou_type = type === 'expense' ? 'receivable' : 'debt';
        if (!entry.iou_action) entry.iou_action = 'create';
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
      if (entries.length === 1) handleEntryChange(0, { iou_contact_id: contact._id });
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
        if (isEditing && editEntry?.payment_method === methodName) availableBalance += Number(editEntry.amount);
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
        await onSubmit(type, entries.map((entry: Entry) => mapEntryToPayload(entry)));
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
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999] px-4 pt-20 pb-4 sm:p-4"
      style={{
        background: 'rgba(4,8,16,0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation: 'fade-in 0.18s ease-out both',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="max-w-3xl w-full max-h-[82vh] sm:max-h-[88vh] flex flex-col overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          backgroundColor: '#0F1929',
          border: `1px solid ${accent.border}`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.7), 0 0 80px ${accent.glow}`,
          animation: 'zoom-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >

        {/* ── Modal Header ── */}
        <div
          className="px-5 py-4 sm:px-6 sm:py-5 flex justify-between items-center shrink-0 relative"
          style={{
            borderBottom: `1px solid rgba(255,255,255,0.07)`,
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          {/* Accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${accent.color}, transparent)`, opacity: 0.5 }} />

          <div className="flex items-center gap-3">
            {/* Type icon badge */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
            >
              {type === 'expense' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black" style={{ color: accent.color }}>
              {isEditing ? 'Edit' : 'Add'} {type === 'expense' ? 'Expense' : 'Money'}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Date pill */}
            <div className="relative">
              <input
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)';
                }}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#94A3B8' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: '#CBD5E1' }}>
                  {(() => {
                    const d = new Date(selectedDate + 'T00:00:00');
                    return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}`;
                  })()}
                </span>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-all active:scale-95"
              style={{ color: '#64748B', background: 'transparent' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.10)';
                (e.currentTarget as HTMLElement).style.color = '#F43F5E';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = '#64748B';
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-2 sm:space-y-3 scrollbar-hide"
            style={{ backgroundColor: '#080E1A' }}
          >
            {entries.map((entry, index) => (
              <div
                key={index}
                style={{ animation: 'slide-in-up 0.3s ease-out both', animationDelay: `${index * 60}ms` }}
              >
                <EntryFormRow
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
              </div>
            ))}

            {!isEditing && (
              <button
                type="button"
                onClick={handleAddMore}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{
                  background: 'rgba(99,102,241,0.08)',
                  color: '#818CF8',
                  border: '1px solid rgba(99,102,241,0.18)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.15)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.35)';
                  (e.currentTarget as HTMLElement).style.color = '#A5B4FC';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.18)';
                  (e.currentTarget as HTMLElement).style.color = '#818CF8';
                }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Another Entry
              </button>
            )}
          </div>

          {/* ── Form Footer ── */}
          <div
            className="px-4 py-3.5 sm:px-6 sm:py-4 shrink-0"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2.5 sm:justify-between items-stretch sm:items-center">

              {/* Submit */}
              <div className="contents sm:flex sm:order-2 sm:items-center sm:gap-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                  className="col-span-2 order-1 sm:order-2 flex items-center justify-center gap-2 px-8 py-3 sm:py-2.5 rounded-2xl font-black text-sm transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-wait"
                  style={{
                    background: type === 'expense'
                      ? 'linear-gradient(135deg, #E11D48, #F43F5E)'
                      : 'linear-gradient(135deg, #4F46E5, #818CF8)',
                    color: 'white',
                    boxShadow: `0 4px 20px ${accent.glow}`,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
                  className={`${isEditing ? 'col-span-1' : 'col-span-2'} order-2 sm:order-1 px-6 py-3 sm:py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-70`}
                  style={{
                    color: '#64748B',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLElement).style.color = '#F1F5F9';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                    (e.currentTarget as HTMLElement).style.color = '#64748B';
                  }}
                >
                  Cancel
                </button>
              </div>

              {/* Delete */}
              <div className={`${isEditing ? 'col-span-1 order-3' : 'hidden sm:block'} sm:order-1`}>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting || isDeleting}
                    className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-wait"
                    style={{
                      background: 'rgba(244,63,94,0.10)',
                      color: '#F43F5E',
                      border: '1px solid rgba(244,63,94,0.25)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.18)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.10)'; }}
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
