'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EntryModal } from './EntryModal';
import { addEntry, updateEntry, deleteEntry } from '@/app/actions/ledger';

interface LedgerClientProps {
  initialData: {
    expenses: any;
    cashin: any;
    prevBalance: number;
  };
  paymentMethods: any[];
  initialMonth: number;
  initialYear: number;
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export function LedgerClient({ initialData, paymentMethods, initialMonth, initialYear }: LedgerClientProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(initialYear, initialMonth, 1));
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [isScrolled, setIsScrolled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'cashin'>('expense');
  const [targetDate, setTargetDate] = useState('');
  const [editEntry, setEditEntry] = useState<any>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentDate(new Date(initialYear, initialMonth, 1));
  }, [initialMonth, initialYear]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);

  const handlePrevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
    router.push(`/ledger?month=${prev.getMonth()}&year=${prev.getFullYear()}`);
  };

  const handleNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
    router.push(`/ledger?month=${next.getMonth()}&year=${next.getFullYear()}`);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setCurrentDate(now);
    router.push(`/ledger?month=${now.getMonth()}&year=${now.getFullYear()}`);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Determine all unique payment methods
  const activeMethods = paymentMethods ? paymentMethods.map(pm => pm.name) : [];
  const historicalMethods = new Set<string>();

  if (initialData.expenses) {
    Object.values(initialData.expenses).flat().forEach((e: any) => historicalMethods.add(e.payment_method));
  }
  if (initialData.cashin) {
    Object.values(initialData.cashin).flat().forEach((c: any) => historicalMethods.add(c.payment_method));
  }

  const allMethodsSet = new Set([...activeMethods, ...historicalMethods]);
  const allMethods = Array.from(allMethodsSet).sort((a: string, b: string) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    if (aLower === 'cash') return -1;
    if (bLower === 'cash') return 1;
    return a.localeCompare(b);
  });

  let rows: any[] = [];
  let runningBalance = Number(initialData.prevBalance);

  let totals = {
    exMethods: {} as Record<string, number>,
    inMethods: {} as Record<string, number>,
    exAll: 0,
    inAll: 0,
    runningBalance: 0
  };

  allMethods.forEach(m => {
    totals.exMethods[m] = 0;
    totals.inMethods[m] = 0;
  });

  let colorGroup = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const padMonth = String(month + 1).padStart(2, '0');
    const padDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${padMonth}-${padDay}`;
    const dayName = new Date(year, month, day).toLocaleDateString('en-US', { weekday: 'short' });

    const expenses = initialData.expenses?.[dateStr] || [];
    const cashins = initialData.cashin?.[dateStr] || [];
    const rowCount = Math.max(1, expenses.length, cashins.length);

    let dailyExpenseTotal = 0;

    for (let i = 0; i < rowCount; i++) {
        const exp = expenses[i] || null;
        const inc = cashins[i] || null;
  
        if (exp) {
          const amt = Number(exp.amount);
          dailyExpenseTotal += amt;
          totals.exAll += amt;
          if (totals.exMethods[exp.payment_method] !== undefined) {
            totals.exMethods[exp.payment_method] += amt;
          }
        }
        if (inc) {
          const amt = Number(inc.amount);
          totals.inAll += amt;
          if (totals.inMethods[inc.payment_method] !== undefined) {
            totals.inMethods[inc.payment_method] += amt;
          }
          runningBalance += amt;
        }
        if (exp) runningBalance -= Number(exp.amount);
  
        rows.push({
          isFirst: i === 0,
          isLast: i === rowCount - 1,
          colorGroup: colorGroup % 2 === 0 ? 'group-even' : 'group-odd',
          day, dayName, dateStr, rowCount,
          exp, inc,
          currentBalance: runningBalance,
          dailyExpenseTotal: i === 0 ? 0 : undefined,
          index: rows.length
        });
    }

    colorGroup++;

    if (rows.length > 0) {
      rows[rows.length - rowCount].dailyExpenseTotal = dailyExpenseTotal;
      rows[rows.length - rowCount].dayEndBalance = runningBalance;
    }
  }

  totals.runningBalance = runningBalance;

  const handleScroll = (e: any) => {
    setIsScrolled(e.target.scrollLeft > 10);
  };

  const openModal = (type: 'expense' | 'cashin', date: string, entry: any = null) => {
    setModalType(type);
    setTargetDate(date);
    setEditEntry(entry);
    setModalOpen(true);
  };

  const handleEntrySubmit = async (type: 'expense' | 'cashin', payload: any, id?: string) => {
    if (id) {
      await updateEntry(type, id, payload);
    } else {
      await addEntry(type, payload);
    }
    setModalOpen(false);

    const firstPayload = Array.isArray(payload) ? payload[0] : payload;
    if (firstPayload?.date) {
      const parts = firstPayload.date.split('-');
      if (parts.length >= 2) {
        const pYear = parseInt(parts[0], 10);
        const pMonth = parseInt(parts[1], 10) - 1;
        if (pYear !== currentDate.getFullYear() || pMonth !== currentDate.getMonth()) {
          router.push(`/ledger?month=${pMonth}&year=${pYear}`);
        }
      }
    }
  };

  const handleEntryDelete = async (type: 'expense' | 'cashin', id: string) => {
    await deleteEntry(type, id);
    setModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-100/50 overflow-hidden">
      {/* Sub-header / Quick Actions */}
      <div className="px-4 md:px-10 py-2 bg-white border-b border-fintech-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
          <h2 className="text-sm md:text-base font-bold text-fintech-text-main flex items-center gap-2 whitespace-nowrap">
            <div className="w-2 h-6 bg-fintech-primary rounded-full"></div>
            <span>Monthly Ledger</span>
          </h2>

          <div className="flex items-center bg-gray-100/80 rounded-full px-1.5 py-0.5 border border-gray-200 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white rounded-full transition-colors text-fintech-text-muted hover:text-fintech-primary"
              title="Previous Month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="px-2 md:px-4 font-bold text-xs md:text-sm min-w-[100px] md:min-w-[140px] text-center text-fintech-primary whitespace-nowrap">
              {monthName} {year}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-white rounded-full transition-colors text-fintech-text-muted hover:text-fintech-primary"
              title="Next Month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-fintech-primary' : 'text-fintech-text-muted'}`}
              title="Table View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9V7a1 1 0 011-1h5v8H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1V7a1 1 0 00-1-1h-4v8z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'card' ? 'bg-white shadow-sm text-fintech-primary' : 'text-fintech-text-muted'}`}
              title="Card View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleCurrentMonth}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-fintech-primary rounded-lg font-bold hover:bg-gray-200 transition-all text-xs border border-gray-200 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Current Month
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'table' ? (
          <div
            className={`h-full overflow-auto ledger-scroll ${isScrolled ? 'scroll-shadow-left' : ''}`}
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            <table className="w-full min-w-max border-collapse border-b border-slate-800 text-xs md:text-[13px] bg-white">
              <thead className="sticky top-0 z-40 bg-white shadow-sm ring-1 ring-slate-800">
                <tr className="divide-x divide-slate-400 border-b border-slate-800 text-sm md:text-[15px]">
                  <th className="sticky left-0 z-50 bg-white border-r border-slate-800 px-1 py-3 md:px-1 md:py-4 text-center font-bold">Date</th>
                  <th className="bg-[#4CE0D2] px-1 py-3 md:px-1 md:py-4 text-center font-bold text-black border-r border-slate-400">Expense Details</th>
                  {allMethods.map(m => (
                    <th key={`ex-h-${m}`} className="bg-[#4CE0D2] px-1 py-3 md:px-1 md:py-4 text-center font-bold text-black border-r border-slate-400 whitespace-nowrap">{m}</th>
                  ))}
                  <th className="bg-[#7895CB] px-1 py-3 md:px-1 md:py-4 text-center font-bold text-black border-r border-slate-800">Total Cost</th>
                  <th className="bg-[#F4D160] px-1 py-3 md:px-1 md:py-4 text-center font-bold text-black border-r border-slate-400">Cash In Details</th>
                  {allMethods.map(m => (
                    <th key={`in-h-${m}`} className="bg-[#F4D160] px-1 py-3 md:px-1 md:py-4 text-center font-bold text-black border-r border-slate-400 whitespace-nowrap">{m}</th>
                  ))}
                  <th className="bg-[#7895CB] px-1 py-3 md:px-1 md:py-4 text-center font-bold text-black border-r border-slate-800 text-white !text-black">Total Balance</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.index} className={`group hover:bg-slate-200/50 transition-colors divide-x divide-slate-400 ${r.isLast ? 'border-b border-slate-800' : 'border-b border-slate-300'}`}>
                    {r.isFirst ? (
                      <td rowSpan={r.rowCount} className="sticky left-0 z-30 bg-white border-r border-slate-800 px-1 py-0.5 md:px-1 md:py-0.5 text-center align-middle font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-slate-800">
                        <div className="flex flex-col items-center justify-center leading-tight">
                          <span className="text-sm md:text-base font-black">{String(r.day).padStart(2, '0')}</span>
                          <span className="text-xs md:text-sm font-semibold text-slate-500 tracking-tight">{monthName}</span>
                        </div>
                      </td>
                    ) : (
                      <td className="hidden"></td>
                    )}

                    <td
                      className="bg-[#E6FAF8] px-1 py-0.5 md:px-1 md:py-0.5 cursor-pointer hover:bg-[#A3EBE4] transition-colors truncate max-w-[110px] md:max-w-[160px]"
                      onClick={() => openModal('expense', r.dateStr, r.exp)}
                      title={r.exp?.description}
                    >
                      {r.exp ? r.exp.description : null}
                    </td>
                    {allMethods.map(m => (
                      <td 
                        key={`ex-${r.index}-${m}`} 
                        className="bg-[#E6FAF8] px-1 py-0.5 md:px-1 md:py-0.5 text-center font-medium tabular-nums cursor-pointer hover:bg-[#A3EBE4] transition-colors"
                        onClick={() => !r.exp && openModal('expense', r.dateStr)}
                      >
                        {r.exp?.payment_method === m ? r.exp.amount.toLocaleString() : ''}
                      </td>
                    ))}
                    {r.isFirst ? (
                      <td rowSpan={r.rowCount} className="bg-[#E8EDF5] border-r-[4px] border-slate-800 px-1 py-0.5 md:px-1 md:py-0.5 text-center font-bold tabular-nums align-middle text-slate-800">
                        {r.dailyExpenseTotal > 0 ? r.dailyExpenseTotal.toLocaleString() : '0'}
                      </td>
                    ) : (
                      <td className="hidden"></td>
                    )}

                    <td
                      className="bg-[#FDF9E6] px-1 py-0.5 md:px-1 md:py-0.5 cursor-pointer hover:bg-[#F9EAB3] transition-colors truncate max-w-[110px] md:max-w-[160px]"
                      onClick={() => openModal('cashin', r.dateStr, r.inc)}
                      title={r.inc?.description}
                    >
                      {r.inc ? r.inc.description : null}
                    </td>
                    {allMethods.map(m => (
                      <td 
                        key={`in-${r.index}-${m}`} 
                        className="bg-[#FDF9E6] px-1 py-0.5 md:px-1 md:py-0.5 text-center font-medium tabular-nums cursor-pointer hover:bg-[#F9EAB3] transition-colors"
                        onClick={() => !r.inc && openModal('cashin', r.dateStr)}
                      >
                        {r.inc?.payment_method === m ? r.inc.amount.toLocaleString() : ''}
                      </td>
                    ))}
                    {r.isFirst ? (
                      <td rowSpan={r.rowCount} className={`bg-[#E8EDF5] border-r border-slate-800 px-1 py-0.5 md:px-1 md:py-0.5 text-center font-bold tabular-nums align-middle ${r.dayEndBalance < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                        {r.dayEndBalance.toLocaleString()}
                      </td>
                    ) : (
                      <td className="hidden"></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-4 py-4 space-y-4">
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
                                <div className="card-label !text-green-500 text-[9px]">Income</div>
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
        )}
      </div>

      <div className="bg-white border-t border-fintech-border py-2 md:py-3 px-4 md:px-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30 flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-4 md:gap-8 flex-wrap">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[10px] uppercase font-bold text-fintech-text-muted">Monthly Expense</span>
            <span className="text-sm md:text-lg font-black text-fintech-expense-text">৳ {totals.exAll.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[10px] uppercase font-bold text-fintech-text-muted">Monthly Income</span>
            <span className="text-sm md:text-lg font-black text-fintech-income-text">৳ {totals.inAll.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-4 md:gap-8 items-center flex-wrap">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:flex items-center gap-x-6 gap-y-2 border-r border-gray-200 pr-4 md:pr-8">
            {paymentMethods.map(pm => (
              <div key={`footer-pm-${pm._id || pm.id}`} className="flex flex-col items-start md:items-end">
                <span className="text-[9px] md:text-xs uppercase font-bold text-fintech-text-muted">{pm.name}</span>
                <span className="text-xs md:text-lg font-black text-fintech-text-main whitespace-nowrap">৳ {(Number(pm.balance) || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] md:text-xs uppercase font-bold text-fintech-primary">Total Available Balance</span>
            <span className="text-lg md:text-3xl font-black text-fintech-text-main tracking-tight">
              ৳ {paymentMethods.reduce((acc, pm) => acc + (Number(pm.balance) || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <EntryModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSubmit={handleEntrySubmit}
        onDelete={handleEntryDelete}
        type={modalType}
        dateStr={targetDate}
        paymentMethods={paymentMethods}
        editEntry={editEntry}
      />
    </div>
  );
}
