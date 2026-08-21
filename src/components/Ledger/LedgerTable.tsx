import React from 'react';
import { LedgerRow, LedgerEntry } from './types';

interface LedgerTableProps {
  rows: LedgerRow[];
  allMethods: string[];
  monthName: string;
  isScrolled: boolean;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  openModal: (type: 'expense' | 'cashin', date: string, entry?: LedgerEntry | null) => void;
}

// ── tiny inline SVG icons ────────────────────────────────────────────────────
const IconReceipt = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-3.5 h-3.5 mr-1 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconTrendDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-3.5 h-3.5 mr-1 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const IconTrendUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-3.5 h-3.5 mr-1 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconBalance = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-3.5 h-3.5 mr-1 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-3 h-3 mb-0.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconPencil = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconCreditCard = ({ method }: { method: string }) => {
  const lower = method.toLowerCase();
  if (lower === 'cash') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-3 h-3 mr-0.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-3 h-3 mr-0.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
};

export function LedgerTable({ rows, allMethods, monthName, isScrolled, handleScroll, openModal }: LedgerTableProps) {
  return (
    <div
      className={`h-full overflow-auto ledger-scroll ${isScrolled ? 'scroll-shadow-left' : ''}`}
      onScroll={handleScroll}
    >
      <table className="w-full min-w-max border-collapse border-b border-slate-800 text-xs md:text-[13px] bg-white text-slate-800">
        <thead className="sticky top-0 z-40 bg-white shadow-sm ring-1 ring-slate-800">
          <tr className="divide-x divide-slate-400 border-b border-slate-800 text-sm md:text-[15px]">
            <th className="sticky left-0 z-50 bg-white border-r border-slate-800 px-1 py-3 md:py-4 text-center font-bold text-slate-800">
              <span className="flex flex-col items-center gap-0.5">
                <IconCalendar />
                <span className="text-[10px] md:text-xs uppercase tracking-widest font-extrabold">Date</span>
              </span>
            </th>
            <th className="bg-[#4CE0D2] px-1 py-3 md:py-4 text-center font-bold text-black border-r border-slate-400">
              <span className="flex items-center justify-center gap-0.5 whitespace-nowrap">
                <IconTrendDown />
                <span>Expense Details</span>
              </span>
            </th>
            {allMethods.map(m => (
              <th key={`ex-h-${m}`} className="bg-[#4CE0D2] px-1 py-3 md:py-4 text-center font-bold text-black border-r border-slate-400 whitespace-nowrap">
                <span className="flex items-center justify-center">
                  <IconCreditCard method={m} />
                  {m}
                </span>
              </th>
            ))}
            <th className="bg-[#7895CB] px-1 py-3 md:py-4 text-center font-bold text-black border-r border-slate-800">
              <span className="flex items-center justify-center whitespace-nowrap">
                <IconReceipt />
                <span>Total Cost</span>
              </span>
            </th>
            <th className="bg-[#F4D160] px-1 py-3 md:py-4 text-center font-bold text-black border-r border-slate-400">
              <span className="flex items-center justify-center gap-0.5 whitespace-nowrap">
                <IconTrendUp />
                <span>Cash In Details</span>
              </span>
            </th>
            {allMethods.map(m => (
              <th key={`in-h-${m}`} className="bg-[#F4D160] px-1 py-3 md:py-4 text-center font-bold text-black border-r border-slate-400 whitespace-nowrap">
                <span className="flex items-center justify-center">
                  <IconCreditCard method={m} />
                  {m}
                </span>
              </th>
            ))}
            <th className="bg-[#7895CB] px-1 py-3 md:py-4 text-center font-bold text-black border-r border-slate-800">
              <span className="flex items-center justify-center whitespace-nowrap">
                <IconBalance />
                <span>Total Balance</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.index} className={`group hover:bg-slate-200/50 transition-colors divide-x divide-slate-400 ${r.isLast ? 'border-b border-slate-800' : 'border-b border-slate-300'}`}>
              {r.isFirst ? (
                <td rowSpan={r.rowCount} className="sticky left-0 z-30 bg-white border-r border-slate-800 px-1 py-2 text-center align-middle font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-slate-800">
                  <div className="flex flex-col items-center justify-center leading-tight gap-0.5">
                    <span className="text-sm md:text-base font-black text-slate-800 leading-none">{String(r.day).padStart(2, '0')}</span>
                    <span className="text-[9px] md:text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{monthName.substring(0, 3)}</span>
                  </div>
                </td>
              ) : (
                <td className="hidden"></td>
              )}

              {r.isExpStart ? (
                <td
                  rowSpan={r.expSpan}
                  className="bg-[#E6FAF8] px-1 py-0.5 cursor-pointer hover:bg-[#A3EBE4] transition-colors truncate max-w-27.5 md:max-w-40 align-middle text-slate-800"
                  onClick={() => openModal('expense', r.dateStr, r.exp)}
                  title={r.exp?.description}
                >
                  {r.exp ? (
                    <span className="flex items-center gap-1">
                      <span className="truncate flex-1">{r.exp.description}</span>
                      <IconPencil />
                    </span>
                  ) : (
                    <span className="flex items-center justify-center text-slate-300">
                      <IconPlus />
                    </span>
                  )}
                </td>
              ) : (
                r.expSpan === undefined ? null : <td className="hidden"></td>
              )}

              {allMethods.map(m => (
                r.isExpStart ? (
                  <td
                    key={`ex-${r.index}-${m}`}
                    rowSpan={r.expSpan}
                    className="bg-[#E6FAF8] px-1 py-0.5 text-center font-medium tabular-nums cursor-pointer hover:bg-[#A3EBE4] transition-colors align-middle text-slate-800"
                    onClick={() => !r.exp && openModal('expense', r.dateStr)}
                  >
                    {r.exp?.payment_method === m ? (
                      <span className="font-bold text-slate-700">{r.exp.amount.toLocaleString()}</span>
                    ) : ''}
                  </td>
                ) : (
                  r.expSpan === undefined ? null : <td key={`ex-${r.index}-${m}`} className="hidden"></td>
                )
              ))}

              {r.isFirst ? (
                <td rowSpan={r.rowCount} className="bg-[#E8EDF5] border-r-4 border-slate-800 px-1 py-0.5 text-center font-bold tabular-nums align-middle text-slate-800">
                  {(r.dailyExpenseTotal || 0) > 0 ? (r.dailyExpenseTotal || 0).toLocaleString() : '0'}
                </td>
              ) : (
                <td className="hidden"></td>
              )}

              {r.isIncStart ? (
                <td
                  rowSpan={r.incSpan}
                  className="bg-[#FDF9E6] px-1 py-0.5 cursor-pointer hover:bg-[#F9EAB3] transition-colors truncate max-w-27.5 md:max-w-40 align-middle text-slate-800"
                  onClick={() => openModal('cashin', r.dateStr, r.inc)}
                  title={r.inc?.description}
                >
                  {r.inc ? (
                    <span className="flex items-center gap-1">
                      <span className="truncate flex-1">{r.inc.description}</span>
                      <IconPencil />
                    </span>
                  ) : (
                    <span className="flex items-center justify-center text-slate-300">
                      <IconPlus />
                    </span>
                  )}
                </td>
              ) : (
                r.incSpan === undefined ? null : <td className="hidden"></td>
              )}

              {allMethods.map(m => (
                r.isIncStart ? (
                  <td
                    key={`in-${r.index}-${m}`}
                    rowSpan={r.incSpan}
                    className="bg-[#FDF9E6] px-1 py-0.5 text-center font-medium tabular-nums cursor-pointer hover:bg-[#F9EAB3] transition-colors align-middle text-slate-800"
                    onClick={() => !r.inc && openModal('cashin', r.dateStr)}
                  >
                    {r.inc?.payment_method === m ? (
                      <span className="font-bold text-slate-700">{r.inc.amount.toLocaleString()}</span>
                    ) : ''}
                  </td>
                ) : (
                  r.incSpan === undefined ? null : <td key={`in-${r.index}-${m}`} className="hidden"></td>
                )
              ))}
              {r.isFirst ? (
                <td rowSpan={r.rowCount} className={`bg-[#E8EDF5] border-r border-slate-800 px-1 py-0.5 text-center font-bold tabular-nums align-middle ${(r.dayEndBalance || 0) < 0 ? 'text-red-700' : 'text-slate-800'}`}>
                  {(r.dayEndBalance || 0).toLocaleString()}
                </td>
              ) : (
                <td className="hidden"></td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
