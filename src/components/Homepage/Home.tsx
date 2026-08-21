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
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getLocalDateStr();

  const handleEntrySubmit = async (type: 'expense' | 'cashin', payload: EntryPayload | EntryPayload[]) => {
    await addEntry(type, payload);
    setModalOpen(false);
  };

  return (
    <div className="h-full overflow-y-auto w-full relative" style={{ backgroundColor: '#080E1A' }}>

      {/* ── Animated background orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Primary indigo orb — top right */}
        <div
          className="absolute -top-[15%] -right-[5%] w-[65%] h-[65%]"
          style={{
            borderRadius: '9999px',
            filter: 'blur(130px)',
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(8,14,26,0) 70%)',
            animation: 'glow-breathe 5s ease-in-out infinite',
          }}
        />
        {/* Violet accent orb — mid-left */}
        <div
          className="absolute top-[45%] -left-[10%] w-[55%] h-[55%]"
          style={{
            borderRadius: '9999px',
            filter: 'blur(140px)',
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(8,14,26,0) 70%)',
            animation: 'glow-breathe 7s ease-in-out infinite 1.5s',
          }}
        />
        {/* Income emerald orb — bottom */}
        <div
          className="absolute bottom-[5%] right-[10%] w-[45%] h-[45%]"
          style={{
            borderRadius: '9999px',
            filter: 'blur(120px)',
            background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(8,14,26,0) 70%)',
            animation: 'glow-breathe 6s ease-in-out infinite 3s',
          }}
        />
      </div>

      {/* ── Floating faint finance icons ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[2%] md:top-[10%] -left-[10%] md:left-[5%] rotate-[-15deg] transform scale-75 md:scale-150"
          style={{ color: 'rgba(99,102,241,0.04)' }}>
          <svg className="w-48 h-48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
          </svg>
        </div>
        <div className="hidden sm:block absolute bottom-[20%] left-[2%] md:left-[10%] rotate-15"
          style={{ color: 'rgba(16,185,129,0.04)' }}>
          <svg className="w-56 h-56" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
        </div>
        <div className="hidden sm:block absolute top-[15%] right-[5%] rotate-20"
          style={{ color: 'rgba(139,92,246,0.03)' }}>
          <svg className="w-40 h-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
          </svg>
        </div>
        <div className="absolute bottom-[2%] md:bottom-[10%] -right-[15%] md:right-[5%] rotate-[-25deg] transform scale-75 md:scale-125"
          style={{ color: 'rgba(99,102,241,0.04)' }}>
          <svg className="w-64 h-64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 py-6 md:py-12 px-4 md:px-8 max-w-7xl mx-auto">

        {/* Welcome Header */}
        <div
          className="mb-8 lg:mb-12 text-center lg:text-left"
          style={{ animation: 'slide-in-up 0.5s ease-out both', animationDelay: '0ms' }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight font-poppins" style={{ color: '#F1F5F9' }}>
            Welcome back,{' '}
            <span style={{
              background: 'linear-gradient(90deg, #818CF8 0%, #C084FC 60%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {displayName}
            </span>
            !
          </h2>
          <p className="hidden lg:block font-medium text-lg mt-2" style={{ color: '#64748B' }}>Your financial health at a glance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">

          {/* ── Payment Methods Panel ── */}
          <div
            className="lg:col-span-7 order-1 space-y-4 lg:space-y-5 interactive-card"
            style={{ animation: 'slide-in-up 0.5s ease-out both', animationDelay: '120ms' }}
          >
            {/* Section label */}
            <div className="flex items-center gap-2.5 px-1">
              <div style={{ width: 3, height: 14, borderRadius: 9999, background: 'linear-gradient(180deg, #6366F1, #8B5CF6)', flexShrink: 0 }} />
              <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>My Accounts</h4>
            </div>

            {/* Panel glass card */}
            <div
              className="rounded-4xl lg:rounded-[2.5rem] p-4 md:p-8 lg:p-10 transition-all duration-300"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                backgroundColor: '#0F1929',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.35)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.18)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(99,102,241,0.10), 0 20px 40px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.35)';
              }}
            >
              <PaymentMethodsGrid paymentMethods={paymentMethods} />
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div
            className="lg:col-span-5 order-2 flex flex-col gap-4 lg:gap-5"
            style={{ animation: 'slide-in-up 0.5s ease-out both', animationDelay: '220ms' }}
          >
            {/* Section label */}
            <div className="flex items-center gap-2.5 px-1">
              <div style={{ width: 3, height: 14, borderRadius: 9999, background: 'linear-gradient(180deg, #6366F1, #8B5CF6)', flexShrink: 0 }} />
              <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>Quick Actions</h4>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:gap-4">

              {/* Expense Button */}
              <button
                onClick={() => openModal('expense', todayStr)}
                className="group flex flex-col lg:flex-row items-center p-4 lg:p-5 rounded-2xl lg:rounded-3xl transition-all duration-300 w-full text-center lg:text-left interactive-card shimmer-hover cursor-pointer"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                  backgroundColor: '#0F1929',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,63,94,0.30)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(244,63,94,0.14)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                  (e.currentTarget as HTMLElement).style.transform = '';
                }}
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center border transition-all duration-300 shrink-0"
                  style={{ background: 'rgba(244,63,94,0.10)', color: '#F43F5E', borderColor: 'rgba(244,63,94,0.20)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-6 lg:h-6 transition-all duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="mt-3 lg:mt-0 lg:ml-4">
                  <h3 className="text-sm lg:text-base font-bold leading-tight" style={{ color: '#F1F5F9' }}>Expense</h3>
                </div>
              </button>

              {/* Cash In Button */}
              <button
                onClick={() => openModal('cashin', todayStr)}
                className="group flex flex-col lg:flex-row items-center p-4 lg:p-5 rounded-2xl lg:rounded-3xl transition-all duration-300 w-full text-center lg:text-left interactive-card shimmer-hover cursor-pointer"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                  backgroundColor: '#0F1929',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,185,129,0.30)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(16,185,129,0.12)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                  (e.currentTarget as HTMLElement).style.transform = '';
                }}
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center border transition-all duration-300 shrink-0"
                  style={{ background: 'rgba(16,185,129,0.10)', color: '#10B981', borderColor: 'rgba(16,185,129,0.20)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-6 lg:h-6 transition-all duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="mt-3 lg:mt-0 lg:ml-4">
                  <h3 className="text-sm lg:text-base font-bold leading-tight" style={{ color: '#F1F5F9' }}>Cash In</h3>
                </div>
              </button>

              {/* View Ledger */}
              <Link
                href="/ledger"
                className="col-span-2 group flex items-center p-4 lg:p-5 rounded-2xl lg:rounded-3xl transition-all duration-300 w-full text-left interactive-card shimmer-hover"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                  backgroundColor: '#0F1929',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.30)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(99,102,241,0.14)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                  (e.currentTarget as HTMLElement).style.transform = '';
                }}
              >
                <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center border transition-all duration-300 shrink-0 group-hover:scale-110"
                  style={{ background: 'rgba(99,102,241,0.10)', color: '#6366F1', borderColor: 'rgba(99,102,241,0.20)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm lg:text-base font-bold leading-tight" style={{ color: '#F1F5F9' }}>Monthly Ledger</h3>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto transition-all duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  style={{ color: '#334155' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Mandatory Expenses */}
              <Link
                href="/mandatory"
                className="col-span-2 group flex items-center p-4 lg:p-5 rounded-2xl lg:rounded-3xl transition-all duration-300 w-full text-left interactive-card shimmer-hover"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                  backgroundColor: '#0F1929',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.28)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(245,158,11,0.10)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                  (e.currentTarget as HTMLElement).style.transform = '';
                }}
              >
                <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center border transition-all duration-300 shrink-0 group-hover:scale-110"
                  style={{ background: 'rgba(245,158,11,0.10)', color: '#F59E0B', borderColor: 'rgba(245,158,11,0.20)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm lg:text-base font-bold leading-tight" style={{ color: '#F1F5F9' }}>Mandatory Expenses</h3>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto transition-all duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  style={{ color: '#334155' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Debt & Receivable */}
              <Link
                href="/debts"
                className="col-span-2 group flex items-center p-4 lg:p-5 rounded-2xl lg:rounded-3xl transition-all duration-300 w-full text-left interactive-card shimmer-hover"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                  backgroundColor: '#0F1929',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,185,129,0.26)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(16,185,129,0.10)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                  (e.currentTarget as HTMLElement).style.transform = '';
                }}
              >
                <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center border transition-all duration-300 shrink-0 group-hover:scale-110"
                  style={{ background: 'rgba(16,185,129,0.10)', color: '#10B981', borderColor: 'rgba(16,185,129,0.20)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm lg:text-base font-bold leading-tight" style={{ color: '#F1F5F9' }}>Debt &amp; Receivable</h3>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto transition-all duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  style={{ color: '#334155' }}>
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
