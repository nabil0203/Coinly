'use client';

import React, { useState } from 'react';
import { PaymentMethodsGrid } from './FinancialSummary';
import { EntryForm } from '../EntryForm/EntryForm';
import Link from 'next/link';
import { addEntry, type EntryPayload } from '@/app/actions/ledger';

interface PaymentMethodType {
  _id?: string;
  id?: string;
  name: string;
  balance: number;
}

interface HomeProps {
  displayName: string;
  paymentMethods: PaymentMethodType[];
}

export function Home({ displayName, paymentMethods }: HomeProps) {
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
    await addEntry(type, payload);
    setModalOpen(false);
  };

  return (
    <div className="h-full overflow-y-auto w-full relative bg-[#0F172A]">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(15,23,42,0) 70%)' }} />
        <div className="absolute top-[60%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, rgba(15,23,42,0) 70%)' }} />
      </div>

      {/* Floating Finance Icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[2%] md:top-[10%] -left-[10%] md:left-[5%] rotate-[-15deg] transform scale-75 md:scale-150"
          style={{ color: 'rgba(99,102,241,0.05)' }}>
          <svg className="w-48 h-48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
          </svg>
        </div>
        <div className="hidden sm:block absolute bottom-[20%] left-[2%] md:left-[10%] rotate-[15deg]"
          style={{ color: 'rgba(34,197,94,0.05)' }}>
          <svg className="w-56 h-56" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
        </div>
        <div className="hidden sm:block absolute top-[15%] right-[5%] rotate-[20deg]"
          style={{ color: 'rgba(99,102,241,0.04)' }}>
          <svg className="w-40 h-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
          </svg>
        </div>
        <div className="absolute bottom-[2%] md:bottom-[10%] -right-[15%] md:right-[5%] rotate-[-25deg] transform scale-75 md:scale-125"
          style={{ color: 'rgba(99,102,241,0.05)' }}>
          <svg className="w-64 h-64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 py-6 md:py-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div
          className="mb-8 lg:mb-12 text-center lg:text-left"
          style={{ animation: 'slide-in-up 0.5s ease-out both', animationDelay: '0ms' }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#F8FAFC] tracking-tight leading-tight font-poppins">
            Welcome back, <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #818CF8, #6366F1)' }}>{displayName}</span>!
          </h2>
          <p className="hidden lg:block text-[#94A3B8] font-medium text-xl mt-2">Your financial health at a glance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">

          {/* Payment Methods Panel */}
          <div
            className="lg:col-span-7 order-1 space-y-4 lg:space-y-6 interactive-card"
            style={{ animation: 'slide-in-up 0.5s ease-out both', animationDelay: '120ms' }}
          >
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs lg:text-sm font-bold text-[#94A3B8] uppercase tracking-widest">My Accounts</h4>
            </div>
            <div className="bg-[#1E293B] border border-[#334155] rounded-[2rem] lg:rounded-[2.5rem] p-4 md:p-8 lg:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-shadow duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <PaymentMethodsGrid paymentMethods={paymentMethods} />
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="lg:col-span-5 order-2 flex flex-col gap-4 lg:gap-8"
            style={{ animation: 'slide-in-up 0.5s ease-out both', animationDelay: '220ms' }}
          >
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs lg:text-sm font-bold text-[#94A3B8] uppercase tracking-widest">Quick Actions</h4>
              <span className="lg:hidden w-1/2 h-px bg-[#334155]" />
            </div>

            <div className="grid grid-cols-2 gap-3 lg:gap-5">

              {/* Expense Button */}
              <button
                onClick={() => openModal('expense', todayStr)}
                className="group flex flex-col lg:flex-row items-center p-4 lg:p-6 bg-[#1E293B] border border-[#334155] rounded-2xl lg:rounded-3xl hover:border-[#F43F5E]/40 hover:shadow-[0_8px_24px_rgba(244,63,94,0.12)] hover:-translate-y-0.5 transition-all duration-300 w-full text-center lg:text-left interactive-card"
              >
                <div className="w-10 h-10 lg:w-14 lg:h-14 bg-[#F43F5E]/10 text-[#F43F5E] rounded-xl lg:rounded-2xl flex items-center justify-center border border-[#F43F5E]/20 group-hover:bg-[#F43F5E] group-hover:text-white group-hover:scale-110 group-hover:shadow-[0_0_16px_rgba(244,63,94,0.5)] transition-all duration-300 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-7 lg:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="mt-3 lg:mt-0 lg:ml-5">
                  <h3 className="text-sm lg:text-lg font-bold text-[#F8FAFC] leading-tight">Expense</h3>
                </div>
              </button>

              {/* Cash In Button */}
              <button
                onClick={() => openModal('cashin', todayStr)}
                className="group flex flex-col lg:flex-row items-center p-4 lg:p-6 bg-[#1E293B] border border-[#334155] rounded-2xl lg:rounded-3xl hover:border-[#22C55E]/40 hover:shadow-[0_8px_24px_rgba(34,197,94,0.12)] hover:-translate-y-0.5 transition-all duration-300 w-full text-center lg:text-left interactive-card"
              >
                <div className="w-10 h-10 lg:w-14 lg:h-14 bg-[#22C55E]/10 text-[#22C55E] rounded-xl lg:rounded-2xl flex items-center justify-center border border-[#22C55E]/20 group-hover:bg-[#22C55E] group-hover:text-white group-hover:scale-110 group-hover:shadow-[0_0_16px_rgba(34,197,94,0.5)] transition-all duration-300 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-7 lg:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="mt-3 lg:mt-0 lg:ml-5">
                  <h3 className="text-sm lg:text-lg font-bold text-[#F8FAFC] leading-tight">Cash In</h3>
                </div>
              </button>

              {/* View Ledger */}
              <Link
                href="/ledger"
                className="col-span-2 group flex items-center p-5 lg:p-6 bg-[#1E293B] border border-[#334155] rounded-2xl lg:rounded-3xl hover:border-[#6366F1]/40 hover:shadow-[0_8px_24px_rgba(99,102,241,0.12)] hover:-translate-y-0.5 transition-all duration-300 w-full text-left interactive-card"
              >
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center border border-[#6366F1]/25 transition-all duration-300 shrink-0 bg-[#6366F1]/10 text-[#6366F1] group-hover:bg-[#6366F1] group-hover:text-white group-hover:border-[#6366F1] group-hover:scale-110 group-hover:shadow-[0_0_16px_rgba(99,102,241,0.5)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 lg:w-7 lg:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4 lg:ml-5">
                  <h3 className="text-sm lg:text-lg font-bold text-[#F8FAFC] leading-tight">Monthly Ledger</h3>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-[#334155] group-hover:text-[#6366F1] group-hover:translate-x-1 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Debt & Receivable */}
              <Link
                href="/debts"
                className="col-span-2 group flex items-center p-5 lg:p-6 bg-[#1E293B] border border-[#334155] rounded-2xl lg:rounded-3xl hover:border-[#22C55E]/30 hover:shadow-[0_8px_24px_rgba(34,197,94,0.08)] hover:-translate-y-0.5 transition-all duration-300 w-full text-left interactive-card"
              >
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center border border-[#22C55E]/20 transition-all duration-300 shrink-0 bg-[#22C55E]/10 text-[#22C55E] group-hover:bg-[#22C55E] group-hover:text-white group-hover:border-[#22C55E] group-hover:scale-110 group-hover:shadow-[0_0_16px_rgba(34,197,94,0.5)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 lg:w-7 lg:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-4 lg:ml-5">
                  <h3 className="text-sm lg:text-lg font-bold text-[#F8FAFC] leading-tight">Debt &amp; Receivable</h3>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-[#334155] group-hover:text-[#22C55E] group-hover:translate-x-1 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <EntryForm
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
