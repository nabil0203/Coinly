'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  addMandatoryExpense,
  updateMandatoryExpense,
  deleteMandatoryExpense,
  payMandatoryExpense,
  type MandatoryExpenseItem,
} from '@/app/actions/essentials';

import { MandatoryExpenseRow } from './MandatoryExpenseRow';
import { MandatoryExpenseAddDialog } from './MandatoryExpenseAddDialog';
import { MandatoryExpensePayDialog } from './MandatoryExpensePayDialog';

interface PaymentMethod {
  _id?: string;
  id?: string;
  name: string;
  balance: number;
}

interface PaySplit {
  payment_method: string;
  amount: string;
}

interface Props {
  initialItems: MandatoryExpenseItem[];
  paymentMethods: PaymentMethod[];
}

export function MandatoryExpensePage({ initialItems, paymentMethods }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const defaultMethod = paymentMethods[0]?.name || '';

  // Add form
  const [showAdd, setShowAdd] = useState(false);

  // Edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Pay confirm dialog
  const [payItem, setPayItem] = useState<MandatoryExpenseItem | null>(null);

  const handleAdd = async (name: string, amount: string) => {
    const newItem = await addMandatoryExpense({
      name: name.trim(),
      amount: parseInt(amount, 10),
      default_payment_method: defaultMethod || 'Cash'
    });
    setItems(prev => [...prev, newItem]);
    setShowAdd(false);
    router.refresh();
  };

  const startEdit = (item: MandatoryExpenseItem) => {
    setEditId(item._id);
    setEditName(item.name);
    setEditAmount(String(item.amount));
  };

  const saveEdit = async () => {
    if (!editId || !editName.trim() || !editAmount) return;
    setSavingEdit(true);
    try {
      const parsedAmt = parseInt(editAmount, 10);
      await updateMandatoryExpense(editId, { name: editName.trim(), amount: parsedAmt });
      setItems(prev => prev.map(i => {
        if (i._id === editId) {
          const newTotalDue = parsedAmt + (i.arrears || 0);
          const remaining = Math.max(0, newTotalDue - (i.paid_amount || 0));
          return {
            ...i,
            name: editName.trim(),
            amount: parsedAmt,
            total_due: newTotalDue,
            remaining_amount: remaining,
            is_fully_paid: (i.paid_amount || 0) >= newTotalDue,
          };
        }
        return i;
      }));
      setEditId(null);
      router.refresh();
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setSavingEdit(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this mandatory expense?')) return;
    setDeletingId(id);
    try {
      await deleteMandatoryExpense(id);
      setItems(prev => prev.filter(i => i._id !== id));
      setActiveDropdown(null);
      router.refresh();
    }
    catch (e: unknown) { alert((e as Error).message); }
    finally { setDeletingId(null); }
  };

  const confirmPay = async (item: MandatoryExpenseItem, validSplits: PaySplit[], payDate: string) => {
    try {
      const newlyPaid = validSplits.reduce((s, p) => s + (parseInt(p.amount, 10) || 0), 0);
      await payMandatoryExpense(
        item._id,
        validSplits.map(s => ({ payment_method: s.payment_method, amount: parseInt(s.amount, 10) })),
        payDate
      );
      setItems(prev => prev.map(i => {
        if (i._id === item._id) {
          const totalPaidNow = (i.paid_amount || 0) + newlyPaid;
          const targetDue = i.total_due || i.amount;
          const isFully = totalPaidNow >= targetDue;
          return {
            ...i,
            paid_amount: totalPaidNow,
            remaining_amount: Math.max(0, targetDue - totalPaidNow),
            is_fully_paid: isFully,
            paid_on: payDate,
          };
        }
        return i;
      }));
      setPayItem(null);
      router.refresh();
    } catch (e: unknown) { alert((e as Error).message); }
  };

  const totalMonthlyDue = items.reduce((acc, item) => acc + (Number(item.total_due ?? item.amount) || 0), 0);
  const totalPaid = items.reduce((acc, item) => acc + (Number(item.paid_amount) || 0), 0);
  const totalRemaining = Math.max(0, totalMonthlyDue - totalPaid);
  const totalArrears = items.reduce((acc, item) => acc + (Number(item.arrears) || 0), 0);

  return (
    <div className="h-full overflow-y-auto w-full relative" style={{ backgroundColor: '#080E1A' }}>
      {/* ── Background Ambient Glow Orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-[10%] -right-[5%] w-[60%] h-[60%]"
          style={{
            borderRadius: '9999px',
            filter: 'blur(130px)',
            background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, rgba(8,14,26,0) 70%)',
            animation: 'glow-breathe 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-[40%] -left-[10%] w-[55%] h-[55%]"
          style={{
            borderRadius: '9999px',
            filter: 'blur(140px)',
            background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, rgba(8,14,26,0) 70%)',
            animation: 'glow-breathe 7s ease-in-out infinite 1.5s',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto py-6 md:py-10 px-4 md:px-8 space-y-6 md:space-y-8">

        {/* ── Header ── */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ animation: 'slide-in-up 0.4s ease-out both' }}
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/"
                className="p-2 -ml-2 rounded-xl transition-all"
                style={{ color: '#94A3B8' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = '#F1F5F9';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = '#94A3B8';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
                title="Back to Dashboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#F1F5F9' }}>
                Mandatory <span style={{ color: '#F59E0B' }}>Expenses</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm ml-10" style={{ color: '#94A3B8' }}>
              Manage your recurring monthly bills with automatic carryover for unpaid balances.
            </p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="group px-5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] cursor-pointer shrink-0"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#080E1A',
              boxShadow: '0 4px 20px rgba(245,158,11,0.25)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(245,158,11,0.40)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(245,158,11,0.25)';
              (e.currentTarget as HTMLElement).style.transform = '';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New Expense
          </button>
        </div>

        {/* ── Summary Cards ── */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-3 md:gap-4" style={{ animation: 'slide-in-up 0.4s ease-out both', animationDelay: '60ms' }}>
            <div
              className="rounded-2xl p-3.5 sm:p-4 text-center sm:text-left"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                backgroundColor: '#0F1929',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-center gap-1.5 justify-center sm:justify-start mb-1">
                <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#94A3B8' }}>Total Due</p>
                {totalArrears > 0 && (
                  <span className="text-[8px] font-extrabold px-1 rounded bg-[#F59E0B]/15 text-[#F59E0B]">
                    +৳{totalArrears.toLocaleString()} past
                  </span>
                )}
              </div>
              <p className="text-base sm:text-xl font-black tabular-nums" style={{ color: '#F1F5F9' }}>৳ {totalMonthlyDue.toLocaleString()}</p>
            </div>
            <div
              className="rounded-2xl p-3.5 sm:p-4 text-center sm:text-left"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                backgroundColor: '#0F1929',
                border: '1px solid rgba(16,185,129,0.20)',
              }}
            >
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#34D399' }}>Paid This Month</p>
              <p className="text-base sm:text-xl font-black tabular-nums" style={{ color: '#10B981' }}>৳ {totalPaid.toLocaleString()}</p>
            </div>
            <div
              className="rounded-2xl p-3.5 sm:p-4 text-center sm:text-left"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                backgroundColor: '#0F1929',
                border: '1px solid rgba(245,158,11,0.20)',
              }}
            >
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#FBBF24' }}>Remaining Due</p>
              <p className="text-base sm:text-xl font-black tabular-nums" style={{ color: '#F59E0B' }}>৳ {totalRemaining.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* ── Items List ── */}
        <div className="space-y-3" style={{ animation: 'slide-in-up 0.4s ease-out both', animationDelay: '120ms' }}>
          {items.length === 0 && !showAdd && (
            <div
              className="py-16 text-center rounded-3xl space-y-3"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed rgba(255,255,255,0.08)',
              }}
            >
              <div
                className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
                style={{
                  background: 'rgba(245,158,11,0.10)',
                  border: '1px solid rgba(245,158,11,0.20)',
                  color: '#F59E0B',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-base font-bold" style={{ color: '#F1F5F9' }}>No mandatory expenses yet.</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Add your recurring monthly bills to track them effortlessly.</p>
            </div>
          )}

          {items.map((item) => (
            <MandatoryExpenseRow
              key={item._id}
              item={item}
              isEditing={editId === item._id}
              editName={editName}
              editAmount={editAmount}
              savingEdit={savingEdit}
              deletingId={deletingId}
              activeDropdown={activeDropdown}
              onSetEditName={setEditName}
              onSetEditAmount={setEditAmount}
              onStartEdit={startEdit}
              onCancelEdit={() => setEditId(null)}
              onSaveEdit={saveEdit}
              onDelete={handleDelete}
              onOpenPayDialog={setPayItem}
              onToggleDropdown={setActiveDropdown}
            />
          ))}
        </div>
      </div>

      <MandatoryExpenseAddDialog
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={handleAdd}
      />

      <MandatoryExpensePayDialog
        payItem={payItem}
        paymentMethods={paymentMethods}
        defaultMethod={defaultMethod}
        onClose={() => setPayItem(null)}
        onConfirmPay={confirmPay}
      />

    </div>
  );
}
