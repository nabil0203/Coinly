import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="h-full overflow-y-auto py-6 md:py-12 px-4 md:px-8 max-w-7xl mx-auto animate-pulse">
      
      <div className="mb-8 lg:mb-12">
        <div className="h-10 md:h-12 lg:h-14 w-3/4 md:w-1/2 lg:w-1/3 bg-slate-200 rounded-lg mb-4"></div>
        <div className="hidden lg:block h-6 w-1/4 bg-slate-200 rounded-lg mt-2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        
        <div className="lg:col-span-7 order-1 space-y-6 md:space-y-10">
          <div className="bg-white border border-slate-100 rounded-[2rem] lg:rounded-[2.5rem] p-4 md:p-8 lg:p-10 shadow-sm">
            <div className="h-4 w-32 bg-slate-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
              <div className="h-32 bg-slate-100 rounded-2xl"></div>
              <div className="h-32 bg-slate-100 rounded-2xl"></div>
              <div className="h-32 bg-slate-100 rounded-2xl"></div>
              <div className="h-32 bg-slate-100 rounded-2xl"></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 order-2 flex flex-col gap-4 lg:gap-8">
          
          <div className="flex items-center justify-between px-1">
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
            <span className="lg:hidden w-1/2 h-px bg-slate-200"></span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 lg:gap-6">
            <div className="h-24 lg:h-32 bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm"></div>
            <div className="h-24 lg:h-32 bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm"></div>
            <div className="col-span-2 h-20 lg:h-24 bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm"></div>
            <div className="col-span-2 h-20 lg:h-24 bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
