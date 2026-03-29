'use client';

import React from 'react';
import { getMethodIcon } from '@/utils/icons';

interface PaymentMethod {
  _id?: string;
  id?: string;
  name: string;
  balance: number;
}

interface FinancialSummaryProps {
  paymentMethods: PaymentMethod[];
}

export function FinancialSummary({ paymentMethods }: FinancialSummaryProps) {
  const totalBalance = paymentMethods.reduce((acc, method) => acc + (Number(method.balance) || 0), 0);

  return (
    <div className="w-full mb-8">
      {/* Total Balance Section */}
      <div className="text-center mb-10 md:mb-14 lg:mb-12">
        <p className="text-slate-500 font-medium text-xs md:text-base lg:text-sm mb-2 uppercase tracking-widest">Available Balance</p>
        <h2 className="text-6xl md:text-6xl lg:text-5xl xl:text-6xl font-black text-slate-800 tracking-tight inline-flex items-baseline transition-all duration-300">
          <span className="text-4xl md:text-4xl lg:text-3xl xl:text-4xl mr-2 md:mr-3 text-blue-600 font-bold">৳</span>
          {totalBalance.toLocaleString()}
        </h2>
      </div>

      {/* Payment Methods Section */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-4 px-2 md:px-4">
        {paymentMethods.map((method) => (
          <div
            key={method._id || method.id}
            className="flex items-center bg-white border border-slate-200 rounded-full pl-5 pr-5 py-4 md:pl-4 md:pr-7 md:py-3 lg:pl-4 lg:pr-6 lg:py-3 shadow-sm hover:shadow-md hover:border-blue-600/30 transition-all duration-200 group cursor-default w-full sm:w-auto"
          >
            <div className="w-10 h-10 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200 shrink-0">
              {React.cloneElement(getMethodIcon(method.name), {
                className: "w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6"
              } as any)}
            </div>
            <div className="ml-2 md:ml-4 lg:ml-5 flex flex-col min-w-0">
              <span className="text-sm md:text-sm lg:text-sm font-bold text-slate-500 uppercase tracking-wider leading-none mb-1.5 lg:mb-1.5">{method.name}</span>
              <span className="text-lg md:text-lg lg:text-xl font-bold text-slate-800 leading-none tabular-nums">
                ৳ {(Number(method.balance) || 0).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
