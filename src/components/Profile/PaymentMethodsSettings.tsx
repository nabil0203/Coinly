'use client';

import React, { useState, useEffect } from 'react';
import { getMethodIcon } from '@/utils/icons';

interface PaymentMethod {
  _id?: string;
  id?: string;
  name: string;
  balance: number;
}

interface PaymentMethodsSettingsProps {
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (name: string, balance?: number) => Promise<unknown>;
  renamePaymentMethod: (id: string, newName: string) => Promise<unknown>;
  deletePaymentMethod: (id: string) => Promise<unknown>;
}

export function PaymentMethodsSettings({ paymentMethods, addPaymentMethod, renamePaymentMethod, deletePaymentMethod }: PaymentMethodsSettingsProps) {
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [newMethodName, setNewMethodName] = useState('');
  const [isSavingMethod, setIsSavingMethod] = useState(false);

  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [editMethodName, setEditMethodName] = useState('');
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);
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

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethodName.trim()) return;
    setIsSavingMethod(true);
    try {
      await addPaymentMethod(newMethodName.trim());
      setNewMethodName('');
      setIsAddingMethod(false);
    } catch (err: unknown) {
      alert(`Failed to add payment method: ${(err as Error).message || 'Unknown error'}`);
    }
    setIsSavingMethod(false);
  };

  const handleRenameMethod = async (id: string) => {
    if (!editMethodName.trim()) return;
    try {
      await renamePaymentMethod(id, editMethodName.trim());
      setEditingMethodId(null);
    } catch (err: unknown) {
      alert(`Failed to rename payment method: ${(err as Error).message || 'Unknown error'}`);
    }
  };

  const handleDeleteMethod = async (id: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      setDeletingMethodId(id);
      try {
        await deletePaymentMethod(id);
      } catch (err: unknown) {
        alert(`Failed to delete payment method: ${(err as Error).message || 'Unknown error'}`);
      }
      setDeletingMethodId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8" style={{ animation: 'slide-in-up 0.4s ease-out both' }}>
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-black" style={{ color: '#F1F5F9' }}>Payment Methods</h2>
          <p className="text-xs sm:text-sm" style={{ color: '#94A3B8' }}>Configure your accounts and wallets.</p>
        </div>
        <button
          onClick={() => {
            setIsAddingMethod(!isAddingMethod);
            setNewMethodName('');
          }}
          className="px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
          style={{
            background: isAddingMethod ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            color: isAddingMethod ? '#94A3B8' : '#FFFFFF',
            border: isAddingMethod ? '1px solid rgba(255,255,255,0.08)' : 'none',
            boxShadow: isAddingMethod ? 'none' : '0 4px 16px rgba(99,102,241,0.30)',
          }}
        >
          {isAddingMethod ? (
            'Cancel'
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Method
            </>
          )}
        </button>
      </div>

      {/* ── Add Method Inline Form ── */}
      {isAddingMethod && (
        <form
          onSubmit={handleAddMethod}
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
                Account / Wallet Name
              </label>
              <input
                type="text"
                placeholder="e.g. Bank, Mobile Wallet, Crypto..."
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all"
                style={{
                  backgroundColor: '#080E1A',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#F1F5F9',
                }}
                onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6366F1'; }}
                onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                value={newMethodName}
                onChange={(e) => setNewMethodName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSavingMethod}
              className="px-6 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(99,102,241,0.30)',
              }}
            >
              {isSavingMethod ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Method'
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── Methods Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethods.map((pm, index) => (
          <div
            key={pm._id || pm.id}
            className="group relative p-4 sm:p-5 rounded-2xl flex items-center gap-4 transition-all duration-300"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)',
              backgroundColor: '#0A1525',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              animation: 'slide-in-up 0.35s ease-out both',
              animationDelay: `${index * 60}ms`,
              opacity: deletingMethodId === (pm._id || pm.id) ? 0.3 : undefined,
              transform: deletingMethodId === (pm._id || pm.id) ? 'scale(0.96)' : undefined,
              pointerEvents: deletingMethodId === (pm._id || pm.id) ? 'none' : undefined,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.35)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
              (e.currentTarget as HTMLElement).style.transform = '';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            }}
          >
            {/* Method Icon */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all"
              style={{
                background: 'rgba(99,102,241,0.12)',
                color: '#818CF8',
                border: '1px solid rgba(99,102,241,0.25)',
              }}
            >
              {React.cloneElement(getMethodIcon(pm.name) as React.ReactElement<{ className?: string }>, {
                className: "w-5 h-5"
              })}
            </div>

            <div className="flex-1 min-w-0 pr-6">
              {editingMethodId === (pm._id || pm.id) ? (
                <div className="flex items-center w-full">
                  <input
                    className="w-full text-sm font-black border-b-2 border-[#6366F1] outline-none bg-transparent pb-0.5 focus:border-[#818CF8] transition-colors"
                    style={{ color: '#F1F5F9' }}
                    value={editMethodName}
                    onChange={e => setEditMethodName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRenameMethod((pm._id || pm.id) as string);
                      if (e.key === 'Escape') setEditingMethodId(null);
                    }}
                    onBlur={() => {
                      if (editMethodName.trim() && editMethodName !== pm.name) {
                        handleRenameMethod((pm._id || pm.id) as string);
                      } else {
                        setEditingMethodId(null);
                      }
                    }}
                    autoFocus
                    spellCheck={false}
                  />
                </div>
              ) : (
                <h4 className="font-bold text-sm truncate" style={{ color: '#F1F5F9' }}>
                  {pm.name}
                </h4>
              )}
              <p className="text-xs font-black tabular-nums mt-0.5" style={{ color: '#818CF8' }}>
                ৳ {pm.balance.toLocaleString()}
              </p>
            </div>

            {/* 3-Dot Menu Dropdown */}
            <div className="absolute top-3.5 right-3.5 dropdown-container">
              <button
                type="button"
                onClick={() => setActiveDropdownId(activeDropdownId === (pm._id || pm.id) ? null : ((pm._id || pm.id) as string))}
                className="p-1 rounded-lg transition-colors cursor-pointer"
                style={{ color: '#64748B' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F1F5F9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B'; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>

              {activeDropdownId === (pm._id || pm.id) && (
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
                      setEditingMethodId((pm._id || pm.id) as string);
                      setEditMethodName(pm.name);
                      setActiveDropdownId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors flex items-center gap-2"
                    style={{ color: '#F1F5F9' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#818CF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteMethod((pm._id || pm.id) as string);
                      setActiveDropdownId(null);
                    }}
                    disabled={deletingMethodId === (pm._id || pm.id)}
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
    </div>
  );
}
