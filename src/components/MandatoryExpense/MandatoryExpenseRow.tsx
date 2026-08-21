import React from 'react';
import { MandatoryExpenseItem } from '@/app/actions/essentials';

interface MandatoryExpenseRowProps {
  item: MandatoryExpenseItem;
  onOpenPayDialog: (item: MandatoryExpenseItem) => void;
}

const formatDate = (d: string) => {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function MandatoryExpenseRow({ item, onOpenPayDialog }: MandatoryExpenseRowProps) {
  const isFullyPaid = !!item.is_fully_paid;
  const targetDue = item.total_due !== undefined ? item.total_due : item.amount;
  const arrears = item.arrears || 0;
  const paidAmt = item.paid_amount || 0;
  const remainingAmt = item.remaining_amount !== undefined ? item.remaining_amount : Math.max(0, targetDue - paidAmt);
  const isPartial = !isFullyPaid && paidAmt > 0;
  const percentPaid = targetDue > 0 ? Math.min(100, Math.round((paidAmt / targetDue) * 100)) : 100;

  return (
    <div
      className={`transition-all duration-300 ${isFullyPaid ? 'opacity-75 hover:opacity-100' : ''}`}
      style={{ animation: 'slide-in-up 0.4s ease-out both' }}
    >
      <div className="flex items-center gap-2 sm:gap-3 group">

        {/* Details Box */}
        <div
          className="flex-1 min-w-0 rounded-2xl p-3.5 sm:p-4 flex flex-row sm:grid sm:grid-cols-[1fr_140px_110px] items-center gap-3 sm:gap-6 transition-all duration-200"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)',
            backgroundColor: '#0F1929',
            border: isFullyPaid
              ? '1px solid rgba(16,185,129,0.20)'
              : isPartial
                ? '1px solid rgba(245,158,11,0.30)'
                : arrears > 0
                  ? '1px solid rgba(245,158,11,0.20)'
                  : '1px solid rgba(255,255,255,0.07)',
          }}
          onMouseEnter={e => {
            if (!isFullyPaid) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.40)';
          }}
          onMouseLeave={e => {
            if (!isFullyPaid) (e.currentTarget as HTMLElement).style.borderColor = isPartial ? 'rgba(245,158,11,0.30)' : (arrears > 0 ? 'rgba(245,158,11,0.20)' : 'rgba(255,255,255,0.07)');
          }}
        >
          {/* 1. Name, Arrears Badge & Progress */}
          <div className="flex-1 sm:flex-none flex items-center gap-3 min-w-0">
            <div
              className="hidden sm:block w-2 h-2 rounded-full shrink-0"
              style={{
                backgroundColor: isFullyPaid ? '#10B981' : isPartial ? '#FBBF24' : arrears > 0 ? '#F59E0B' : '#6366F1',
                boxShadow: isFullyPaid ? '0 0 8px #10B981' : isPartial ? '0 0 8px #FBBF24' : arrears > 0 ? '0 0 8px #F59E0B' : '0 0 8px #6366F1',
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p
                  className="font-bold text-sm sm:text-base truncate transition-colors"
                  style={{ color: isFullyPaid ? '#64748B' : '#F1F5F9', textDecoration: isFullyPaid ? 'line-through' : 'none' }}
                >
                  {item.name}
                </p>

                {arrears > 0 && !isFullyPaid && (
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap"
                    style={{
                      background: 'rgba(245,158,11,0.14)',
                      color: '#FBBF24',
                      border: '1px solid rgba(245,158,11,0.30)',
                    }}
                    title={`Base monthly: ৳${item.amount} + Past due: ৳${arrears}`}
                  >
                    +৳{arrears.toLocaleString()} past due
                  </span>
                )}

                {isPartial && (
                  <span
                    className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md shrink-0"
                    style={{
                      background: 'rgba(245,158,11,0.12)',
                      color: '#FBBF24',
                      border: '1px solid rgba(245,158,11,0.25)',
                    }}
                  >
                    {percentPaid}% Paid
                  </span>
                )}
              </div>

              {isFullyPaid && item.paid_on && (
                <p className="text-[10px] font-bold mt-0.5" style={{ color: '#10B981' }}>
                  Paid in full (৳{targetDue.toLocaleString()}) on {formatDate(item.paid_on)}
                </p>
              )}

              {!isFullyPaid && (
                <div className="mt-1 space-y-1">
                  <p className="text-[10px] font-semibold" style={{ color: '#94A3B8' }}>
                    {arrears > 0 ? (
                      <>Monthly ৳{item.amount.toLocaleString()} + Past ৳{arrears.toLocaleString()}</>
                    ) : (
                      <>Monthly ৳{item.amount.toLocaleString()}</>
                    )}
                    {paidAmt > 0 && (
                      <> • Paid: <span className="font-bold" style={{ color: '#10B981' }}>৳{paidAmt.toLocaleString()}</span></>
                    )}
                    <> • Due: <span className="font-bold" style={{ color: '#F59E0B' }}>৳{remainingAmt.toLocaleString()}</span></>
                  </p>
                  {isPartial && (
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percentPaid}%`,
                          background: 'linear-gradient(90deg, #F59E0B, #10B981)',
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Amount & Date */}
          <div className="sm:hidden shrink-0 flex flex-col items-end gap-0.5">
            <p
              className="text-sm font-black tabular-nums tracking-tight"
              style={{ color: isFullyPaid ? '#64748B' : '#F1F5F9' }}
            >
              <span className="text-[10px] font-bold mr-0.5" style={{ color: '#94A3B8' }}>৳</span>
              {targetDue.toLocaleString()}
            </p>
            <p className="text-[10px] font-medium" style={{ color: isFullyPaid ? '#475569' : '#94A3B8' }}>
              {new Date().toLocaleString('en-US', { month: 'short' })} {new Date().getFullYear()}
            </p>
          </div>

          {/* 2. Amount (Desktop) */}
          <div className="hidden sm:flex flex-col justify-center items-end">
            <p
              className="text-base font-bold tabular-nums tracking-tight"
              style={{ color: isFullyPaid ? '#64748B' : '#F1F5F9' }}
            >
              <span className="text-xs font-bold mr-1" style={{ color: '#94A3B8' }}>৳</span>
              {targetDue.toLocaleString()}
            </p>
            {arrears > 0 && !isFullyPaid && (
              <span className="text-[9px] font-semibold" style={{ color: '#94A3B8' }}>
                (৳{item.amount} + ৳{arrears})
              </span>
            )}
          </div>

          {/* 3. Date (Desktop) */}
          <div className="hidden sm:flex justify-end items-center">
            <p className="text-xs font-semibold" style={{ color: isFullyPaid ? '#475569' : '#94A3B8' }}>
              {new Date().toLocaleString('en-US', { month: 'short' })} {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Pay Action */}
        <div className="shrink-0 flex items-center justify-center">
          {isFullyPaid ? (
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.25)',
                color: '#10B981',
              }}
              title="Paid in Full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : isPartial ? (
            <button
              onClick={() => onOpenPayDialog(item)}
              className="px-3 py-2 sm:px-4 sm:py-2.5 text-[10px] sm:text-xs font-extrabold rounded-xl transition-all whitespace-nowrap active:scale-95 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#080E1A',
                boxShadow: '0 2px 12px rgba(245,158,11,0.25)',
              }}
              title="Pay remaining balance"
            >
              Pay ৳{remainingAmt.toLocaleString()}
            </button>
          ) : (
            <button
              onClick={() => onOpenPayDialog(item)}
              className="px-3 py-2 sm:px-5 sm:py-2.5 text-[10px] sm:text-xs font-extrabold rounded-xl transition-all whitespace-nowrap active:scale-95 cursor-pointer"
              style={{
                background: arrears > 0 ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : 'rgba(245,158,11,0.12)',
                color: arrears > 0 ? '#080E1A' : '#FBBF24',
                border: arrears > 0 ? 'none' : '1px solid rgba(245,158,11,0.25)',
                boxShadow: arrears > 0 ? '0 2px 12px rgba(245,158,11,0.25)' : 'none',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
                (e.currentTarget as HTMLElement).style.color = '#080E1A';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(245,158,11,0.30)';
              }}
              onMouseLeave={e => {
                if (arrears === 0) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.12)';
                  (e.currentTarget as HTMLElement).style.color = '#FBBF24';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }
              }}
            >
              {arrears > 0 ? `Pay ৳${targetDue.toLocaleString()}` : 'Mark Paid'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
