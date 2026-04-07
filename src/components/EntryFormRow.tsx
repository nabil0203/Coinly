import React from 'react';

export interface Entry {
  description: string;
  amount: string;
  payment_method: string;
  is_iou?: boolean;
  iou_contact_id?: string;
  iou_type?: 'debt' | 'receivable';
  iou_action?: 'create' | 'repay';
  iou_details?: string;
}

interface EntryFormRowProps {
  index: number;
  entry: Entry;
  isEditing: boolean;
  entriesCount: number;
  type: 'expense' | 'cashin';
  iouContacts: { _id?: string; name?: string; total_receivable?: number; total_debt?: number; [key: string]: unknown }[];
  paymentMethods: { _id?: string; id?: string; name: string; balance: number }[];
  handleRemoveEntry: (index: number) => void;
  handleEntryChange: (index: number, updates: Partial<Entry>) => void;
  isAddingContact: boolean;
  setIsAddingContact: (val: boolean) => void;
  newContactName: string;
  setNewContactName: (val: string) => void;
  handleCreateContact: (e: React.FormEvent | React.KeyboardEvent) => void;
}

export function EntryFormRow({
  index,
  entry,
  isEditing,
  entriesCount,
  type,
  iouContacts,
  paymentMethods,
  handleRemoveEntry,
  handleEntryChange,
  isAddingContact,
  setIsAddingContact,
  newContactName,
  setNewContactName,
  handleCreateContact
}: EntryFormRowProps) {
  return (
    <div className={`relative p-3 sm:p-5 rounded-2xl bg-slate-50/50 border-2 border-slate-200 group transition-all hover:bg-white hover:border-slate-300 hover:shadow-md ${index > 0 ? 'mt-3' : ''}`}>
      {!isEditing && entriesCount > 1 && (
        <button 
          type="button" 
          onClick={() => handleRemoveEntry(index)}
          className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 rounded-full p-1.5 shadow-md border border-slate-100 opacity-100 transition-all z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-12 gap-3 sm:gap-5">
        <div className="col-span-2 md:col-span-12 lg:col-span-6">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-700 placeholder:text-slate-300 font-medium text-sm sm:text-base"
            value={entry.description} 
            onChange={e => handleEntryChange(index, { description: e.target.value })} 
            required 
            placeholder="What was this for?"
          />
        </div>
        <div className="col-span-2 md:col-span-6 lg:col-span-3">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
            <input 
              type="number" 
              step="1"
              className="w-full pl-8 pr-4 py-2 sm:py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-700 font-bold tabular-nums text-sm sm:text-base"
              value={entry.amount} 
              onChange={e => handleEntryChange(index, { amount: e.target.value })} 
              required 
              min="0"
            />
          </div>
        </div>
        <div className="col-span-1 md:col-span-6 lg:col-span-3">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 whitespace-nowrap overflow-hidden text-ellipsis">Method</label>
          <select 
            className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-700 font-medium text-sm sm:text-base"
            value={entry.payment_method} 
            onChange={e => handleEntryChange(index, { payment_method: e.target.value })}
          >
            {paymentMethods.length > 0 ? paymentMethods.map(pm => (
              <option key={pm._id || pm.id} value={pm.name}>{pm.name}</option>
            )) : (
              <>
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
              </>
            )}
          </select>
        </div>

        {/* Debt/Loan checkbox — mobile only, beside Method */}
        <div className="col-span-1 md:hidden flex items-center justify-start pl-2 pt-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all"
              checked={entry.is_iou}
              onChange={e => handleEntryChange(index, { is_iou: e.target.checked })}
            />
            <span className="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors uppercase tracking-tight">Debt / Loan?</span>
          </label>
        </div>
      </div>

      {/* IOU Section */}
      <div className="mt-3 pt-3 border-t border-slate-100">
          {/* Checkbox row — hidden on mobile (checkbox is in the grid above) */}
          <div className="hidden md:flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all"
                      checked={entry.is_iou}
                      onChange={e => handleEntryChange(index, { is_iou: e.target.checked })}
                  />
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors uppercase tracking-tight">Debt / Loan?</span>
              </label>
              {entry.is_iou && (
                  <button 
                      type="button"
                      onClick={() => setIsAddingContact(!isAddingContact)}
                      className={`${isAddingContact ? 'bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg' : 'text-blue-600'} text-[10px] font-bold hover:opacity-80 transition-all`}
                  >
                      {isAddingContact ? 'Cancel' : '+ New Person'}
                  </button>
              )}
          </div>
          {/* Mobile-only: show + New Person button when IOU is checked */}
          {entry.is_iou && (
              <div className="flex md:hidden justify-end mb-2">
                  <button
                      type="button"
                      onClick={() => setIsAddingContact(!isAddingContact)}
                      className={`${isAddingContact ? 'bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg' : 'text-blue-600'} text-[10px] font-bold hover:opacity-80 transition-all`}
                  >
                      {isAddingContact ? 'Cancel' : '+ New Person'}
                  </button>
              </div>
          )}

          {entry.is_iou && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {isAddingContact && (
                      <div className="flex gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                          <input 
                              type="text" 
                              placeholder="Person's Name" 
                              className="flex-1 px-3 py-1.5 text-xs border border-blue-200 rounded-lg outline-none focus:border-blue-500"
                              value={newContactName}
                              onChange={e => setNewContactName(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleCreateContact(e)}
                          />
                          <button 
                              type="button" 
                              onClick={handleCreateContact}
                              className="btn-primary !px-4 !py-1.5 !text-[10px] !rounded-lg"
                          >
                              Add
                          </button>
                      </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Whom (Contact)</label>
                          <select 
                              className="w-full px-3 py-2 text-xs bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-700 font-medium"
                              value={entry.iou_contact_id}
                              onChange={e => handleEntryChange(index, { iou_contact_id: e.target.value })}
                              required={entry.is_iou}
                          >
                              <option value="">Select Person</option>
                              {iouContacts
                                .filter(c => ((c.total_receivable || 0) > 0 || (c.total_debt || 0) > 0 || c._id === entry.iou_contact_id))
                                .map(contact => (
                                  <option key={contact._id} value={contact._id}>{contact.name}</option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Action Type</label>
                          <select 
                              className="w-full px-3 py-2 text-xs bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-700 font-medium"
                              value={`${entry.iou_type}_${entry.iou_action}`}
                              onChange={e => {
                                  const [iType, iAction] = e.target.value.split('_');
                                  handleEntryChange(index, { 
                                      iou_type: iType as Extract<Entry['iou_type'], string>, 
                                      iou_action: iAction as Extract<Entry['iou_action'], string> 
                                  });
                              }}
                              required={entry.is_iou}
                          >
                              {type === 'expense' ? (
                                  <>
                                      <option value="receivable_create">Lending Money (New Loan)</option>
                                      <option value="debt_repay">Repaying Debt (Paying Off)</option>
                                  </>
                              ) : (
                                  <>
                                      <option value="debt_create">Taking Debt (Borrowing)</option>
                                      <option value="receivable_repay">Collecting Money (Return)</option>
                                  </>
                              )}
                          </select>
                      </div>
                  </div>
                  <div className="space-y-1.5 px-1 pb-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Details</label>
                      <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300"
                          value={entry.iou_details}
                          onChange={e => handleEntryChange(index, { iou_details: e.target.value })}
                          placeholder="Specific notes e.g., For office lunch..."
                          required={entry.is_iou}
                      />
                  </div>
              </div>
          )}
      </div>
    </div>
  );
}
