import React, { useState } from 'react';
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
  const isPaid = !!item.paid_on;

  return (
    <div
      className={`transition-all duration-300 ${isPaid ? 'opacity-60' : ''}`}
      style={{ animation: 'slide-in-up 0.4s ease-out both' }}
    >
      {isEditing ? (
        /* Edit Mode */
        <div className="bg-[#1E293B] border border-[#F59E0B]/50 shadow-[0_0_15px_rgba(245,158,11,0.1)] rounded-2xl p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={editName} onChange={e => onSetEditName(e.target.value)}
              className="bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] focus:border-[#F59E0B]/50 focus:outline-none" />
            <input type="number" value={editAmount} onChange={e => onSetEditAmount(e.target.value)}
              className="bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] focus:border-[#F59E0B]/50 focus:outline-none" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={onCancelEdit} className="px-3 py-1.5 text-xs text-[#94A3B8] border border-[#334155] rounded-lg">Cancel</button>
            <button onClick={onSaveEdit} disabled={savingEdit}
              className="px-4 py-1.5 text-xs font-bold bg-[#F59E0B] text-[#0F172A] rounded-lg disabled:opacity-50 flex items-center gap-1">
              {savingEdit && <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              Save
            </button>
          </div>
        </div>
      ) : (
        /* Display Mode */
        /* Display Mode */
        <div className="flex items-center gap-2 sm:gap-3 group">
          
          {/* Details Box */}
          <div className={`flex-1 min-w-0 bg-[#1E293B]/40 hover:bg-[#1E293B]/80 transition-colors border rounded-2xl p-3 sm:p-4 flex flex-row sm:grid sm:grid-cols-[1fr_120px_100px] items-center gap-3 sm:gap-6 ${isPaid ? 'border-[#22C55E]/20' : 'border-[#334155]/60 hover:border-[#334155]'}`}>
            
            {/* 1. Name */}
            <div className="flex-1 sm:flex-none flex items-center gap-3 min-w-0">
              <div className={`hidden sm:block w-2 h-2 rounded-full shrink-0 ${isPaid ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'}`} />
              <div className="min-w-0">
                <p className={`font-semibold text-sm sm:text-base truncate ${isPaid ? 'text-[#64748B] line-through' : 'text-[#F8FAFC]'}`}>{item.name}</p>
                {isPaid && item.paid_on && (
                  <p className="text-[10px] text-[#22C55E] font-medium mt-0.5">Paid on {formatDate(item.paid_on)}</p>
                )}
              </div>
            </div>

            {/* Mobile: Amount & Date */}
            <div className="sm:hidden shrink-0 flex flex-col items-end gap-0.5">
              <p className={`text-sm font-bold tabular-nums tracking-tight ${isPaid ? 'text-[#64748B]' : 'text-[#F8FAFC]'}`}>
                <span className="text-[10px] text-[#64748B] font-normal mr-0.5">৳</span>{item.amount.toLocaleString()}
              </p>
              <p className={`text-[10px] font-medium ${isPaid ? 'text-[#64748B]/50' : 'text-[#64748B]'}`}>
                {new Date().toLocaleString('en-US', { month: 'long' })}-{new Date().toLocaleString('en-US', { year: '2-digit' })}
              </p>
            </div>

            {/* 2. Amount (Desktop) */}
            <div className="hidden sm:flex justify-end items-center">
              <p className={`text-base font-semibold tabular-nums tracking-tight ${isPaid ? 'text-[#64748B]' : 'text-[#F8FAFC]'}`}>
                <span className="text-xs text-[#64748B] font-normal mr-1.5">৳</span>{item.amount.toLocaleString()}
              </p>
            </div>

            {/* 3. Date (Desktop) */}
            <div className="hidden sm:flex justify-end items-center">
              <p className={`text-sm font-medium ${isPaid ? 'text-[#64748B]/50' : 'text-[#64748B]'}`}>
                {new Date().toLocaleString('en-US', { month: 'long' })}-{new Date().toLocaleString('en-US', { year: '2-digit' })}
              </p>
            </div>

          </div>

          {/* Actions */}
          <div className="shrink-0 flex items-center justify-center gap-0.5 sm:gap-1.5">
            {isPaid ? (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <button onClick={() => onOpenPayDialog(item)}
                className="px-3 py-2 sm:px-8 sm:py-2.5 text-[10px] sm:text-sm font-bold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 rounded-xl hover:bg-[#F59E0B] hover:text-[#0F172A] hover:shadow-[0_4px_16px_rgba(245,158,11,0.2)] transition-all whitespace-nowrap tracking-wide">
                Mark Paid
              </button>
            )}

            {/* 3-dot menu */}
            <div className="relative">
              <button onClick={() => onToggleDropdown(activeDropdown === item._id ? null : item._id)} className="p-1.5 sm:p-2 text-[#475569] hover:text-[#F8FAFC] hover:bg-[#334155]/50 rounded-xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {activeDropdown === item._id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => onToggleDropdown(null)}></div>
                  <div className="absolute right-0 sm:right-auto sm:left-0 top-12 mt-1 w-32 bg-[#1E293B] border border-[#334155] rounded-xl shadow-xl z-50 overflow-hidden" style={{ animation: 'fade-in 0.15s ease-out both' }}>
                    <button onClick={() => { onStartEdit(item); onToggleDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm text-[#F8FAFC] hover:bg-[#334155] transition-colors flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button onClick={() => onDelete(item._id)} disabled={deletingId === item._id} className="w-full text-left px-4 py-2.5 text-sm text-[#F43F5E] hover:bg-[#F43F5E]/10 transition-colors flex items-center gap-2 disabled:opacity-50">
                      {deletingId === item._id ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
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
