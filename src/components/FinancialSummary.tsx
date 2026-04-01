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

export function PaymentMethodsGrid({ paymentMethods }: FinancialSummaryProps) {
  return (
    <div className="w-full flex flex-wrap justify-center gap-4 md:gap-5 lg:gap-6 px-4 md:px-8">
      {paymentMethods.map((method) => (
        <div
          key={method._id || method.id}
          className="flex items-center bg-white border border-slate-200 rounded-full pl-6 pr-6 py-5 md:pl-5 md:pr-8 md:py-4 lg:pl-6 lg:pr-8 lg:py-4 shadow-sm hover:shadow-md hover:border-blue-600/30 transition-all duration-200 group cursor-default w-full sm:w-auto"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200 shrink-0">
            {React.cloneElement(getMethodIcon(method.name) as React.ReactElement<{ className?: string }>, {
              className: "w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8"
            })}
          </div>
          <div className="ml-3 md:ml-4 lg:ml-5 flex flex-col min-w-0 justify-center">
            <span className="text-base md:text-base lg:text-lg font-bold text-slate-500 uppercase tracking-wider leading-none mb-2">{method.name}</span>
            <span className="text-xl md:text-2xl lg:text-2xl font-bold text-slate-800 leading-none tabular-nums">
              ৳ {(Number(method.balance) || 0).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}


