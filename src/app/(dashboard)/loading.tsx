import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="h-full overflow-y-auto w-full relative bg-[#0F172A]">

      {/* Decorative background (matches Home.tsx) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(15,23,42,0) 70%)' }} />
        <div className="absolute top-[60%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, rgba(15,23,42,0) 70%)' }} />
      </div>

      <div className="relative z-10 py-6 md:py-12 px-4 md:px-8 max-w-7xl mx-auto">

        {/* Welcome header skeleton */}
        <div className="mb-8 lg:mb-12 text-center lg:text-left">
          <div className="skeleton h-10 md:h-12 lg:h-14 w-3/4 md:w-1/2 lg:w-2/5 mx-auto lg:mx-0 mb-3 rounded-2xl" />
          <div className="skeleton hidden lg:block h-5 w-44 rounded-lg" style={{ animationDelay: '80ms' }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">

          {/* Payment Methods Panel skeleton */}
          <div className="lg:col-span-7 order-1 space-y-4 lg:space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="skeleton h-3 w-24 rounded" style={{ animationDelay: '50ms' }} />
            </div>
            <div className="bg-[#1E293B] border border-[#334155] rounded-[2rem] lg:rounded-[2.5rem] p-4 md:p-8 lg:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <div className="w-full flex flex-wrap justify-center gap-3 md:gap-4 px-2 md:px-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="skeleton flex items-center rounded-2xl w-full sm:w-auto h-[58px] md:h-[68px] sm:min-w-[160px] md:min-w-[180px]"
                    style={{ animationDelay: `${100 + i * 80}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions skeleton */}
          <div className="lg:col-span-5 order-2 flex flex-col gap-4 lg:gap-8">
            <div className="flex items-center justify-between px-1">
              <div className="skeleton h-3 w-28 rounded" style={{ animationDelay: '60ms' }} />
            </div>

            <div className="grid grid-cols-2 gap-3 lg:gap-5">
              {/* Expense */}
              <div
                className="skeleton h-[88px] lg:h-[96px] rounded-2xl lg:rounded-3xl"
                style={{ animationDelay: '150ms' }}
              />
              {/* Cash In */}
              <div
                className="skeleton h-[88px] lg:h-[96px] rounded-2xl lg:rounded-3xl"
                style={{ animationDelay: '220ms' }}
              />
              {/* Monthly Ledger */}
              <div
                className="col-span-2 skeleton h-[76px] lg:h-[84px] rounded-2xl lg:rounded-3xl"
                style={{ animationDelay: '290ms' }}
              />
              {/* Debt & Receivable */}
              <div
                className="col-span-2 skeleton h-[76px] lg:h-[84px] rounded-2xl lg:rounded-3xl"
                style={{ animationDelay: '360ms' }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
