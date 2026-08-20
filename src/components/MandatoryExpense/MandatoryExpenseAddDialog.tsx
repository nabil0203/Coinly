import React, { useState } from 'react';

interface MandatoryExpenseAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, amount: string) => Promise<void>;
}

export function MandatoryExpenseAddDialog({ isOpen, onClose, onAdd }: MandatoryExpenseAddDialogProps) {
  const [addName, setAddName] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!addName.trim() || !addAmount) return;
    setAddLoading(true);
    await onAdd(addName, addAmount);
    setAddName('');
    setAddAmount('');
    setAddLoading(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{
        background: 'rgba(4,8,16,0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation: 'fade-in 0.18s ease-out both',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="max-w-md w-full rounded-3xl p-6 sm:p-7 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
          backgroundColor: '#0F1929',
          border: '1px solid rgba(245,158,11,0.30)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(245,158,11,0.15)',
          animation: 'zoom-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Accent top line */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)' }}
        />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(245,158,11,0.12)',
                color: '#F59E0B',
                border: '1px solid rgba(245,158,11,0.25)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-black" style={{ color: '#F1F5F9' }}>Add Mandatory Expense</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-all"
            style={{ color: '#64748B' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#F43F5E';
              (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.10)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = '#64748B';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5 block ml-0.5" style={{ color: '#94A3B8' }}>
              Expense Name
            </label>
            <input
              placeholder="e.g. House Rent, WiFi, Netflix..."
              value={addName}
              onChange={e => setAddName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all"
              style={{
                backgroundColor: '#0A1525',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F1F5F9',
              }}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#F59E0B'; }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5 block ml-0.5" style={{ color: '#94A3B8' }}>
              Monthly Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-sm pointer-events-none" style={{ color: '#94A3B8' }}>৳</span>
              <input
                type="number"
                placeholder="0.00"
                value={addAmount}
                onChange={e => setAddAmount(e.target.value)}
                className="w-full rounded-xl pl-9 pr-4 py-3 text-sm font-semibold outline-none transition-all tabular-nums"
                style={{
                  backgroundColor: '#0A1525',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#F1F5F9',
                }}
                onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#F59E0B'; }}
                onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold rounded-xl transition-all"
            style={{
              color: '#94A3B8',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F1F5F9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8'; }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={addLoading}
            className="px-6 py-2.5 text-xs font-black rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#080E1A',
              boxShadow: '0 4px 16px rgba(245,158,11,0.25)',
            }}
          >
            {addLoading && (
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Add Expense
          </button>
        </div>
      </div>
    </div>
  );
}
