'use client';

import React, { useState } from 'react';
import { PaymentMethodsGrid } from './FinancialSummary';
import { EntryModal } from './EntryModal';
import Link from 'next/link';
import { addEntry } from '@/app/actions/ledger';

interface HomeClientProps {
  displayName: string;
  paymentMethods: any[];
}

export function HomeClient({ displayName, paymentMethods }: HomeClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'cashin'>('expense');
  const [targetDate, setTargetDate] = useState('');

  const openModal = (type: 'expense' | 'cashin', date: string) => {
    setModalType(type);
    setTargetDate(date);
    setModalOpen(true);
  };

  const getLocalDateStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateStr();

  const handleEntrySubmit = async (type: 'expense' | 'cashin', payload: any) => {
    await addEntry(type, payload);
    setModalOpen(false);
  };

  return (
    <div className="h-full overflow-y-auto py-6 md:py-12 px-4 md:px-8 max-w-7xl mx-auto">
      
      <div className="mb-8 lg:mb-12 text-center lg:text-left animate-in slide-in-top duration-500">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-fintech-text-main tracking-tight leading-tight font-poppins">
          Welcome back, <span className="text-fintech-primary">{displayName}</span>!
        </h2>
        <p className="hidden lg:block text-fintech-text-muted font-medium text-xl mt-2">Your financial health at a glance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        
        <div className="lg:col-span-7 order-1 space-y-6 md:space-y-10 animate-in fade-in duration-700">
          {/* Payment Methods Container */}
          <div className="bg-white border border-fintech-border rounded-[2rem] lg:rounded-[2.5rem] p-4 md:p-8 lg:p-10 shadow-fintech-card">
            <div className="mb-6 px-1 flex items-center justify-between">
              <h4 className="text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-widest">My Accounts</h4>
            </div>
            <PaymentMethodsGrid paymentMethods={paymentMethods} />
          </div>
        </div>

        {/* Sidebar/Control Panel */}
        <div className="lg:col-span-5 order-2 flex flex-col gap-4 lg:gap-8">
          
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-widest">Quick Actions</h4>
            <span className="lg:hidden w-1/2 h-px bg-slate-200"></span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 lg:gap-6">
            
            <button 
              onClick={() => openModal('expense', todayStr)}
              className="group flex flex-col lg:flex-row items-center p-4 lg:p-6 bg-white border border-slate-200 rounded-2xl lg:rounded-3xl hover:border-red-200 hover:shadow-xl transition-all duration-300 w-full text-center lg:text-left"
            >
              <div className="w-10 h-10 lg:w-16 lg:h-16 bg-red-50 text-red-600 rounded-xl lg:rounded-2xl flex items-center justify-center border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-8 lg:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-3 lg:mt-0 lg:ml-6">
                <h3 className="text-sm lg:text-xl font-bold text-slate-800 leading-tight">Expense</h3>
              </div>
            </button>

            <button 
              onClick={() => openModal('cashin', todayStr)}
              className="group flex flex-col lg:flex-row items-center p-4 lg:p-6 bg-white border border-slate-200 rounded-2xl lg:rounded-3xl hover:border-green-200 hover:shadow-xl transition-all duration-300 w-full text-center lg:text-left"
            >
              <div className="w-10 h-10 lg:w-16 lg:h-16 bg-green-50 text-green-600 rounded-xl lg:rounded-2xl flex items-center justify-center border border-green-100 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-8 lg:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-3 lg:mt-0 lg:ml-6">
                <h3 className="text-sm lg:text-xl font-bold text-slate-800 leading-tight">Cash In</h3>
              </div>
            </button>

            <Link 
              href="/ledger"
              className="col-span-2 group flex items-center p-5 lg:p-6 bg-white border border-slate-200 rounded-2xl lg:rounded-3xl hover:border-blue-200 hover:shadow-xl transition-all duration-300 w-full text-left"
            >
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-50 text-blue-600 rounded-lg lg:rounded-2xl flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 lg:w-8 lg:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4 lg:ml-6">
                <h3 className="text-sm lg:text-xl font-bold text-slate-800 leading-tight">View Monthly Ledger</h3>
              </div>
            </Link>

            <Link 
              href="/debts"
              className="col-span-2 group flex items-center p-5 lg:p-6 bg-white border border-slate-200 rounded-2xl lg:rounded-3xl hover:border-purple-200 hover:shadow-xl transition-all duration-300 w-full text-left"
            >
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-purple-50 text-purple-600 rounded-lg lg:rounded-2xl flex items-center justify-center border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 lg:w-8 lg:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4 lg:ml-6">
                <h3 className="text-sm lg:text-xl font-bold text-slate-800 leading-tight">Debt and Receivable</h3>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <EntryModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSubmit={handleEntrySubmit}
        type={modalType}
        dateStr={targetDate}
        paymentMethods={paymentMethods}
      />
    </div>
  );
}
