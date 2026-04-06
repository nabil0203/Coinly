import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getIOUContacts } from '@/app/actions/iou';
import { IOUContactCard } from '@/components/IOUContactCard';

interface IOUContactType {
  _id: string;
  name: string;
  total_receivable: number;
  total_debt: number;
  primary_type?: string;
}

export default async function DebtsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const contacts = await getIOUContacts();

  // A contact appears in a section whenever it has an active balance for that type.
  // This correctly handles mixed contacts (e.g. someone you both owe and lend to)
  // by showing them in both columns with only the relevant transactions in each.
  // Settled contacts (both balances = 0) use primary_type to stay in their original section.
  const myReceivables = contacts.filter((c: IOUContactType) => {
    if (c.total_receivable > 0) return true;                  // Has active receivables
    if (c.total_debt > 0) return false;                       // Only active debts — skip
    return c.primary_type === 'receivable' || !c.primary_type; // Settled: use primary_type
  });
  const myDebts = contacts.filter((c: IOUContactType) => {
    if (c.total_debt > 0) return true;                        // Has active debts
    if (c.total_receivable > 0) return false;                 // Only active receivables — skip
    return c.primary_type === 'debt';                         // Settled: use primary_type
  });

  // Totals derived from their respective filtered lists so header numbers match the columns shown.
  const totalReceivable = myReceivables.reduce((acc: number, c: IOUContactType) => acc + (c.total_receivable || 0), 0);
  const totalDebt = myDebts.reduce((acc: number, c: IOUContactType) => acc + (c.total_debt || 0), 0);

  return (
    <div className="h-full overflow-y-auto w-full">
      <div className="py-6 md:py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8 md:space-y-12">

        {/* Header & Summaries */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 animate-in slide-in-top duration-500">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-black text-fintech-text-main tracking-tight leading-tight font-poppins">
              Debt & <span className="text-purple-600">Receivable</span>
            </h2>
            <p className="text-fintech-text-muted font-medium text-lg md:text-xl">Track your financial exchanges 💸</p>
          </div>

          <div className="flex gap-4 md:gap-6">
            <div className="bg-white border border-fintech-border rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-fintech-card flex-1 min-w-[140px] md:min-w-[200px]">
              <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2">Total Debt</p>
              <p className="text-xl md:text-3xl font-black text-red-600">৳ {totalDebt.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-fintech-border rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-fintech-card flex-1 min-w-[140px] md:min-w-[200px]">
              <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2">Total Receivable</p>
              <p className="text-xl md:text-3xl font-black text-green-600">৳ {totalReceivable.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-700 delay-200">

          {/* My Debt Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <span className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100 shadow-sm font-black">
                  -
                </span>
                My Debts
              </h3>
              <span className="bg-red-300 text-black-700 text-[13px] font-black px-3 py-1 rounded-full tracking-tighter shadow-sm whitespace-nowrap flex-shrink-0">I owe people</span>
            </div>

            <div className="space-y-6">
              {myDebts.length > 0 ? (
                myDebts.map((contact: IOUContactType) => (
                  <IOUContactCard key={contact._id} contact={contact} iouType="debt" />
                ))
              ) : (
                <div className="bg-white border border-fintech-border rounded-[2rem] py-20 px-10 text-center space-y-4 shadow-fintech-card">
                  <p className="text-slate-400 font-medium">No pending debts found.</p>
                </div>
              )}
            </div>
          </div>


          {/* My Receivable Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <span className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center border border-green-100 shadow-sm font-black">
                  +
                </span>
                My Receivables
              </h3>
              <span className="bg-blue-300 text-black-700 text-[13px] font-black px-3 py-1 rounded-full tracking-tighter shadow-sm whitespace-nowrap flex-shrink-0">People owe me</span>
            </div>

            <div className="space-y-6">
              {myReceivables.length > 0 ? (
                myReceivables.map((contact: IOUContactType) => (
                  <IOUContactCard key={contact._id} contact={contact} iouType="receivable" />
                ))
              ) : (
                <div className="bg-white border border-fintech-border rounded-[2rem] py-20 px-10 text-center space-y-4 shadow-fintech-card">
                  <p className="text-slate-400 font-medium">No active receivables found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
