'use client';

import React, { useState } from 'react';
import { getContactHistory, deleteIOUContact } from '@/app/actions/iou';
import { deleteEntry } from '@/app/actions/ledger';
import { useRouter } from 'next/navigation';

interface IOUContact {
  _id: string;
  name: string;
  total_receivable: number;
  total_debt: number;
}

interface DebtReceivableCardProps {
  contact: IOUContact;
  iouType: 'receivable' | 'debt';
}

interface Transaction {
  _id: string;
  iou_type: string;
  iou_action: string;
  amount: number;
  details?: string;
  date: string;
  entry?: { _id?: string; type?: string; payment_method?: string } | string | null;
}

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  const day = d.getDate().toString().padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

export function DebtReceivableCard({ contact, iouType }: DebtReceivableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDeletingContact, setIsDeletingContact] = useState(false);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);
  const router = useRouter();

  const toggleExpand = async () => {
    if (!isExpanded && history.length === 0) {
      setLoading(true);
      const data = await getContactHistory(contact._id);
      setHistory(data);
      setLoading(false);
    }
    setIsExpanded(!isExpanded);
  };

  const handleDeleteContact = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${contact.name} and all their transaction history? Ledger recorded entries will stay but will no longer be linked.`)) {
      setIsDeletingContact(true);
      await deleteIOUContact(contact._id);
      setIsDeletingContact(false);
      router.refresh();
    }
  };

  const handleDelete = async (tx: Transaction) => {
    if (!confirm('Are you sure you want to delete this transaction record?')) {
      return;
    }

    const entryId = typeof tx.entry === 'object' && tx.entry !== null ? tx.entry._id : (typeof tx.entry === 'string' ? tx.entry : null);
    const entryType = typeof tx.entry === 'object' && tx.entry !== null ? tx.entry.type : null;

    if (!entryId) {
      alert('Cannot delete this record: associated ledger entry not found.');
      return;
    }

    try {
      setDeletingTxId(tx._id);
      await deleteEntry((entryType as 'expense' | 'cashin') || 'expense', entryId);
      const data = await getContactHistory(contact._id);
      setHistory(data);
      router.refresh();
    } catch (err: unknown) {
      alert(`Failed to delete transaction: ${(err as Error).message || 'Unknown error'}`);
    } finally {
      setDeletingTxId(null);
    }
  };

  const currentBalance = iouType === 'receivable' ? contact.total_receivable : contact.total_debt;
  const isReceivable = iouType === 'receivable';

  const accentColor = isReceivable ? '#10B981' : '#F43F5E';
  const accentLight = isReceivable ? '#34D399' : '#FB7185';
  const accentBorder = isReceivable ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)';

  const filteredHistory = history.filter((tx) => !tx.iou_type || tx.iou_type === iouType);

  return (
    <div
      className="rounded-3xl transition-all duration-300 overflow-hidden relative"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        backgroundColor: '#0F1929',
        border: isExpanded ? `1px solid ${accentBorder}` : '1px solid rgba(255,255,255,0.07)',
        boxShadow: isExpanded
          ? `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${accentBorder}`
          : '0 2px 12px rgba(0,0,0,0.3)',
      }}
    >
      {/* ── Card Header / Collapsed View ── */}
      <div
        className="p-5 md:p-6 flex items-center justify-between cursor-pointer group relative"
        onClick={toggleExpand}
      >
        {/* Delete button when balance is 0 */}
        {currentBalance === 0 && (
          <button
            onClick={handleDeleteContact}
            disabled={isDeletingContact}
            className="absolute top-3.5 right-3.5 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-80 disabled:cursor-wait"
            style={{
              color: '#94A3B8',
              background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.20)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#F43F5E';
              (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.18)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = '#94A3B8';
              (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)';
            }}
            title="Delete Person"
          >
            {isDeletingContact ? (
              <svg className="animate-spin h-4 w-4 text-[#F43F5E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        )}

        {/* Contact Name & Status */}
        <div className="space-y-1 pr-6 min-w-0">
          <h4
            className="text-lg sm:text-xl font-bold flex items-center gap-2.5 transition-colors truncate"
            style={{ color: '#F1F5F9' }}
          >
            <span className="truncate">{contact.name}</span>
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
            />
          </h4>
        </div>

        {/* Amount & Expand Toggle */}
        <div className="text-right flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="flex flex-col items-end">
            <p className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest mb-0.5 whitespace-nowrap" style={{ color: '#94A3B8' }}>
              Total Due
            </p>
            <p className="text-lg sm:text-2xl font-black whitespace-nowrap tabular-nums" style={{ color: accentLight }}>
              <span className="text-sm sm:text-lg font-bold mr-0.5">৳</span>
              {currentBalance.toLocaleString()}
            </p>
          </div>

          <div
            className="p-2 rounded-xl transition-all duration-300"
            style={{
              background: isExpanded ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
              color: isExpanded ? '#818CF8' : '#94A3B8',
              border: '1px solid rgba(255,255,255,0.06)',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Expanded History Panel ── */}
      {isExpanded && (
        <div
          className="px-5 pb-5 md:px-6 md:pb-6 pt-4"
          style={{
            backgroundColor: '#0A1525',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            animation: 'slide-in-up 0.25s ease-out both',
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#94A3B8' }}>
                Transaction History
              </h5>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6366F1]" />
              </div>
            ) : filteredHistory.length > 0 ? (
              <div className="space-y-2.5">
                {filteredHistory.map((tx) => {
                  const isOutflow = (iouType === 'receivable' && tx.iou_action === 'create') || (iouType === 'debt' && tx.iou_action === 'repay');
                  const txColor = isOutflow ? '#F43F5E' : '#10B981';
                  const txLight = isOutflow ? '#FB7185' : '#34D399';
                  const sign = isOutflow ? '-' : '+';

                  return (
                    <div
                      key={tx._id}
                      className="rounded-2xl p-3 sm:p-4 flex items-center justify-between transition-all duration-200 group/row relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                        backgroundColor: '#0F1929',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.25)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                    >
                      {/* Colored Left Accent Strip */}
                      <div
                        className="absolute top-0 left-0 w-1 h-full"
                        style={{ backgroundColor: txColor, opacity: 0.7 }}
                      />

                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pl-1">
                        {/* Icon Badge */}
                        <div
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: isOutflow ? 'rgba(244,63,94,0.10)' : 'rgba(16,185,129,0.10)',
                            color: txLight,
                            border: `1px solid ${isOutflow ? 'rgba(244,63,94,0.25)' : 'rgba(16,185,129,0.25)'}`,
                          }}
                        >
                          {isOutflow ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          )}
                        </div>

                        {/* Details & Date */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-0.5">
                            {tx.details && (
                              <p className="text-xs sm:text-sm font-bold truncate" style={{ color: '#F1F5F9' }}>
                                {tx.details}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md"
                                style={{
                                  background: 'rgba(255,255,255,0.04)',
                                  border: '1px solid rgba(255,255,255,0.06)',
                                  color: '#94A3B8',
                                }}
                              >
                                {formatDate(tx.date)}
                              </span>
                              {typeof tx.entry === 'object' && tx.entry?.payment_method && (
                                <span
                                  className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md"
                                  style={{
                                    background: 'rgba(99,102,241,0.10)',
                                    color: '#818CF8',
                                    border: '1px solid rgba(99,102,241,0.20)',
                                  }}
                                >
                                  {tx.entry.payment_method}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Tag & Amount */}
                      <div className="flex flex-col items-end gap-0.5 ml-3 shrink-0">
                        <span
                          className="px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-widest"
                          style={{
                            background: isOutflow ? 'rgba(244,63,94,0.10)' : 'rgba(16,185,129,0.10)',
                            color: txLight,
                            border: `1px solid ${isOutflow ? 'rgba(244,63,94,0.20)' : 'rgba(16,185,129,0.20)'}`,
                          }}
                        >
                          {iouType === 'receivable'
                            ? (tx.iou_action === 'create' ? 'Lent' : 'Returned')
                            : (tx.iou_action === 'create' ? 'Loaned' : 'Paid Off')
                          }
                        </span>
                        <p className="text-sm sm:text-lg font-black tabular-nums flex items-center gap-0.5" style={{ color: txLight }}>
                          {sign} <span className="text-xs sm:text-sm font-bold">৳</span>
                          {tx.amount.toLocaleString()}
                        </p>
                      </div>

                      {/* Delete Record Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(tx);
                        }}
                        disabled={deletingTxId === tx._id}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md transition-all opacity-0 group-hover/row:opacity-100 disabled:opacity-80 disabled:cursor-wait flex items-center justify-center"
                        style={{ color: '#64748B' }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.color = '#F43F5E';
                          (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.12)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.color = '#64748B';
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }}
                        title="Delete Record"
                      >
                        {deletingTxId === tx._id ? (
                          <svg className="animate-spin h-3.5 w-3.5 text-[#F43F5E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="py-6 text-center rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>No history available.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
