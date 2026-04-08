'use client';

import React, { useState } from 'react';
import { ProfileInformation, ProfileUser, PaymentMethodType } from './profile/ProfileInformation';
import { AccountSettings } from './profile/AccountSettings';
import { PaymentMethodsSettings } from './profile/PaymentMethodsSettings';

interface ProfileProps {
  user: ProfileUser;
  paymentMethods: PaymentMethodType[];
}

export function Profile({ user, paymentMethods }: ProfileProps) {
  // Layout State
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'payment'>('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalLiquidity = paymentMethods.reduce((acc, pm) => acc + (Number(pm.balance) || 0), 0);

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-50/30">
      
      {/* Mobile Header / Dropdown Toggle */}
      <div className="md:hidden bg-white border-b border-fintech-border p-4 flex items-center justify-between z-20 sticky top-0 shadow-sm">
        <h2 className="font-poppins font-black text-fintech-text-main text-lg">
          {activeTab === 'profile' && 'Profile Information'}
          {activeTab === 'account' && 'Account Settings'}
          {activeTab === 'payment' && 'Payment Methods'}
        </h2>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        ${isMobileMenuOpen ? 'block animate-in slide-in-from-top-4' : 'hidden'} 
        md:block w-full md:w-72 lg:w-80 bg-white border-b md:border-b-0 md:border-r border-fintech-border 
        md:h-screen sticky top-0 shrink-0 z-10 overflow-y-auto
      `}>
        <div className="p-6 md:p-8">
          <h1 className="text-2xl font-black text-fintech-text-main font-poppins mb-8 hidden md:block tracking-tight">
            Settings
          </h1>
          <nav className="space-y-3">
            {[
              { id: 'profile', label: 'Profile Information', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { id: 'account', label: 'Account Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
              { id: 'payment', label: 'Payment Methods', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as 'profile' | 'account' | 'payment');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 text-left group ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'}`}
              >
                <div className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${activeTab === item.id ? 'bg-indigo-200/50 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    {item.id === 'account' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
                  </svg>
                </div>
                <span className="font-bold text-[15px]">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
        <div className="max-w-4xl mx-auto pb-12">
          
          {activeTab === 'profile' && (
            <ProfileInformation user={user} paymentMethods={paymentMethods} totalLiquidity={totalLiquidity} />
          )}

          {activeTab === 'account' && (
            <AccountSettings user={user} />
          )}

          {activeTab === 'payment' && (
            <PaymentMethodsSettings paymentMethods={paymentMethods} />
          )}

        </div>
      </div>
    </div>
  );
}
