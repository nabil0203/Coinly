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
          className="group flex items-center rounded-2xl pl-4 pr-5 py-3 md:py-4 transition-all duration-250 cursor-default w-full sm:w-auto interactive-card shimmer-hover"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            backgroundColor: '#111E2E',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            animation: 'slide-in-up 0.4s ease-out both',
            animationDelay: `${index * 80}ms`,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.30)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(99,102,241,0.18), 0 0 0 1px rgba(99,102,241,0.10)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            (e.currentTarget as HTMLElement).style.transform = '';
          }}
        >
          {/* Icon */}
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-250 shrink-0 group-hover:scale-110"
            style={{
              background: 'rgba(99,102,241,0.12)',
              color: '#818CF8',
              border: '1px solid rgba(99,102,241,0.18)',
            }}
          >
            {React.cloneElement(getMethodIcon(method.name) as React.ReactElement<{ className?: string }>, {
              className: 'w-5 h-5 md:w-6 md:h-6',
            })}
          </div>

          {/* Label + Amount */}
          <div className="ml-3 md:ml-4 flex flex-col min-w-0 justify-center">
            <span className="text-xs font-bold uppercase tracking-widest leading-none mb-1.5" style={{ color: '#818CF8' }}>
              {method.name}
            </span>
            <span
              className="text-lg md:text-xl font-black leading-none tabular-nums"
              style={{ color: '#F1F5F9' }}
            >
              ৳ {(Number(method.balance) || 0).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
