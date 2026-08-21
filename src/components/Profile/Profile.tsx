'use client';

import React, { useState } from 'react';
import { updateProfileAction, changePasswordAction } from '@/app/actions/profile';
import { addPaymentMethod, renamePaymentMethod, deletePaymentMethod } from '@/app/actions/payment';
import { ProfileInformation } from './ProfileInformation';
import { AccountSettings } from './AccountSettings';
import { PaymentMethodsSettings } from './PaymentMethodsSettings';
import { MandatoryExpensesSettings } from './MandatoryExpensesSettings';
import type { MandatoryExpenseItem } from '@/app/actions/essentials';

interface ProfileProps {
  user: {
    _id: string;
    username: string;
    email: string;
    full_name?: string;
    currency: string;
    payment_methods?: { _id?: string; id?: string; name: string; balance: number }[];
  };
  paymentMethods?: { _id?: string; id?: string; name: string; balance: number }[];
  mandatoryExpenses?: MandatoryExpenseItem[];
}

export function Profile({ user, paymentMethods, mandatoryExpenses }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'account' | 'payment' | 'mandatory'>('info');

  const tabs = [
    {
      id: 'info',
      label: 'Profile Info',
      color: { bg: 'rgba(99,102,241,0.18)', bgDim: 'rgba(139,92,246,0.10)', text: '#818CF8', border: 'rgba(99,102,241,0.30)', shadow: 'rgba(99,102,241,0.15)' },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'account',
      label: 'Security & Account',
      color: { bg: 'rgba(99,102,241,0.18)', bgDim: 'rgba(139,92,246,0.10)', text: '#818CF8', border: 'rgba(99,102,241,0.30)', shadow: 'rgba(99,102,241,0.15)' },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      id: 'payment',
      label: 'Payment Methods',
      color: { bg: 'rgba(99,102,241,0.18)', bgDim: 'rgba(139,92,246,0.10)', text: '#818CF8', border: 'rgba(99,102,241,0.30)', shadow: 'rgba(99,102,241,0.15)' },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      id: 'mandatory',
      label: 'Mandatory Expenses',
      color: { bg: 'rgba(99,102,241,0.18)', bgDim: 'rgba(139,92,246,0.10)', text: '#818CF8', border: 'rgba(99,102,241,0.30)', shadow: 'rgba(99,102,241,0.15)' },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    }
  ];

  return (
    <div className="h-full overflow-y-auto w-full relative" style={{ backgroundColor: '#080E1A' }}>
      {/* ── Background Ambient Glow Orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-[10%] -right-[5%] w-[60%] h-[60%]"
          style={{
            borderRadius: '9999px',
            filter: 'blur(130px)',
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(8,14,26,0) 70%)',
            animation: 'glow-breathe 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-[40%] -left-[10%] w-[55%] h-[55%]"
          style={{
            borderRadius: '9999px',
            filter: 'blur(140px)',
            background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, rgba(8,14,26,0) 70%)',
            animation: 'glow-breathe 7s ease-in-out infinite 1.5s',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6 lg:gap-8 pb-16 md:pb-8">
        {/* ── Sidebar Navigation ── */}
        <div className="w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-8 self-start flex flex-col gap-2">
          <div
            className="rounded-3xl p-3 md:p-4"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              backgroundColor: '#0F1929',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            <h2
              className="hidden md:block px-4 pb-4 mb-2 text-xs font-black uppercase tracking-widest"
              style={{ color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              Settings
            </h2>
            <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'info' | 'account' | 'payment' | 'mandatory')}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-bold whitespace-nowrap md:whitespace-normal group cursor-pointer text-xs sm:text-sm"
                    style={{
                      background: isActive ? `linear-gradient(135deg, ${tab.color.bg}, ${tab.color.bgDim})` : 'transparent',
                      color: isActive ? tab.color.text : '#94A3B8',
                      border: isActive ? `1px solid ${tab.color.border}` : '1px solid transparent',
                      boxShadow: isActive ? `0 2px 12px ${tab.color.shadow}` : 'none',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                        (e.currentTarget as HTMLElement).style.color = '#F1F5F9';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = '#94A3B8';
                      }
                    }}
                  >
                    <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {tab.icon}
                    </div>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <div
          className="flex-1 rounded-3xl p-5 sm:p-7 md:p-8"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            backgroundColor: '#0F1929',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
            {activeTab === 'info' && (
              <ProfileInformation
                user={user}
                updateProfileAction={updateProfileAction}
              />
            )}
            {activeTab === 'account' && (
              <AccountSettings
                user={user}
                changePasswordAction={changePasswordAction}
              />
            )}
            {activeTab === 'payment' && (
              <PaymentMethodsSettings
                paymentMethods={paymentMethods || user.payment_methods || []}
                addPaymentMethod={addPaymentMethod}
                renamePaymentMethod={renamePaymentMethod}
                deletePaymentMethod={deletePaymentMethod}
              />
            )}
            {activeTab === 'mandatory' && (
              <MandatoryExpensesSettings
                initialItems={mandatoryExpenses || []}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
