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
    <div className="w-full flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-5 px-2 md:px-4">
      {paymentMethods.map((method) => (
        <div
          key={method._id || method.id}
          className="flex items-center bg-white border border-slate-200 rounded-full pl-4 pr-4 py-3 md:pl-4 md:pr-6 md:py-3 lg:pl-5 lg:pr-6 lg:py-3 shadow-sm hover:shadow-md hover:border-blue-600/30 transition-all duration-200 group cursor-default w-full sm:w-auto"
        >
          <div className="w-9 h-9 md:w-11 md:h-11 lg:w-13 lg:h-13 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200 shrink-0">
            {React.cloneElement(getMethodIcon(method.name) as React.ReactElement<{ className?: string }>, {
              className: "w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
            })}
          </div>
          <div className="ml-2 md:ml-3 lg:ml-4 flex flex-col min-w-0 justify-center">
            <span className="text-sm md:text-sm lg:text-base font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">{method.name}</span>
            <span className="text-base md:text-xl lg:text-xl font-bold text-slate-800 leading-none tabular-nums">
              ৳ {(Number(method.balance) || 0).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}


