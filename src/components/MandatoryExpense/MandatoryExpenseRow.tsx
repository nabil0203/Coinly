import React from 'react';
import { MandatoryExpenseItem } from '@/app/actions/essentials';

interface MandatoryExpenseRowProps {
  item: MandatoryExpenseItem;
  isEditing: boolean;
  editName: string;
  editAmount: string;
  savingEdit: boolean;
  deletingId: string | null;
  activeDropdown: string | null;
  onSetEditName: (name: string) => void;
  onSetEditAmount: (amount: string) => void;
  onStartEdit: (item: MandatoryExpenseItem) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: (id: string) => void;
  onOpenPayDialog: (item: MandatoryExpenseItem) => void;
  onToggleDropdown: (id: string | null) => void;
}

const formatDate = (d: string) => {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function MandatoryExpenseRow({
  item,
  isEditing,
  editName,
  editAmount,
  savingEdit,
  deletingId,
  activeDropdown,
  onSetEditName,
  onSetEditAmount,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onOpenPayDialog,
  onToggleDropdown,
}: MandatoryExpenseRowProps) {
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
      {isEditing ? (
        /* ── Edit Mode ── */
        <div
          className="rounded-2xl p-4 sm:p-5 space-y-3"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
            backgroundColor: '#0F1929',
            border: '1px solid rgba(245,158,11,0.40)',
            boxShadow: '0 0 24px rgba(245,158,11,0.15)',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={editName}
              onChange={e => onSetEditName(e.target.value)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all"
              style={{
                backgroundColor: '#0A1525',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F1F5F9',
              }}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#F59E0B'; }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
              placeholder="Expense Name"
            />
            <input
              type="number"
              value={editAmount}
              onChange={e => onSetEditAmount(e.target.value)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all tabular-nums"
              style={{
                backgroundColor: '#0A1525',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F1F5F9',
              }}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#F59E0B'; }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
              placeholder="Monthly Base Amount"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancelEdit}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all"
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
              onClick={onSaveEdit}
              disabled={savingEdit}
              className="px-4 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#080E1A',
                boxShadow: '0 2px 12px rgba(245,158,11,0.25)',
              }}
            >
              {savingEdit && (
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        /* ── Display Mode ── */
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

                  {/* Arrears Indicator Badge */}
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

                  {/* Partial percentage badge */}
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
                        <> • Paid: <span className="font-bold text-[#10B981]">৳{paidAmt.toLocaleString()}</span></>
                      )}
                      <> • Due: <span className="font-bold text-[#F59E0B]">৳{remainingAmt.toLocaleString()}</span></>
                    </p>
                    {/* Mini progress bar if partial */}
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
                <span className="text-[9px] font-semibold text-[#94A3B8]">
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

          {/* Actions */}
          <div className="shrink-0 flex items-center justify-center gap-1 sm:gap-1.5">
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

            {/* 3-dot menu */}
            <div className="relative">
              <button
                onClick={() => onToggleDropdown(activeDropdown === item._id ? null : item._id)}
                className="p-2 rounded-xl transition-all"
                style={{ color: '#64748B' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = '#F1F5F9';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = '#64748B';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
                title="Options"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {activeDropdown === item._id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => onToggleDropdown(null)} />
                  <div
                    className="absolute right-0 sm:right-auto sm:left-0 top-11 mt-1 w-36 rounded-xl shadow-2xl z-50 overflow-hidden"
                    style={{
                      background: 'rgba(15,25,41,0.95)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                      animation: 'slide-in-up 0.18s ease-out both',
                    }}
                  >
                    <button
                      onClick={() => { onStartEdit(item); onToggleDropdown(null); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2.5"
                      style={{ color: '#F1F5F9' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item._id)}
                      disabled={deletingId === item._id}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2.5 disabled:opacity-50"
                      style={{ color: '#F43F5E' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.10)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      {deletingId === item._id ? (
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
