'use client';

import React, { useState } from 'react';
import { updateProfileAction, changePasswordAction } from '@/app/actions/profile';
import { addPaymentMethod, renamePaymentMethod, deletePaymentMethod } from '@/app/actions/payment';
import { ProfileInformation } from './ProfileInformation';
import { AccountSettings } from './AccountSettings';
import { PaymentMethodsSettings } from './PaymentMethodsSettings';

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
}

export function Profile({ user, paymentMethods }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'account' | 'payment'>('info');

  const tabs = [
    { id: 'info', label: 'Profile Info', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'account', label: 'Account Settings', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
    { id: 'payment', label: 'Payment Methods', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )}
  ];

  return (
    <div className="h-full overflow-y-auto w-full bg-[#0F172A] text-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6 lg:gap-8 max-h-full">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 lg:w-72 shrink-0 md:h-[calc(100vh-140px)] flex flex-col gap-2">
          <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-3 md:p-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)] md:flex-1 md:overflow-y-auto hidden-scrollbar">
            <h2 className="hidden md:block px-4 pb-4 mb-2 text-xs font-black text-[#94A3B8] uppercase tracking-widest border-b border-[#334155]">
              Settings
            </h2>
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'info' | 'account' | 'payment')}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl md:rounded-[1.25rem] transition-all duration-200 font-bold whitespace-nowrap md:whitespace-normal group ${
                    activeTab === tab.id
                      ? 'bg-[#6366F1]/15 text-[#6366F1] shadow-sm'
                      : 'text-[#94A3B8] hover:bg-[#263347] hover:text-[#F8FAFC]'
                  }`}
                >
                  <div className={`transition-transform duration-200 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {tab.icon}
                  </div>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 md:h-[calc(100vh-140px)] overflow-hidden rounded-3xl bg-transparent md:bg-[#1E293B] md:border border-[#334155] md:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="h-full overflow-y-auto no-scrollbar md:p-8">
            <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 pb-10 md:pb-0">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
