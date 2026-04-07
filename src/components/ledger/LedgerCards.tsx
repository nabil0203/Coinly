import React from 'react';
import { LedgerRow, LedgerEntry } from './types';

interface LedgerCardsProps {
  rows: LedgerRow[];
  year: number;
  monthName: string;
  openModal: (type: 'expense' | 'cashin', date: string, entry?: LedgerEntry | null) => void;
}

export function LedgerCards({ rows, year, monthName, openModal }: LedgerCardsProps) {
  return (
    <div className="h-full overflow-y-auto w-full flex justify-center px-4 py-4">
      <div className="space-y-4 max-w-xl w-full">
        {Array.from(new Set(rows.filter(r => r.exp || r.inc).map(r => r.day))).map(dayNum => {
          const dayRows = rows.filter(r => r.day === dayNum && (r.exp || r.inc));
          const first = dayRows[0];
          const last = dayRows[dayRows.length - 1];

          return (
            <div key={`card-${dayNum}`} className="ledger-card !mb-0">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-fintech-primary text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    {first.day}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-fintech-text-main">{first.dayName}</div>
                    <div className="text-[10px] text-fintech-text-muted">{String(first.day).padStart(2, '0')} {monthName.substring(0, 3)} {year}</div>
                  </div>
                </div>
                <div className={`text-sm font-black ${last.currentBalance < 0 ? 'text-red-600' : 'text-fintech-primary'}`}>
                  ৳ {last.currentBalance.toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                {dayRows.map((r, idx) => (
                  <React.Fragment key={`entry-${idx}`}>
                    {r.exp && (
                      <div className="bg-red-50/30 p-2 rounded-lg border border-red-50 cursor-pointer" onClick={() => openModal('expense', r.dateStr, r.exp)}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="card-label !text-red-500 text-[9px]">Expense</div>
                            <div className="text-sm font-medium text-fintech-text-main">{r.exp.description}</div>
                            <div className="text-[10px] text-fintech-text-muted">{r.exp.payment_method}</div>
                          </div>
                          <div className="text-sm font-bold text-fintech-expense-text">
                            - ৳ {Number(r.exp.amount).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}

                    {r.inc && (
                      <div className="bg-green-50/30 p-2 rounded-lg border border-green-50 cursor-pointer" onClick={() => openModal('cashin', r.dateStr, r.inc)}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="card-label !text-green-500 text-[9px]">Cash In</div>
                            <div className="text-sm font-medium text-fintech-text-main">{r.inc.description}</div>
                            <div className="text-[10px] text-fintech-text-muted">{r.inc.payment_method}</div>
                          </div>
                          <div className="text-sm font-bold text-fintech-income-text">
                            + ৳ {Number(r.inc.amount).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
