import React from 'react';

export default function LedgerLoading() {
  return (
    <div className="h-full py-6 md:py-12 px-4 md:px-8 max-w-7xl mx-auto flex flex-col xl:flex-row gap-8 xl:gap-12 animate-pulse">
      
      {/* Left Column: Ledger controls and charts */}
      <div className="w-full xl:w-[45%] flex flex-col gap-8 xl:gap-10">
        
        <div className="space-y-4">
          <div className="h-10 md:h-12 w-1/2 bg-slate-200 rounded-lg"></div>
          <div className="h-6 w-1/3 bg-slate-200 rounded-lg"></div>
        </div>

        <div className="flex items-center gap-4 xl:gap-6">
          <div className="flex-1 h-32 md:h-40 bg-white border border-slate-100 rounded-[2rem] shadow-sm"></div>
          <div className="flex-1 h-32 md:h-40 bg-white border border-slate-100 rounded-[2rem] shadow-sm"></div>
        </div>

        <div className="h-[300px] md:h-[400px] bg-white border border-slate-100 rounded-[2.5rem] shadow-sm mt-4"></div>
      </div>

      {/* Right Column: Transactions List */}
      <div className="w-full xl:w-[55%] bg-white border border-slate-100 rounded-[2rem] xl:rounded-[3rem] p-4 md:p-6 xl:p-10 shadow-sm flex flex-col h-[600px] xl:h-[calc(100vh-8rem)]">
        <div className="h-8 w-48 lg:w-64 bg-slate-200 rounded-lg mb-8"></div>
        
        <div className="space-y-6 flex-1">
          <div className="space-y-4">
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-50 border border-slate-100 rounded-2xl"></div>
            <div className="h-20 bg-slate-50 border border-slate-100 rounded-2xl"></div>
          </div>
          <div className="space-y-4">
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-50 border border-slate-100 rounded-2xl"></div>
          </div>
        </div>
      </div>

    </div>
  );
}
