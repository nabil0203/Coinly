import React from 'react';

export default function DebtsLoading() {
  return (
    <div className="h-full py-6 md:py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8 md:space-y-12 animate-pulse">
      
      {/* Header & Summaries */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="h-10 md:h-12 w-64 bg-slate-200 rounded-lg"></div>
          <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
        </div>

        <div className="flex gap-4 md:gap-6">
          <div className="h-24 md:h-32 w-[140px] md:w-[200px] bg-white border border-slate-100 rounded-2xl md:rounded-3xl shadow-sm"></div>
          <div className="h-24 md:h-32 w-[140px] md:w-[200px] bg-white border border-slate-100 rounded-2xl md:rounded-3xl shadow-sm"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="h-8 w-40 bg-slate-200 rounded-lg"></div>
            <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
          </div>
          <div className="space-y-6">
            <div className="h-32 bg-white border border-slate-100 rounded-[2rem] shadow-sm"></div>
            <div className="h-32 bg-white border border-slate-100 rounded-[2rem] shadow-sm"></div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="h-8 w-40 bg-slate-200 rounded-lg"></div>
            <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
          </div>
          <div className="space-y-6">
            <div className="h-32 bg-white border border-slate-100 rounded-[2rem] shadow-sm"></div>
            <div className="h-32 bg-white border border-slate-100 rounded-[2rem] shadow-sm"></div>
          </div>
        </div>
      </div>

    </div>
  );
}
