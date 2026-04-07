import React from 'react';

export interface ProfileUser {
  full_name?: string;
  username?: string;
  email?: string;
}

export interface PaymentMethodType {
  _id?: string;
  id?: string;
  name: string;
  balance: number;
}

interface ProfileInformationProps {
  user: ProfileUser;
  paymentMethods: PaymentMethodType[];
  totalLiquidity: number;
}

export function ProfileInformation({ user, paymentMethods, totalLiquidity }: ProfileInformationProps) {
  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-[20px] duration-500 fade-in">
      {/* Profile Header Card */}
      <div className="bg-white rounded-[2rem] shadow-premium border border-fintech-border overflow-hidden">
        {/* Banner Gradient */}
        <div className="h-24 md:h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700"></div>

        <div className="px-6 md:px-10 pb-8 -mt-10 md:-mt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-end gap-4 md:gap-8">
              {/* Avatar Placeholder */}
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-3xl bg-white p-1 shadow-2xl border border-fintech-border overflow-hidden shrink-0">
                <div className="w-full h-full rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden">
                  <span className="text-3xl md:text-5xl font-black text-slate-200">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>

              <div className="pb-1 md:pb-4">
                <h2 className="text-2xl md:text-4xl font-black text-fintech-text-main tracking-tight font-poppins">
                  {user?.full_name || 'Coinly User'}
                </h2>
                <p className="text-fintech-text-muted font-medium text-sm md:text-lg">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 border-t border-fintech-border bg-slate-50/30">
          <div className="p-4 md:p-8 text-center border-r border-fintech-border">
            <span className="block text-xl md:text-3xl font-black text-indigo-600 tabular-nums font-poppins">{paymentMethods.length}</span>
            <span className="text-[8px] md:text-xs uppercase font-bold text-fintech-text-muted tracking-widest mt-1">Payment Methods</span>
          </div>
          <div className="p-4 md:p-8 text-center border-r border-fintech-border">
            <span className="block text-xl md:text-3xl font-black text-fintech-text-main tabular-nums font-poppins">৳ {totalLiquidity.toLocaleString()}</span>
            <span className="text-[8px] md:text-xs uppercase font-bold text-fintech-text-muted tracking-widest mt-1">Total Liquidity</span>
          </div>
          <div className="p-4 md:p-8 text-center">
            <span className="block text-xl md:text-3xl font-black text-fintech-text-main italic font-poppins lowercase">{user?.username}</span>
            <span className="text-[8px] md:text-xs uppercase font-bold text-fintech-text-muted tracking-widest mt-1">System Username</span>
          </div>
        </div>
      </div>
    </div>
  );
}
