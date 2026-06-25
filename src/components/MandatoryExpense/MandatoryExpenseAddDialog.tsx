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
    <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center z-50 px-4"
      style={{ animation: 'fade-in 0.2s ease-out both' }}>
      <div className="bg-[#1E293B] border border-[#334155] rounded-3xl shadow-2xl max-w-md w-full p-6"
        style={{ animation: 'zoom-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <h3 className="text-lg font-bold text-[#F8FAFC] mb-5">Add Mandatory Expense</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">Expense Name</label>
            <input placeholder="e.g. Rent, Internet..." value={addName} onChange={e => setAddName(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] focus:border-[#F59E0B]/50 focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">Monthly Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] font-bold">৳</span>
              <input type="number" placeholder="0.00" value={addAmount} onChange={e => setAddAmount(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl pl-9 pr-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] focus:border-[#F59E0B]/50 focus:outline-none transition-colors" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">Cancel</button>
          <button onClick={handleAdd} disabled={addLoading}
            className="px-6 py-2.5 text-sm font-bold bg-[#F59E0B] text-[#0F172A] rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50 flex items-center gap-2">
            {addLoading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            Add Expense
          </button>
        </div>
      </div>
    </div>
  );
}
