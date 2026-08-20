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

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#0a1525',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '0.75rem',
  color: '#F1F5F9',
  outline: 'none',
  transition: 'border-color 0.2s',
  padding: '0.625rem 0.875rem',
  fontSize: '0.875rem',
  fontWeight: 600,
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  paddingRight: '2.5rem',
  cursor: 'pointer',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.625rem',
  fontWeight: 800,
  color: '#94A3B8',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '0.375rem',
  marginLeft: '0.25rem',
};

const SelectArrow = () => (
  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center" style={{ color: '#94A3B8' }}>
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

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

  const accent = type === 'expense'
    ? { color: '#F43F5E', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.20)' }
    : { color: '#818CF8', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.20)' };

  return (
    <div
      className="relative rounded-2xl p-4 sm:p-5 transition-all"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)',
        backgroundColor: '#0F1929',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = accent.border; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
    >
      {/* Remove button (multi-entry) */}
      {!isEditing && entriesCount > 1 && (
        <button
          type="button"
          onClick={() => handleRemoveEntry(index)}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all active:scale-90"
          style={{
            background: '#0F1929',
            border: '1px solid rgba(244,63,94,0.30)',
            color: '#F43F5E',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Entry index badge (multi-entry) */}
      {entriesCount > 1 && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: accent.bg, color: accent.color, border: `1px solid ${accent.border}` }}>
            Entry #{index + 1}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-12 gap-3 sm:gap-4">

        {/* Description */}
        <div className="col-span-2 md:col-span-12 lg:col-span-6">
          <label style={labelStyle}>Description</label>
          <input
            type="text"
            style={inputStyle}
            value={entry.description}
            onChange={e => handleEntryChange(index, { description: e.target.value })}
            required
            placeholder="What was this for?"
            onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = accent.color; }}
            onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
          />
        </div>

        {/* Amount */}
        <div className="col-span-2 md:col-span-6 lg:col-span-3">
          <label style={labelStyle}>Amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black pointer-events-none"
              style={{ color: '#94A3B8' }}>৳</span>
            <input
              type="number"
              step="1"
              style={{ ...inputStyle, paddingLeft: '2rem', fontFamily: 'monospace' }}
              value={entry.amount}
              onChange={e => handleEntryChange(index, { amount: e.target.value })}
              required
              min="0"
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = accent.color; }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3">
          <label style={labelStyle}>Method</label>
          <div className="relative">
            <select
              style={selectStyle}
              value={entry.payment_method}
              onChange={e => handleEntryChange(index, { payment_method: e.target.value })}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = accent.color; }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              {paymentMethods.length > 0 ? paymentMethods.map(pm => (
                <option key={pm._id || pm.id} value={pm.name}
                  style={{ backgroundColor: '#0a1525', color: '#F1F5F9' }}>
                  {pm.name}
                </option>
              )) : (
                <>
                  <option value="Cash" style={{ backgroundColor: '#0a1525' }}>Cash</option>
                  <option value="Bank" style={{ backgroundColor: '#0a1525' }}>Bank</option>
                </>
              )}
            </select>
            <SelectArrow />
          </div>
        </div>

        {/* Debt/Loan checkbox — mobile */}
        <div className="col-span-1 md:hidden flex items-center justify-start pl-1 pt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded accent-indigo-500"
              style={{ borderColor: 'rgba(255,255,255,0.12)', backgroundColor: '#0a1525' }}
              checked={entry.is_iou}
              onChange={e => handleEntryChange(index, { is_iou: e.target.checked })}
            />
            <span className="text-xs font-bold uppercase tracking-tight" style={{ color: '#94A3B8' }}>Debt / Loan?</span>
          </label>
        </div>
      </div>

      {/* IOU Section */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Desktop: Debt toggle + New Person btn */}
        <div className="hidden md:flex items-center justify-between mb-4">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded accent-indigo-500"
              checked={entry.is_iou}
              onChange={e => handleEntryChange(index, { is_iou: e.target.checked })}
            />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>Debt / Loan?</span>
          </label>
          {entry.is_iou && (
            <button
              type="button"
              onClick={() => setIsAddingContact(!isAddingContact)}
              className="text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
              style={isAddingContact
                ? { background: 'rgba(255,255,255,0.06)', color: '#F1F5F9', border: '1px solid rgba(255,255,255,0.10)' }
                : { background: 'rgba(99,102,241,0.10)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.20)' }
              }
            >
              {isAddingContact ? 'Cancel' : '+ New Person'}
            </button>
          )}
        </div>

        {/* Mobile: New Person btn */}
        {entry.is_iou && (
          <div className="flex md:hidden justify-end mb-3">
            <button
              type="button"
              onClick={() => setIsAddingContact(!isAddingContact)}
              className="text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
              style={isAddingContact
                ? { background: 'rgba(255,255,255,0.06)', color: '#F1F5F9', border: '1px solid rgba(255,255,255,0.10)' }
                : { background: 'rgba(99,102,241,0.10)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.20)' }
              }
            >
              {isAddingContact ? 'Cancel' : '+ New Person'}
            </button>
          </div>
        )}

        {entry.is_iou && (
          <div className="space-y-4" style={{ animation: 'slide-in-up 0.2s ease-out both' }}>

            {/* New contact input */}
            {isAddingContact && (
              <div className="flex gap-2 p-3 rounded-xl"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.20)' }}>
                <input
                  type="text"
                  placeholder="Person's Name"
                  style={{ ...inputStyle, flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                  value={newContactName}
                  onChange={e => setNewContactName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateContact(e)}
                />
                <button
                  type="button"
                  onClick={handleCreateContact}
                  className="px-4 py-1.5 rounded-lg font-bold text-[10px] transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(99,102,241,0.30)',
                  }}
                >
                  Add
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label style={labelStyle}>Whom (Contact)</label>
                <div className="relative">
                  <select
                    style={{ ...selectStyle, fontSize: '0.8rem' }}
                    value={entry.iou_contact_id}
                    onChange={e => handleEntryChange(index, { iou_contact_id: e.target.value })}
                    required={entry.is_iou}
                    onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6366F1'; }}
                    onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    <option value="" style={{ backgroundColor: '#0a1525' }}>Select Person</option>
                    {iouContacts
                      .filter(c => ((c.total_receivable || 0) > 0 || (c.total_debt || 0) > 0 || c._id === entry.iou_contact_id))
                      .map(contact => (
                        <option key={contact._id} value={contact._id} style={{ backgroundColor: '#0a1525' }}>
                          {contact.name}
                        </option>
                      ))}
                  </select>
                  <SelectArrow />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Action Type</label>
                <div className="relative">
                  <select
                    style={{ ...selectStyle, fontSize: '0.8rem' }}
                    value={`${entry.iou_type}_${entry.iou_action}`}
                    onChange={e => {
                      const [iType, iAction] = e.target.value.split('_');
                      handleEntryChange(index, {
                        iou_type: iType as Extract<Entry['iou_type'], string>,
                        iou_action: iAction as Extract<Entry['iou_action'], string>
                      });
                    }}
                    required={entry.is_iou}
                    onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6366F1'; }}
                    onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    {type === 'expense' ? (
                      <>
                        <option value="receivable_create" style={{ backgroundColor: '#0a1525' }}>Lending Money (New Loan)</option>
                        <option value="debt_repay" style={{ backgroundColor: '#0a1525' }}>Repaying Debt (Paying Off)</option>
                      </>
                    ) : (
                      <>
                        <option value="debt_create" style={{ backgroundColor: '#0a1525' }}>Taking Debt (Borrowing)</option>
                        <option value="receivable_repay" style={{ backgroundColor: '#0a1525' }}>Collecting Money (Return)</option>
                      </>
                    )}
                  </select>
                  <SelectArrow />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Details</label>
              <input
                type="text"
                style={inputStyle}
                value={entry.iou_details}
                onChange={e => handleEntryChange(index, { iou_details: e.target.value })}
                placeholder="Specific notes e.g., For office lunch..."
                required={entry.is_iou}
                onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6366F1'; }}
                onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
