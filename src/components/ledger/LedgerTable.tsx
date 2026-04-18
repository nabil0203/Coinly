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

export function LedgerTable({ rows, allMethods, monthName, isScrolled, handleScroll, openModal }: LedgerTableProps) {
  return (
    <div
      className={`h-full overflow-auto ledger-scroll ${isScrolled ? 'scroll-shadow-left' : ''}`}
      onScroll={handleScroll}
    >
      <table className="w-full min-w-max border-collapse border-b border-slate-800 text-xs md:text-[13px] bg-white text-slate-800">
        <thead className="sticky top-0 z-40 bg-white shadow-sm ring-1 ring-slate-800">
          <tr className="divide-x divide-slate-400 border-b border-slate-800 text-sm md:text-[15px]">
            <th className="sticky left-0 z-50 bg-white border-r border-slate-800 px-1 py-3 md:px-1 md:py-4 text-center font-bold text-slate-800">Date</th>
            <th className="bg-[#4CE0D2] px-1 py-3 md:px-1 md:py-4 text-center font-bold text-black border-r border-slate-400">Expense Details</th>
            {allMethods.map(m => (
              <th key={`ex-h-${m}`} className="bg-[#4CE0D2] px-1 py-3 md:px-1 md:py-4 text-center font-bold text-black border-r border-slate-400 whitespace-nowrap">{m}</th>
            ))}
            <th className="bg-[#7895CB] px-1 py-3 md:px-1 md:py-4 text-center font-bold text-black border-r border-slate-800">Total Cost</th>
            <th className="bg-[#F4D160] px-1 py-3 md:px-1 md:py-4 text-center font-bold text-black border-r border-slate-400">Cash In Details</th>
            {allMethods.map(m => (
              <th key={`in-h-${m}`} className="bg-[#F4D160] px-1 py-3 md:px-1 md:py-4 text-center font-bold text-black border-r border-slate-400 whitespace-nowrap">{m}</th>
            ))}
            <th className="bg-[#7895CB] px-1 py-3 md:px-1 md:py-4 text-center font-bold text-black border-r border-slate-800">Total Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.index} className={`group hover:bg-slate-200/50 transition-colors divide-x divide-slate-400 ${r.isLast ? 'border-b border-slate-800' : 'border-b border-slate-300'}`}>
              {r.isFirst ? (
                <td rowSpan={r.rowCount} className="sticky left-0 z-30 bg-white border-r border-slate-800 px-1 py-0.5 md:px-1 md:py-0.5 text-center align-middle font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-slate-800">
                  <div className="flex flex-col items-center justify-center leading-tight">
                    <span className="text-sm md:text-base font-black text-slate-800">{String(r.day).padStart(2, '0')}</span>
                    <span className="text-xs md:text-sm font-semibold text-slate-500 tracking-tight">{monthName}</span>
                  </div>
                </td>
              ) : (
                <td className="hidden"></td>
              )}

              {r.isExpStart ? (
                <td
                  rowSpan={r.expSpan}
                  className="bg-[#E6FAF8] px-1 py-0.5 md:px-1 md:py-0.5 cursor-pointer hover:bg-[#A3EBE4] transition-colors truncate max-w-[110px] md:max-w-[160px] align-middle text-slate-800"
                  onClick={() => openModal('expense', r.dateStr, r.exp)}
                  title={r.exp?.description}
                >
                  {r.exp ? r.exp.description : null}
                </td>
              ) : (
                r.expSpan === undefined ? null : <td className="hidden"></td>
              )}

              {allMethods.map(m => (
                r.isExpStart ? (
                  <td 
                    key={`ex-${r.index}-${m}`} 
                    rowSpan={r.expSpan}
                    className="bg-[#E6FAF8] px-1 py-0.5 md:px-1 md:py-0.5 text-center font-medium tabular-nums cursor-pointer hover:bg-[#A3EBE4] transition-colors align-middle text-slate-800"
                    onClick={() => !r.exp && openModal('expense', r.dateStr)}
                  >
                    {r.exp?.payment_method === m ? r.exp.amount.toLocaleString() : ''}
                  </td>
                ) : (
                  r.expSpan === undefined ? null : <td key={`ex-${r.index}-${m}`} className="hidden"></td>
                )
              ))}

              {r.isFirst ? (
                <td rowSpan={r.rowCount} className="bg-[#E8EDF5] border-r-[4px] border-slate-800 px-1 py-0.5 md:px-1 md:py-0.5 text-center font-bold tabular-nums align-middle text-slate-800">
                  {(r.dailyExpenseTotal || 0) > 0 ? (r.dailyExpenseTotal || 0).toLocaleString() : '0'}
                </td>
              ) : (
                <td className="hidden"></td>
              )}

              {r.isIncStart ? (
                <td
                  rowSpan={r.incSpan}
                  className="bg-[#FDF9E6] px-1 py-0.5 md:px-1 md:py-0.5 cursor-pointer hover:bg-[#F9EAB3] transition-colors truncate max-w-[110px] md:max-w-[160px] align-middle text-slate-800"
                  onClick={() => openModal('cashin', r.dateStr, r.inc)}
                  title={r.inc?.description}
                >
                  {r.inc ? r.inc.description : null}
                </td>
              ) : (
                r.incSpan === undefined ? null : <td className="hidden"></td>
              )}

              {allMethods.map(m => (
                r.isIncStart ? (
                  <td 
                    key={`in-${r.index}-${m}`} 
                    rowSpan={r.incSpan}
                    className="bg-[#FDF9E6] px-1 py-0.5 md:px-1 md:py-0.5 text-center font-medium tabular-nums cursor-pointer hover:bg-[#F9EAB3] transition-colors align-middle text-slate-800"
                    onClick={() => !r.inc && openModal('cashin', r.dateStr)}
                  >
                    {r.inc?.payment_method === m ? r.inc.amount.toLocaleString() : ''}
                  </td>
                ) : (
                  r.incSpan === undefined ? null : <td key={`in-${r.index}-${m}`} className="hidden"></td>
                )
              ))}
              {r.isFirst ? (
                <td rowSpan={r.rowCount} className={`bg-[#E8EDF5] border-r border-slate-800 px-1 py-0.5 md:px-1 md:py-0.5 text-center font-bold tabular-nums align-middle ${(r.dayEndBalance || 0) < 0 ? 'text-red-700' : 'text-slate-800'}`}>
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
