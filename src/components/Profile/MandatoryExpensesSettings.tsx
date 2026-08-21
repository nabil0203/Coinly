'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  addMandatoryExpense,
  updateMandatoryExpense,
  deleteMandatoryExpense,
  type MandatoryExpenseItem,
} from '@/app/actions/essentials';

interface MandatoryExpensesSettingsProps {
  initialItems: MandatoryExpenseItem[];
}

export function MandatoryExpensesSettings({ initialItems }: MandatoryExpensesSettingsProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);

  // Add form
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Edit inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 3-dot dropdown
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.dropdown-container')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAmount) return;
    setIsSaving(true);
    try {
      const newItem = await addMandatoryExpense({
        name: newName.trim(),
        amount: parseInt(newAmount, 10),
        default_payment_method: 'Cash',
      });
      setItems(prev => [...prev, newItem]);
      setNewName('');
      setNewAmount('');
      setIsAdding(false);
      router.refresh();
    } catch (err: unknown) {
      alert(`Failed to add expense: ${(err as Error).message || 'Unknown error'}`);
    }
    setIsSaving(false);
  };

  const handleRename = async (id: string) => {
    if (!editName.trim() || !editAmount) return;
    try {
      const parsedAmt = parseInt(editAmount, 10);
      await updateMandatoryExpense(id, { name: editName.trim(), amount: parsedAmt });
      setItems(prev => prev.map(i =>
        i._id === id ? { ...i, name: editName.trim(), amount: parsedAmt } : i
      ));
      setEditingId(null);
      router.refresh();
    } catch (err: unknown) {
      alert(`Failed to update expense: ${(err as Error).message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this mandatory expense?')) return;
    setDeletingId(id);
    try {
      await deleteMandatoryExpense(id);
      setItems(prev => prev.filter(i => i._id !== id));
      setActiveDropdownId(null);
      router.refresh();
    } catch (err: unknown) {
      alert(`Failed to delete expense: ${(err as Error).message || 'Unknown error'}`);
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8" style={{ animation: 'slide-in-up 0.4s ease-out both' }}>
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-black" style={{ color: '#F1F5F9' }}>Mandatory Expenses</h2>
          <p className="text-xs sm:text-sm" style={{ color: '#94A3B8' }}>Add or manage your recurring monthly bills.</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setNewName('');
            setNewAmount('');
          }}
          className="px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
          style={{
            background: isAdding ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            color: isAdding ? '#94A3B8' : '#FFFFFF',
            border: isAdding ? '1px solid rgba(255,255,255,0.08)' : 'none',
            boxShadow: isAdding ? 'none' : '0 4px 16px rgba(99,102,241,0.30)',
          }}
        >
          {isAdding ? (
            'Cancel'
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Expense
            </>
          )}
        </button>
      </div>

      {/* ── Add Inline Form ── */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="p-5 rounded-2xl space-y-4"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
            backgroundColor: '#0A1525',
            border: '1px solid rgba(99,102,241,0.30)',
            animation: 'slide-in-up 0.3s ease-out both',
          }}
        >
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1.5 w-full">
              <label className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: '#94A3B8' }}>
                Expense Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rent, Internet, Electricity..."
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all"
                style={{
                  backgroundColor: '#080E1A',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#F1F5F9',
                }}
                onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6366F1'; }}
                onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="w-full md:w-40 space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: '#94A3B8' }}>
                Monthly Amount (৳)
              </label>
              <input
                type="number"
                min="1"
                placeholder="0"
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all"
                style={{
                  backgroundColor: '#080E1A',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#F1F5F9',
                }}
                onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6366F1'; }}
                onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(99,102,241,0.30)',
              }}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Expense'
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── Expenses Grid ── */}
      {items.length === 0 && !isAdding ? (
        <div
          className="py-14 text-center rounded-2xl space-y-3"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.08)',
          }}
        >
          <div
            className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(99,102,241,0.10)',
              border: '1px solid rgba(99,102,241,0.20)',
              color: '#818CF8',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-sm font-bold" style={{ color: '#F1F5F9' }}>No mandatory expenses yet.</p>
          <p className="text-xs" style={{ color: '#94A3B8' }}>Click &quot;New Expense&quot; to add your recurring monthly bills.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <div
              key={item._id}
              className="group relative p-4 sm:p-5 rounded-2xl flex items-center gap-4 transition-all duration-300"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)',
                backgroundColor: '#0A1525',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                animation: 'slide-in-up 0.35s ease-out both',
                animationDelay: `${index * 60}ms`,
                opacity: deletingId === item._id ? 0.3 : undefined,
                transform: deletingId === item._id ? 'scale(0.96)' : undefined,
                pointerEvents: deletingId === item._id ? 'none' : undefined,
              }}
              onMouseEnter={e => {
                if (deletingId !== item._id) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.35)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                }
              }}
              onMouseLeave={e => {
                if (deletingId !== item._id) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                }
              }}
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(99,102,241,0.12)',
                  color: '#818CF8',
                  border: '1px solid rgba(99,102,241,0.25)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>

              <div className="flex-1 min-w-0 pr-6">
                {editingId === item._id ? (
                  <div className="space-y-1.5">
                    <input
                      className="w-full text-sm font-black border-b-2 outline-none bg-transparent pb-0.5 transition-colors"
                      style={{ color: '#F1F5F9', borderColor: '#6366F1' }}
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Expense name"
                      autoFocus
                      spellCheck={false}
                    />
                    <input
                      type="number"
                      min="1"
                      className="w-full text-xs font-bold border-b outline-none bg-transparent pb-0.5 transition-colors tabular-nums"
                      style={{ color: '#818CF8', borderColor: 'rgba(99,102,241,0.40)' }}
                      value={editAmount}
                      onChange={e => setEditAmount(e.target.value)}
                      placeholder="Monthly amount"
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(item._id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={() => {
                        if (editName.trim() && editAmount) {
                          handleRename(item._id);
                        } else {
                          setEditingId(null);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <h4 className="font-bold text-sm truncate" style={{ color: '#F1F5F9' }}>
                      {item.name}
                    </h4>
                    <p className="text-base font-black tabular-nums mt-0.5 tracking-tight" style={{ color: '#818CF8' }}>
                      ৳ {item.amount.toLocaleString()}<span className="font-semibold text-[10px]" style={{ color: '#94A3B8' }}>/mo</span>
                    </p>
                  </>
                )}
              </div>

              {/* 3-Dot Menu Dropdown */}
              <div className="absolute top-3.5 right-3.5 dropdown-container">
                <button
                  type="button"
                  onClick={() => setActiveDropdownId(activeDropdownId === item._id ? null : item._id)}
                  className="p-1 rounded-lg transition-colors cursor-pointer"
                  style={{ color: '#64748B' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F1F5F9'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B'; }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>

                {activeDropdownId === item._id && (
                  <div
                    className="absolute right-0 mt-1 w-28 rounded-xl shadow-2xl overflow-hidden z-20"
                    style={{
                      background: 'rgba(15,25,41,0.95)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                      animation: 'slide-in-up 0.15s ease-out both',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(item._id);
                        setEditName(item.name);
                        setEditAmount(String(item.amount));
                        setActiveDropdownId(null);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors flex items-center gap-2"
                      style={{ color: '#F1F5F9' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" style={{ color: '#818CF8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleDelete(item._id);
                        setActiveDropdownId(null);
                      }}
                      disabled={deletingId === item._id}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                      style={{ color: '#F43F5E' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.10)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
