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
      await updateMandatoryExpense(editId, { name: editName.trim(), amount: parseInt(editAmount, 10) });
      setItems(prev => prev.map(i => i._id === editId ? { ...i, name: editName.trim(), amount: parseInt(editAmount, 10) } : i));
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
      await payMandatoryExpense(
        item._id,
        validSplits.map(s => ({ payment_method: s.payment_method, amount: parseInt(s.amount, 10) })),
        payDate
      );
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, paid_on: payDate } : i));
      setPayItem(null); 
      router.refresh();
    } catch (e: unknown) { alert((e as Error).message); }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 sm:p-6 md:p-8 font-sans selection:bg-[#F59E0B]/30 selection:text-[#F59E0B]">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12"
          style={{ animation: 'fade-in-down 0.5s ease-out both' }}>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/" className="p-2 -ml-2 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] rounded-xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">Mandatory Expenses</h1>
            </div>
            <p className="text-[#94A3B8] text-sm ml-11">Manage your fixed monthly bills and subscriptions.</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="group px-6 py-3 bg-[#F59E0B] text-[#0F172A] text-sm font-bold rounded-2xl hover:bg-[#FBBF24] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New Expense
          </button>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {items.length === 0 && !showAdd && (
            <div className="py-16 text-center bg-[#1E293B] border border-dashed border-[#334155] rounded-2xl"
              style={{ animation: 'slide-in-up 0.5s ease-out both', animationDelay: '100ms' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-[#94A3B8] font-medium">No mandatory expenses yet.</p>
              <p className="text-[#475569] text-sm mt-1">Add your recurring monthly bills to track them.</p>
            </div>
          )}

          {items.map((item, index) => (
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
