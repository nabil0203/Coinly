'use client';

import React, { useState } from 'react';
import { getContactHistory, deleteIOUContact } from '@/app/actions/iou';
import { deleteEntry } from '@/app/actions/ledger';

interface IOUContactCardProps {
  contact: any;
  iouType: 'receivable' | 'debt';
}

import { useRouter } from 'next/navigation';

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  const day = d.getDate().toString().padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "April", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

export function IOUContactCard({ contact, iouType }: IOUContactCardProps) {

  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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
      await deleteIOUContact(contact._id);
      router.refresh();
    }
  };

  const handleDelete = async (tx: any) => {
    // Fallback in case entry is not populated (string)
    const entryId = tx.entry?._id || (typeof tx.entry === 'string' ? tx.entry : null);
    const entryType = tx.entry?.type;

    if (!entryId) {
      alert('Cannot delete this record: associated ledger entry not found.');
      return;
    }

    try {
      // If type is missing, we try 'expense' as a reasonable guess for deletion logic
      await deleteEntry(entryType || 'expense', entryId);

      const data = await getContactHistory(contact._id);
      setHistory(data);
      router.refresh();
    } catch (err: any) {
      alert(`Failed to delete transaction: ${err.message || 'Unknown error'}`);
    }
  };

  const currentBalance = iouType === 'receivable' ? contact.total_receivable : contact.total_debt;
  const labelColor = iouType === 'receivable' ? 'text-green-600' : 'text-red-600';
  const bgColor = iouType === 'receivable' ? 'bg-green-50/50' : 'bg-red-50/50';

  return (
    <div className={`rounded-3xl border border-fintech-border bg-white shadow-fintech-card overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-purple-500/20 shadow-xl' : 'hover:shadow-lg'}`}>
      <div
        className="p-6 md:p-8 flex items-center justify-between cursor-pointer group relative"
        onClick={toggleExpand}
      >
        {currentBalance === 0 && (
          <button
            onClick={handleDeleteContact}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
            title="Delete Person"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
        <div className="space-y-1.5 pr-8">
          <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2 group-hover:text-purple-600 transition-colors">
            {contact.name}
            <div className={`w-1.5 h-1.5 rounded-full ${labelColor}`}></div>
          </h4>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase tracking-tight">
              {currentBalance === 0 ? 'Settled' : iouType === 'receivable' ? 'Active Collection' : 'Pending Debt'}
            </div>
          </div>
        </div>
        <div className="text-right flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="flex flex-col items-end">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 whitespace-nowrap">Total Due</p>
            <p className={`text-xl md:text-2xl font-black ${labelColor} whitespace-nowrap flex items-center gap-1`}>
              <span className="text-lg md:text-xl">৳</span>
              {currentBalance.toLocaleString()}
            </p>
          </div>
          <div className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-purple-100 text-purple-600 rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 md:px-8 md:pb-8 border-t border-slate-50 bg-slate-50/30 animate-in slide-in-from-top-4 duration-300">
          <div className="pt-6 space-y-4">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Transaction History</h5>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-3">
                {history.map((tx: any) => (
                  <div key={tx._id} className="bg-white border border-slate-100 rounded-[1.25rem] p-3 sm:p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 group/row relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${tx.iou_action === 'create' ? 'bg-purple-500' : 'bg-green-500'} opacity-50`}></div>
                    
                    <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${tx.iou_action === 'create' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
                        {tx.iou_action === 'create' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-0.5 sm:gap-1">
                          {tx.details && (
                            <p className="text-sm sm:text-lg font-black text-slate-800 leading-tight tracking-tight truncate">
                              {tx.details}
                            </p>
                          )}
                          <div className="flex items-center mt-1">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50/80 shadow-sm">
                               <span className="text-[10px] sm:text-xs text-slate-600 font-bold whitespace-nowrap">
                                 {formatDate(tx.date)}
                               </span>
                               {tx.entry?.payment_method && (
                                 <>
                                   <span className="text-[10px] text-slate-300">•</span>
                                   <span className="text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-tight">{tx.entry.payment_method}</span>
                                 </>
                               )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-0.5 sm:gap-1 ml-4 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${tx.iou_action === 'create' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                        {iouType === 'receivable' 
                          ? (tx.iou_action === 'create' ? 'Lent' : 'Returned')
                          : (tx.iou_action === 'create' ? 'Loaned' : 'Paid Off')
                        }
                      </span>
                      <p className={`text-base sm:text-2xl font-black tabular-nums transition-transform group-hover:scale-105 origin-right flex items-center gap-0.5 ${tx.iou_action === 'create' ? 'text-slate-900' : 'text-green-600'}`}>
                        {tx.iou_action === 'repay' ? '-' : ''}
                        <span className="text-sm sm:text-xl">৳</span> 
                        {tx.amount.toLocaleString()}
                      </p>
                    </div>

                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(tx);
                      }}
                      className="absolute top-1 right-2 p-1.5 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover/row:opacity-100"
                      title="Delete Record"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-white/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-400 font-medium">No history available.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
