import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getIOUContacts } from '@/app/actions/iou';
import { DebtReceivableCard } from '@/components/DebtReceivableCard';

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

  const myReceivables = contacts.filter((c: IOUContactType) => {
    if (c.total_receivable > 0) return true;
    if (c.total_debt > 0) return false;
    return c.primary_type === 'receivable' || !c.primary_type;
  });
  const myDebts = contacts.filter((c: IOUContactType) => {
    if (c.total_debt > 0) return true;
    if (c.total_receivable > 0) return false;
    return c.primary_type === 'debt';
  });

  const totalReceivable = myReceivables.reduce((acc: number, c: IOUContactType) => acc + (c.total_receivable || 0), 0);
  const totalDebt = myDebts.reduce((acc: number, c: IOUContactType) => acc + (c.total_debt || 0), 0);

  return (
    <div className="h-full overflow-y-auto w-full bg-[#0F172A]">
      <div className="py-6 md:py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8 md:space-y-12">

        {/* Header & Summaries */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 animate-in slide-in-top duration-500">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-black text-[#F8FAFC] tracking-tight leading-tight font-poppins">
              Debt & <span className="text-[#22C55E]">Receivable</span>
            </h2>
            <p className="text-[#94A3B8] font-medium text-lg md:text-xl">Track your financial exchanges 💸</p>
          </div>

          <div className="flex gap-4 md:gap-6">
            <div className="bg-[#1E293B] border border-[#334155] rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex-1 min-w-[140px] md:min-w-[200px]">
              <p className="text-[10px] md:text-xs font-black text-[#94A3B8] uppercase tracking-widest mb-1 md:mb-2">Total Debt</p>
              <p className="text-xl md:text-3xl font-black text-[#F43F5E]">৳ {totalDebt.toLocaleString()}</p>
            </div>
            <div className="bg-[#1E293B] border border-[#334155] rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex-1 min-w-[140px] md:min-w-[200px]">
              <p className="text-[10px] md:text-xs font-black text-[#94A3B8] uppercase tracking-widest mb-1 md:mb-2">Total Receivable</p>
              <p className="text-xl md:text-3xl font-black text-[#22C55E]">৳ {totalReceivable.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-700 delay-200">

          {/* My Debt Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-3">
                <span className="w-10 h-10 bg-[#F43F5E]/10 text-[#F43F5E] rounded-xl flex items-center justify-center border border-[#F43F5E]/20 shadow-sm font-black">
                  -
                </span>
                My Debts
              </h3>
              <span className="bg-[#F43F5E]/20 text-[#A22036] text-[13px] font-black px-3 py-1 rounded-full tracking-tighter shadow-sm whitespace-nowrap flex-shrink-0" style={{color: '#FDA4AF'}}>I owe people</span>
            </div>

            <div className="space-y-6">
              {myDebts.length > 0 ? (
                myDebts.map((contact: IOUContactType) => (
                  <DebtReceivableCard key={contact._id} contact={contact} iouType="debt" />
                ))
              ) : (
                <div className="bg-[#1E293B] border border-[#334155] rounded-[2rem] py-20 px-10 text-center space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                  <p className="text-[#94A3B8] font-medium">No pending debts found.</p>
                </div>
              )}
            </div>
          </div>


          {/* My Receivable Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-3">
                <span className="w-10 h-10 bg-[#22C55E]/10 text-[#22C55E] rounded-xl flex items-center justify-center border border-[#22C55E]/20 shadow-sm font-black">
                  +
                </span>
                My Receivables
              </h3>
              <span className="bg-[#22C55E]/20 text-[#22C55E] text-[13px] font-black px-3 py-1 rounded-full tracking-tighter shadow-sm whitespace-nowrap flex-shrink-0">People owe me</span>
            </div>

            <div className="space-y-6">
              {myReceivables.length > 0 ? (
                myReceivables.map((contact: IOUContactType) => (
                  <DebtReceivableCard key={contact._id} contact={contact} iouType="receivable" />
                ))
              ) : (
                <div className="bg-[#1E293B] border border-[#334155] rounded-[2rem] py-20 px-10 text-center space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                  <p className="text-[#94A3B8] font-medium">No active receivables found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
