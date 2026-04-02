'use client';

import React, { useState } from 'react';
import { PaymentMethodsGrid } from './FinancialSummary';
import { EntryModal } from './EntryModal';
import Link from 'next/link';
import { addEntry, type EntryPayload } from '@/app/actions/ledger';

interface PaymentMethodType {
  _id?: string;
  id?: string;
  name: string;
  balance: number;
}

interface HomeClientProps {
  displayName: string;
  paymentMethods: PaymentMethodType[];
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

  const handleEntrySubmit = async (type: 'expense' | 'cashin', payload: EntryPayload | EntryPayload[]) => {
    const singlePayload = Array.isArray(payload) ? payload[0] : (payload as EntryPayload);
    await addEntry(type, singlePayload);
    setModalOpen(false);
  };

  return (
    <div className="h-full overflow-y-auto w-full relative bg-[#f8fafc]">
      {/* Decorative Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-b from-blue-300/20 to-purple-300/10 blur-[120px]"></div>
        <div className="absolute top-[60%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-t from-cyan-300/20 to-blue-300/10 blur-[120px]"></div>
      </div>

      {/* Floating Finance Icons for Context */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top Left Wallet */}
        <div className="absolute top-[2%] md:top-[10%] -left-[10%] md:left-[5%] text-blue-500/5 rotate-[-15deg] transform scale-75 md:scale-150 opacity-60 md:opacity-100">
          <svg className="w-48 h-48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
          </svg>
        </div>
        {/* Bottom Left Chart */}
        <div className="hidden sm:block absolute bottom-[20%] left-[2%] md:left-[10%] text-indigo-500/5 rotate-[15deg] transform scale-100 md:scale-125">
          <svg className="w-56 h-56" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
        </div>
        {/* Top Right Banknotes */}
        <div className="hidden sm:block absolute top-[15%] right-[5%] md:right-[5%] text-cyan-500/5 rotate-[20deg] transform scale-100 md:scale-150">
          <svg className="w-40 h-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        </div>
        {/* Bottom Right Credit Card */}
        <div className="absolute bottom-[2%] md:bottom-[10%] -right-[15%] md:right-[5%] text-blue-600/5 rotate-[-25deg] transform scale-75 md:scale-125 opacity-60 md:opacity-100">
          <svg className="w-64 h-64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 py-6 md:py-12 px-4 md:px-8 max-w-7xl mx-auto">
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
    </div>
  );
}
