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
    <div className="h-full overflow-y-auto w-full relative" style={{ backgroundColor: '#080E1A' }}>
      {/* ── Background Ambient Glow Orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-[10%] -right-[5%] w-[60%] h-[60%]"
          style={{
            borderRadius: '9999px',
            filter: 'blur(130px)',
            background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(8,14,26,0) 70%)',
            animation: 'glow-breathe 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-[40%] -left-[10%] w-[55%] h-[55%]"
          style={{
            borderRadius: '9999px',
            filter: 'blur(140px)',
            background: 'radial-gradient(circle, rgba(244,63,94,0.10) 0%, rgba(8,14,26,0) 70%)',
            animation: 'glow-breathe 7s ease-in-out infinite 1.5s',
          }}
        />
      </div>

      <div className="relative z-10 py-6 md:py-10 px-4 md:px-8 max-w-7xl mx-auto space-y-8 md:space-y-10">

        {/* ── Header & Summaries ── */}
        <div
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
          style={{ animation: 'slide-in-up 0.5s ease-out both' }}
        >
          <div className="space-y-1.5">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight" style={{ color: '#F1F5F9' }}>
              Debt &amp;{' '}
              <span style={{
                background: 'linear-gradient(90deg, #34D399, #10B981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Receivable
              </span>
            </h2>
            <p className="font-medium text-sm md:text-base" style={{ color: '#94A3B8' }}>
              Track money owed and money to collect.
            </p>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 gap-3 md:gap-5 w-full lg:w-auto">
            {/* Total Debt Card */}
            <div
              className="rounded-2xl md:rounded-3xl p-4 md:p-5 flex-1 min-w-[140px] md:min-w-[180px] transition-all"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                backgroundColor: '#0F1929',
                border: '1px solid rgba(244,63,94,0.22)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F43F5E]" />
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest" style={{ color: '#94A3B8' }}>Total Debt</p>
              </div>
              <p className="text-xl md:text-2xl lg:text-3xl font-black tabular-nums" style={{ color: '#F43F5E' }}>
                ৳ {totalDebt.toLocaleString()}
              </p>
            </div>

            {/* Total Receivable Card */}
            <div
              className="rounded-2xl md:rounded-3xl p-4 md:p-5 flex-1 min-w-[140px] md:min-w-[180px] transition-all"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                backgroundColor: '#0F1929',
                border: '1px solid rgba(16,185,129,0.22)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest" style={{ color: '#94A3B8' }}>Total Receivable</p>
              </div>
              <p className="text-xl md:text-2xl lg:text-3xl font-black tabular-nums" style={{ color: '#10B981' }}>
                ৳ {totalReceivable.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10"
          style={{ animation: 'slide-in-up 0.5s ease-out both', animationDelay: '120ms' }}
        >
          {/* ── My Debts Section ── */}
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg md:text-xl font-bold flex items-center gap-2.5" style={{ color: '#F1F5F9' }}>
                <span
                  className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center font-black text-sm"
                  style={{
                    background: 'rgba(244,63,94,0.12)',
                    color: '#F43F5E',
                    border: '1px solid rgba(244,63,94,0.25)',
                  }}
                >
                  -
                </span>
                My Debts
              </h3>
              <span
                className="text-xs font-black px-3 py-1 rounded-full whitespace-nowrap"
                style={{
                  background: 'rgba(244,63,94,0.10)',
                  color: '#FB7185',
                  border: '1px solid rgba(244,63,94,0.22)',
                }}
              >
                I owe people
              </span>
            </div>

            <div className="space-y-4">
              {myDebts.length > 0 ? (
                myDebts.map((contact: IOUContactType) => (
                  <DebtReceivableCard key={contact._id} contact={contact} iouType="debt" />
                ))
              ) : (
                <div
                  className="rounded-3xl py-14 px-8 text-center space-y-2"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px dashed rgba(255,255,255,0.08)',
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>No pending debts found.</p>
                </div>
              )}
            </div>
          </div>

          {/* ── My Receivables Section ── */}
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg md:text-xl font-bold flex items-center gap-2.5" style={{ color: '#F1F5F9' }}>
                <span
                  className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center font-black text-sm"
                  style={{
                    background: 'rgba(16,185,129,0.12)',
                    color: '#10B981',
                    border: '1px solid rgba(16,185,129,0.25)',
                  }}
                >
                  +
                </span>
                My Receivables
              </h3>
              <span
                className="text-xs font-black px-3 py-1 rounded-full whitespace-nowrap"
                style={{
                  background: 'rgba(16,185,129,0.10)',
                  color: '#34D399',
                  border: '1px solid rgba(16,185,129,0.22)',
                }}
              >
                People owe me
              </span>
            </div>

            <div className="space-y-4">
              {myReceivables.length > 0 ? (
                myReceivables.map((contact: IOUContactType) => (
                  <DebtReceivableCard key={contact._id} contact={contact} iouType="receivable" />
                ))
              ) : (
                <div
                  className="rounded-3xl py-14 px-8 text-center space-y-2"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px dashed rgba(255,255,255,0.08)',
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>No active receivables found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
