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

  const defaultAmtToPay = payItem
    ? (payItem.remaining_amount !== undefined && payItem.remaining_amount > 0 ? payItem.remaining_amount : payItem.amount)
    : 0;

  useEffect(() => {
    if (payItem) {
      const initialAmt = payItem.remaining_amount !== undefined && payItem.remaining_amount > 0
        ? payItem.remaining_amount
        : payItem.amount;
      setPaySplits([{ payment_method: payItem.default_payment_method || defaultMethod, amount: String(initialAmt) }]);
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
  const targetAmount = defaultAmtToPay;

  const handleConfirmPay = async () => {
    const validSplits = paySplits.filter(s => s.payment_method && parseInt(s.amount, 10) > 0);
    if (validSplits.length === 0) { alert('Add at least one valid payment.'); return; }

    setPayLoading(true);
    await onConfirmPay(payItem, validSplits, payDate);
    setPayLoading(false);
  };

  const isPartial = (payItem.paid_amount || 0) > 0 && !payItem.is_fully_paid;

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

        <div className="flex items-center justify-between mb-2">
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-black" style={{ color: '#F1F5F9' }}>
              {isPartial ? 'Pay Remaining Balance' : 'Confirm Payment'}
            </h3>
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

        <div className="text-xs font-semibold mb-5 ml-0.5" style={{ color: '#94A3B8' }}>
          {isPartial ? (
            <p>
              Paying remainder for <span className="font-bold" style={{ color: '#FBBF24' }}>{payItem.name}</span>
              <br />
              <span className="text-[11px]" style={{ color: '#CBD5E1' }}>
                Total: ৳{payItem.amount.toLocaleString()} • Paid: ৳{(payItem.paid_amount || 0).toLocaleString()} • Remaining: ৳{(payItem.remaining_amount || 0).toLocaleString()}
              </span>
            </p>
          ) : (
            <p>
              Mark <span className="font-bold" style={{ color: '#FBBF24' }}>{payItem.name}</span> as paid? (Total: ৳{payItem.amount.toLocaleString()})
            </p>
          )}
        </div>

        {/* Date picker */}
        <div className="mb-4">
          <label className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5 block ml-0.5" style={{ color: '#94A3B8' }}>
            Payment Date
          </label>
          <input
            type="date"
            value={payDate}
            onChange={e => setPayDate(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all"
            style={{
              backgroundColor: '#0A1525',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#F1F5F9',
              colorScheme: 'dark',
            }}
            onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#F59E0B'; }}
            onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
          />
        </div>

        {/* Payment splits */}
        <div className="space-y-3 mb-4">
          <label className="text-[10px] font-extrabold uppercase tracking-widest block ml-0.5" style={{ color: '#94A3B8' }}>
            Payment Method(s)
          </label>
          {paySplits.map((split, i) => (
            <div key={i} className="flex gap-2 items-center">
              {/* Method Select */}
              <div className="relative flex-1">
                <select
                  value={split.payment_method}
                  onChange={e => updateSplit(i, 'payment_method', e.target.value)}
                  className="w-full rounded-xl pl-3.5 pr-8 py-2.5 text-xs sm:text-sm font-semibold outline-none transition-all cursor-pointer"
                  style={{
                    backgroundColor: '#0A1525',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#F1F5F9',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                  }}
                  onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#F59E0B'; }}
                  onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  {paymentMethods.map(m => (
                    <option key={m.name} value={m.name} style={{ backgroundColor: '#0A1525', color: '#F1F5F9' }}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center" style={{ color: '#94A3B8' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Amount input */}
              <div className="relative w-28 sm:w-32 shrink-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black pointer-events-none" style={{ color: '#94A3B8' }}>৳</span>
                <input
                  type="number"
                  placeholder="0"
                  value={split.amount}
                  onChange={e => updateSplit(i, 'amount', e.target.value)}
                  className="w-full rounded-xl pl-7 pr-3 py-2.5 text-xs sm:text-sm font-semibold outline-none transition-all tabular-nums"
                  style={{
                    backgroundColor: '#0A1525',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#F1F5F9',
                  }}
                  onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#F59E0B'; }}
                  onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
              </div>

              {paySplits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSplit(i)}
                  className="p-2.5 rounded-xl transition-all shrink-0"
                  style={{ color: '#64748B', background: 'rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = '#F43F5E';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.12)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = '#64748B';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addSplit}
            className="text-xs font-bold transition-colors flex items-center gap-1.5 mt-2 py-1 px-2 rounded-lg"
            style={{ color: '#FBBF24', background: 'rgba(245,158,11,0.08)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.16)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.08)'; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Split Payment
          </button>
        </div>

        {/* Total Summary */}
        <div
          className="flex items-center justify-between py-3 mb-5 px-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Total Amount</span>
          <span
            className="text-sm font-black tabular-nums"
            style={{ color: splitTotal !== targetAmount ? '#F43F5E' : '#10B981' }}
          >
            ৳ {splitTotal.toLocaleString()}
            {splitTotal !== targetAmount && (
              <span className="text-[10px] ml-2 font-bold" style={{ color: '#94A3B8' }}>
                (Remaining: ৳ {targetAmount.toLocaleString()})
              </span>
            )}
          </span>
        </div>

        <div className="flex gap-2.5 justify-end">
          <button
            type="button"
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
            type="button"
            onClick={handleConfirmPay}
            disabled={payLoading}
            className="px-6 py-2.5 text-xs font-black rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#080E1A',
              boxShadow: '0 4px 16px rgba(245,158,11,0.25)',
            }}
          >
            {payLoading && (
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Confirm Pay
          </button>
        </div>
      </div>
    </div>
  );
}
