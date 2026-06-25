import React, { useState, useEffect } from 'react';
import { MandatoryExpenseItem } from '@/app/actions/essentials';

interface PaymentMethod {
  name: string;
}

interface PaySplit {
  payment_method: string;
  amount: string;
}

interface MandatoryExpensePayDialogProps {
  payItem: MandatoryExpenseItem | null;
  paymentMethods: PaymentMethod[];
  defaultMethod: string;
  onClose: () => void;
  onConfirmPay: (payItem: MandatoryExpenseItem, validSplits: PaySplit[], payDate: string) => Promise<void>;
}

const getLocalDateStr = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};

export function MandatoryExpensePayDialog({
  payItem,
  paymentMethods,
  defaultMethod,
  onClose,
  onConfirmPay,
}: MandatoryExpensePayDialogProps) {
  const [paySplits, setPaySplits] = useState<PaySplit[]>([]);
  const [payDate, setPayDate] = useState(getLocalDateStr());
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    if (payItem) {
      setPaySplits([{ payment_method: payItem.default_payment_method || defaultMethod, amount: String(payItem.amount) }]);
      setPayDate(getLocalDateStr());
    }
  }, [payItem, defaultMethod]);

  if (!payItem) return null;

  const addSplit = () => setPaySplits([...paySplits, { payment_method: defaultMethod, amount: '' }]);

  const removeSplit = (i: number) => {
    if (paySplits.length > 1) setPaySplits(paySplits.filter((_, idx) => idx !== i));
  };

  const updateSplit = (i: number, field: keyof PaySplit, val: string) => {
    const next = [...paySplits];
    next[i] = { ...next[i], [field]: val };
    setPaySplits(next);
  };

  const splitTotal = paySplits.reduce((s, p) => s + (parseInt(p.amount, 10) || 0), 0);

  const handleConfirmPay = async () => {
    const validSplits = paySplits.filter(s => s.payment_method && parseInt(s.amount, 10) > 0);
    if (validSplits.length === 0) { alert('Add at least one valid payment.'); return; }
    
    setPayLoading(true);
    await onConfirmPay(payItem, validSplits, payDate);
    setPayLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center z-9999 px-4"
      style={{ animation: 'fade-in 0.2s ease-out both' }}>
      <div className="bg-[#1E293B] border border-[#334155] rounded-3xl shadow-2xl max-w-md w-full p-6"
        style={{ animation: 'zoom-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <h3 className="text-lg font-bold text-[#F8FAFC] mb-1">Confirm Payment</h3>
        <p className="text-sm text-[#94A3B8] mb-5">
          Mark <span className="text-[#F59E0B] font-bold">{payItem.name}</span> as paid?
        </p>

        {/* Date picker */}
        <div className="mb-4">
          <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">Date</label>
          <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
            style={{ colorScheme: 'dark' }}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-[#F8FAFC] focus:border-[#F59E0B]/50 focus:outline-none" />
        </div>

        {/* Payment splits */}
        <div className="space-y-3 mb-4">
          <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Payment(s)</label>
          {paySplits.map((split, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select value={split.payment_method} onChange={e => updateSplit(i, 'payment_method', e.target.value)}
                className="flex-1 bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] focus:border-[#F59E0B]/50 focus:outline-none">
                {paymentMethods.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
              <div className="relative w-28 shrink-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] text-xs font-bold">৳</span>
                <input type="number" placeholder="0" value={split.amount} onChange={e => updateSplit(i, 'amount', e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl pl-7 pr-3 py-2.5 text-sm text-[#F8FAFC] focus:border-[#F59E0B]/50 focus:outline-none" />
              </div>
              {paySplits.length > 1 && (
                <button onClick={() => removeSplit(i)} className="p-2.5 text-[#475569] hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-xl transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          <button onClick={addSplit} className="text-xs font-bold text-[#F59E0B] hover:text-[#F8FAFC] transition-colors flex items-center gap-1 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Split Payment
          </button>
        </div>

        {/* Total Summary */}
        <div className="flex items-center justify-between py-3 border-t border-[#334155] mb-5">
          <span className="text-xs font-bold text-[#94A3B8]">Total Amount</span>
          <span className={`text-sm font-black tabular-nums ${splitTotal !== payItem.amount ? 'text-[#F43F5E]' : 'text-[#22C55E]'}`}>
            ৳ {splitTotal.toLocaleString()}
            {splitTotal !== payItem.amount && <span className="text-[10px] text-[#94A3B8] ml-2 font-medium">(Expected: ৳ {payItem.amount})</span>}
          </span>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">Cancel</button>
          <button onClick={handleConfirmPay} disabled={payLoading}
            className="px-6 py-2.5 text-sm font-bold bg-[#F59E0B] text-[#0F172A] rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50 flex items-center gap-2">
            {payLoading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            Confirm Pay
          </button>
        </div>
      </div>
    </div>
  );
}
