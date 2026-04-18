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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 box-border w-full flex flex-col">
      <div className="bg-[#1E293B] md:bg-transparent border border-[#334155] md:border-transparent rounded-3xl p-6 sm:p-0 flex-1 flex flex-col min-h-0 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">Payment Methods</h2>
            <p className="text-sm text-[#94A3B8]">Configure where your money comes from and goes to.</p>
          </div>
          <button
            onClick={() => {
              setIsAddingMethod(!isAddingMethod);
              setNewMethodName('');
            }}
            className={`${isAddingMethod ? 'btn-outline' : 'btn-primary'} !px-4 !py-2 !rounded-xl !text-xs !font-bold flex items-center gap-2`}
          >
            {isAddingMethod ? (
              <>Cancel</>
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

        {/* Add Method Inline Form */}
        {isAddingMethod && (
          <form
            onSubmit={handleAddMethod}
            className="mb-8 p-6 bg-[#263347] rounded-2xl border border-[#334155]"
            style={{ animation: 'slide-in-up 0.3s ease-out both' }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Label Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bank, Mobile Wallet..."
                  className="input-dark w-full px-5 py-3 !text-sm"
                  value={newMethodName}
                  onChange={(e) => setNewMethodName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <button type="submit" disabled={isSavingMethod} className="btn-primary flex items-center justify-center !py-3 w-full md:w-auto px-10 disabled:opacity-80 disabled:cursor-wait">
                {isSavingMethod ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {paymentMethods.map((pm, index) => (
            <div
              key={pm._id || pm.id}
              className="group relative p-5 md:p-6 bg-[#263347] border border-[#334155] rounded-2xl md:rounded-3xl flex items-center gap-5 hover:border-[#6366F1]/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 interactive-card"
              style={{
                animation: 'slide-in-up 0.4s ease-out both',
                animationDelay: `${index * 70}ms`,
                opacity: deletingMethodId === (pm._id || pm.id) ? 0.4 : undefined,
                transform: deletingMethodId === (pm._id || pm.id) ? 'scale(0.96)' : undefined,
                pointerEvents: deletingMethodId === (pm._id || pm.id) ? 'none' : undefined,
                transition: deletingMethodId === (pm._id || pm.id) ? 'opacity 0.25s ease, transform 0.25s ease' : undefined,
              }}
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#1E293B] text-[#6366F1] border border-[#334155] rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-[#6366F1] group-hover:text-white group-hover:border-[#6366F1] transition-all">
                {React.cloneElement(getMethodIcon(pm.name) as React.ReactElement<{ className?: string }>, {
                    className: "w-6 h-6"
                })}
              </div>
              <div className="flex-1 min-w-0 pr-6">
                {editingMethodId === (pm._id || pm.id) ? (
                  <div className="flex items-center w-full">
                    <input
                      className="w-full text-base md:text-lg font-black font-poppins border-b-2 border-[#6366F1] outline-none bg-transparent text-[#F8FAFC] pb-0.5 focus:border-[#818CF8] transition-colors"
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
                  <h4 className="font-black text-[#F8FAFC] text-base md:text-lg truncate font-poppins">{pm.name}</h4>
                )}
                <p className="text-xs md:text-sm font-black text-[#6366F1]">৳ {pm.balance.toLocaleString()}</p>
              </div>

              {/* 3-Dot Menu Dropdown */}
              <div className="absolute top-4 right-4 dropdown-container">
                <button
                  type="button"
                  onClick={() => setActiveDropdownId(activeDropdownId === (pm._id || pm.id) ? null : ((pm._id || pm.id) as string))}
                  className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>
                
                {activeDropdownId === (pm._id || pm.id) && (
                  <div className="absolute right-0 mt-1 w-24 bg-[#1E293B] border border-[#334155] rounded-xl shadow-xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMethodId((pm._id || pm.id) as string);
                        setEditMethodName(pm.name);
                        setActiveDropdownId(null);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#F8FAFC] hover:bg-[#263347] transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteMethod((pm._id || pm.id) as string);
                        setActiveDropdownId(null);
                      }}
                      disabled={deletingMethodId === (pm._id || pm.id)}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#F43F5E] hover:bg-[#F43F5E]/10 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    </div>
  );
}
