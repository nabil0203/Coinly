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
    <div className="w-full flex flex-wrap justify-center gap-3 md:gap-4 px-2 md:px-4">
      {paymentMethods.map((method, index) => (
        <div
          key={method._id || method.id}
          className="group flex items-center bg-[#263347] border border-[#334155] rounded-2xl pl-4 pr-5 py-3 md:py-3.5
                     shadow-sm hover:shadow-[0_4px_20px_rgba(99,102,241,0.18)] hover:border-[#6366F1]/40
                     hover:-translate-y-0.5 ring-1 ring-transparent hover:ring-[#6366F1]/20
                     transition-all duration-200 cursor-default w-full sm:w-auto interactive-card"
          style={{
            animation: 'slide-in-up 0.4s ease-out both',
            animationDelay: `${index * 75}ms`,
          }}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#1E293B] flex items-center justify-center
                          transition-all duration-200 shrink-0 text-[#6366F1]
                          group-hover:bg-[#6366F1] group-hover:text-white border border-[#334155] group-hover:border-[#6366F1]
                          group-hover:scale-110 group-hover:shadow-[0_0_14px_rgba(99,102,241,0.4)]">
            {React.cloneElement(getMethodIcon(method.name) as React.ReactElement<{ className?: string }>, {
              className: "w-5 h-5 md:w-6 md:h-6"
            })}
          </div>
          <div className="ml-3 md:ml-4 flex flex-col min-w-0 justify-center">
            <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider leading-none mb-1">
              {method.name}
            </span>
            <span className="text-lg md:text-xl font-black text-[#F8FAFC] leading-none tabular-nums transition-all duration-500">
              ৳ {(Number(method.balance) || 0).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
