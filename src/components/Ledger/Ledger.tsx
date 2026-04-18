'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EntryForm } from '../EntryForm/EntryForm';
import { addEntry, updateEntry, deleteEntry, type EntryPayload } from '@/app/actions/ledger';
import { LedgerEntry, LedgerRow } from './types';
import { LedgerTable } from './LedgerTable';
import { LedgerCards } from './LedgerCards';

interface LedgerProps {
  initialData: {
    expenses: Record<string, LedgerEntry[]>;
    cashin: Record<string, LedgerEntry[]>;
    prevBalance: number;
  };
  paymentMethods: { _id?: string; id?: string; name: string; balance: number }[];
  initialMonth: number;
  initialYear: number;
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
}

function calculateSpans(entryCount: number, totalRows: number): number[] {
  if (entryCount === 0) return [totalRows];
  const baseSpan = Math.floor(totalRows / entryCount);
  const extra = totalRows % entryCount;
  const spans = new Array(entryCount).fill(baseSpan);
  for (let i = 0; i < extra; i++) {
    spans[i]++;
  }
  return spans;
}

export function Ledger({ initialData, paymentMethods, initialMonth, initialYear }: LedgerProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(() => new Date(initialYear, initialMonth, 1));
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [isScrolled, setIsScrolled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'cashin'>('expense');
  const [targetDate, setTargetDate] = useState('');
  const [editEntry, setEditEntry] = useState<LedgerEntry | null>(null);

  const [prevProps, setPrevProps] = useState({ initialMonth, initialYear });
  if (prevProps.initialMonth !== initialMonth || prevProps.initialYear !== initialYear) {
    setPrevProps({ initialMonth, initialYear });
    setCurrentDate(new Date(initialYear, initialMonth, 1));
  }

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

  const activeMethods = paymentMethods ? paymentMethods.map(pm => pm.name) : [];
  const historicalMethods = new Set<string>();

  if (initialData.expenses) {
    Object.values(initialData.expenses).flat().forEach((e: LedgerEntry) => historicalMethods.add(e.payment_method));
  }
  if (initialData.cashin) {
    Object.values(initialData.cashin).flat().forEach((c: LedgerEntry) => historicalMethods.add(c.payment_method));
  }

  const allMethodsSet = new Set([...activeMethods, ...historicalMethods]);
  const allMethods = Array.from(allMethodsSet).sort((a: string, b: string) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    if (aLower === 'cash') return -1;
    if (bLower === 'cash') return 1;
    return a.localeCompare(b);
  });

  const rows: LedgerRow[] = [];
  let runningBalance = Number(initialData.prevBalance);

  const totals = { exAll: 0, inAll: 0 };

  for (let day = 1; day <= daysInMonth; day++) {
    const padMonth = String(month + 1).padStart(2, '0');
    const padDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${padMonth}-${padDay}`;
    const dayName = new Date(year, month, day).toLocaleDateString('en-US', { weekday: 'short' });

    const expenses = initialData.expenses?.[dateStr] || [];
    const cashins = initialData.cashin?.[dateStr] || [];
    const rowCount = Math.max(1, expenses.length, cashins.length);

    const expSpans = calculateSpans(expenses.length, rowCount);
    const incSpans = calculateSpans(cashins.length, rowCount);

    let expIdx = 0;
    let expRowCounter = 0;
    let incIdx = 0;
    let incRowCounter = 0;
    let dailyExpenseTotal = 0;

    for (let i = 0; i < rowCount; i++) {
        const rowProps: Partial<LedgerRow> = {
          isFirst: i === 0,
          isLast: i === rowCount - 1,
          day, dayName, dateStr, rowCount,
          index: rows.length
        };

        if (expRowCounter === 0) {
            rowProps.exp = expenses[expIdx] || null;
            rowProps.expSpan = expSpans[expIdx];
            rowProps.isExpStart = true;
            expRowCounter = expSpans[expIdx];
            expIdx++;
        } else {
            rowProps.exp = null;
            rowProps.isExpStart = false;
            rowProps.expSpan = undefined;
        }
        expRowCounter--;

        if (incRowCounter === 0) {
            rowProps.inc = cashins[incIdx] || null;
            rowProps.incSpan = incSpans[incIdx];
            rowProps.isIncStart = true;
            incRowCounter = incSpans[incIdx];
            incIdx++;
        } else {
            rowProps.inc = null;
            rowProps.isIncStart = false;
            rowProps.incSpan = undefined;
        }
        incRowCounter--;

        const exp = rowProps.exp as LedgerEntry | null;
        const inc = rowProps.inc as LedgerEntry | null;
  
        if (exp) {
          const amt = Number(exp.amount);
          dailyExpenseTotal += amt;
          totals.exAll += amt;
          runningBalance -= amt;
        }
        if (inc) {
          const amt = Number(inc.amount);
          totals.inAll += amt;
          runningBalance += amt;
        }
  
        rows.push({ ...rowProps, currentBalance: runningBalance } as LedgerRow);
    }

    if (rows.length > 0) {
      const targetRow = rows[rows.length - rowCount];
      if (targetRow) {
        targetRow.dailyExpenseTotal = dailyExpenseTotal;
        targetRow.dayEndBalance = runningBalance;
      }
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled((e.target as HTMLDivElement).scrollLeft > 10);
  };

  const openModal = (type: 'expense' | 'cashin', date: string, entry: LedgerEntry | null = null) => {
    setModalType(type);
    setTargetDate(date);
    setEditEntry(entry);
    setModalOpen(true);
  };

  const handleEntrySubmit = async (type: 'expense' | 'cashin', payload: EntryPayload | EntryPayload[], id?: string) => {
    if (id) {
      const singlePayload = Array.isArray(payload) ? payload[0] : payload;
      await updateEntry(type, id, singlePayload);
    } else {
      await addEntry(type, payload);
    }
    setModalOpen(false);

    const firstPayload = Array.isArray(payload) ? payload[0] : (payload as EntryPayload);
    if (firstPayload?.date && typeof firstPayload.date === 'string') {
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
    <div className="h-full flex flex-col bg-[#0F172A] overflow-hidden">
      {/* Sub-header / Quick Actions */}
      <div
        className="px-4 md:px-10 py-2 bg-[#1E293B] border-b border-[#334155] flex flex-wrap items-center justify-between gap-3"
        style={{ animation: 'slide-in-top 0.3s ease-out both' }}
      >
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
          <h2 className="text-sm md:text-base font-bold text-[#F8FAFC] flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-6 bg-[#6366F1] rounded-full"></span>
            <span>Monthly Ledger</span>
          </h2>

          <div className="flex items-center bg-[#263347] rounded-full px-1.5 py-0.5 border border-[#334155] shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-[#334155] hover:text-[#F8FAFC] rounded-full transition-all text-[#94A3B8] active:scale-90"
              title="Previous Month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="px-2 md:px-4 font-bold text-xs md:text-sm min-w-[100px] md:min-w-[140px] text-center text-[#6366F1] whitespace-nowrap">
              {monthName} {year}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-[#334155] hover:text-[#F8FAFC] rounded-full transition-all text-[#94A3B8] active:scale-90"
              title="Next Month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex bg-[#0F172A] p-1 rounded-xl border border-[#334155]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-[#334155] shadow-sm text-[#F8FAFC]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
              title="Table View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9V7a1 1 0 011-1h5v8H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1V7a1 1 0 00-1-1h-4v8z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'card' ? 'bg-[#334155] shadow-sm text-[#F8FAFC]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
              title="Card View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleCurrentMonth}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#263347] text-[#6366F1] rounded-lg font-bold hover:bg-[#334155] hover:text-[#818CF8] transition-all text-xs border border-[#334155] shadow-sm active:scale-95"
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
          <LedgerTable 
            rows={rows} 
            allMethods={allMethods} 
            monthName={monthName} 
            isScrolled={isScrolled} 
            handleScroll={handleScroll} 
            openModal={openModal} 
          />
        ) : (
          <LedgerCards 
            rows={rows} 
            year={year} 
            monthName={monthName} 
            openModal={openModal} 
          />
        )}
      </div>

      <div className="bg-[#1E293B] border-t border-[#334155] py-2 px-3 md:px-10 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.3)] z-30 flex items-center justify-between gap-2 md:gap-4 overflow-hidden">
        <div className="flex gap-3 md:gap-8 border-r border-[#334155] pr-3 md:pr-8 h-full items-center shrink-0">
          <div className="flex flex-col">
            <span className="text-[9px] md:text-[10px] uppercase font-bold text-[#94A3B8] leading-tight">{monthName} Expense</span>
            <span className="text-xs md:text-lg font-black text-[#F43F5E]">৳{totals.exAll.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] md:text-[10px] uppercase font-bold text-[#94A3B8] leading-tight">{monthName} Cash In</span>
            <span className="text-xs md:text-lg font-black text-[#22C55E]">৳{totals.inAll.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar border-r border-[#334155] px-2 md:px-8">
          <div className="flex items-center gap-4 md:gap-8 justify-start md:justify-center">
            {paymentMethods.map(pm => (
              <div key={`footer-pm-${pm._id || pm.id}`} className="flex flex-col items-start md:items-end shrink-0">
                <span className="text-[8px] md:text-xs uppercase font-bold text-[#94A3B8] leading-none mb-0.5">{pm.name}</span>
                <span className="text-[11px] md:text-lg font-bold text-[#F8FAFC] whitespace-nowrap leading-none">৳{(Number(pm.balance) || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end pl-1 md:pl-0 shrink-0">
          <span className="text-[10px] md:text-xs uppercase font-bold text-[#6366F1] leading-tight">Total</span>
          <span className="text-sm md:text-3xl font-black text-[#F8FAFC] tracking-tight leading-tight whitespace-nowrap">
            ৳{paymentMethods.reduce((acc, pm) => acc + (Number(pm.balance) || 0), 0).toLocaleString()}
          </span>
        </div>
      </div>

      <EntryForm 
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
