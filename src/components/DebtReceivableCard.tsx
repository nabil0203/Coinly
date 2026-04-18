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
  const monthNames = ["Jan", "Feb", "Mar", "April", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
  const labelColor = iouType === 'receivable' ? 'text-[#22C55E]' : 'text-[#F43F5E]';
  const dotColor = iouType === 'receivable' ? 'bg-[#22C55E]' : 'bg-[#F43F5E]';

  const filteredHistory = history.filter((tx) => !tx.iou_type || tx.iou_type === iouType);

  return (
    <div className={`rounded-3xl border border-[#334155] bg-[#1E293B] overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]' : 'shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)]'}`} style={isExpanded ? {outline:'2px solid rgba(99,102,241,0.3)', outlineOffset:'0px'} : {}}>
      <div
        className="p-6 md:p-8 flex items-center justify-between cursor-pointer group relative"
        onClick={toggleExpand}
      >
        {currentBalance === 0 && (
          <button
            onClick={handleDeleteContact}
            disabled={isDeletingContact}
            className="absolute top-4 right-4 p-2 text-[#94A3B8] hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-80 disabled:cursor-wait"
            title="Delete Person"
          >
            {isDeletingContact ? (
              <svg className="animate-spin h-5 w-5 text-[#F43F5E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        )}
        <div className="space-y-1.5 pr-8">
          <h4 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2 group-hover:text-[#6366F1] transition-colors">
            {contact.name}
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
          </h4>
        </div>
        <div className="text-right flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="flex flex-col items-end">
            <p className="text-[9px] md:text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-0.5 whitespace-nowrap">Total Due</p>
            <p className={`text-xl md:text-2xl font-black ${labelColor} whitespace-nowrap flex items-center gap-1`}>
              <span className="text-lg md:text-xl">৳</span>
              {currentBalance.toLocaleString()}
            </p>
          </div>
          <div className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-[#6366F1]/15 text-[#6366F1] rotate-180' : 'bg-[#263347] text-[#94A3B8] group-hover:bg-[#6366F1]/10 group-hover:text-[#6366F1]'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 md:px-8 md:pb-8 border-t border-[#334155] bg-[#0F172A] animate-in slide-in-from-top-4 duration-300">
          <div className="pt-6 space-y-4">
            <h5 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-4">History</h5>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6366F1]"></div>
              </div>
            ) : filteredHistory.length > 0 ? (
              <div className="space-y-3">
                {filteredHistory.map((tx) => {
                  const isOutflow = (iouType === 'receivable' && tx.iou_action === 'create') || (iouType === 'debt' && tx.iou_action === 'repay');
                  const amountColor = isOutflow ? 'text-[#F43F5E]' : 'text-[#22C55E]';
                  const sign = isOutflow ? '-' : '+';

                  return (
                    <div key={tx._id} className="bg-[#263347] border border-[#334155] rounded-[1.25rem] p-3 sm:p-5 flex items-center justify-between hover:border-[#6366F1]/30 transition-all duration-300 group/row relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1 h-full opacity-60 ${isOutflow ? 'bg-[#F43F5E]' : 'bg-[#22C55E]'}`}></div>

                      <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${isOutflow ? 'bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/20' : 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20'}`}>
                          {isOutflow ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-0.5 sm:gap-1">
                            {tx.details && (
                              <p className="text-sm sm:text-lg font-black text-[#F8FAFC] leading-tight tracking-tight truncate">
                                {tx.details}
                              </p>
                            )}
                            <div className="flex items-center mt-1">
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#334155] bg-[#1E293B]">
                                <span className="text-[10px] sm:text-xs text-[#94A3B8] font-bold whitespace-nowrap">
                                  {formatDate(tx.date)}
                                </span>
                                {typeof tx.entry === 'object' && tx.entry?.payment_method && (
                                  <>
                                    <span className="text-[10px] text-[#475569]">•</span>
                                    <span className="text-[9px] sm:text-[10px] text-[#94A3B8] font-black uppercase tracking-tight">{tx.entry.payment_method}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-0.5 sm:gap-1 ml-4 shrink-0">
                        <span className={`px-2 py-0.5 rounded-[4px] text-[8px] sm:text-[10px] font-black uppercase tracking-widest border ${isOutflow ? 'bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/20' : 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20'}`}>
                          {iouType === 'receivable'
                            ? (tx.iou_action === 'create' ? 'Lent' : 'Returned')
                            : (tx.iou_action === 'create' ? 'Loaned' : 'Paid Off')
                          }
                        </span>
                        <p className={`text-base sm:text-2xl font-black tabular-nums transition-transform group-hover/row:scale-105 origin-right flex items-center gap-0.5 ${amountColor}`}>
                          {sign} <span className="text-sm sm:text-xl">৳</span>
                          {tx.amount.toLocaleString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(tx);
                        }}
                        disabled={deletingTxId === tx._id}
                        className="absolute top-1 right-2 p-1.5 text-[#94A3B8] hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-md transition-all opacity-0 group-hover/row:opacity-100 disabled:opacity-80 disabled:cursor-wait flex items-center justify-center"
                        title="Delete Record"
                      >
                        {deletingTxId === tx._id ? (
                          <svg className="animate-spin h-4 w-4 text-[#F43F5E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center bg-[#1E293B] rounded-2xl border border-dashed border-[#334155]">
                <p className="text-sm text-[#94A3B8] font-medium">No history available.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
