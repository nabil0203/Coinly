'use client';

import React, { useState } from 'react';
import { loginAction } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[100dvh] relative overflow-hidden bg-[#0F172A] px-4">
      {/* Decorative Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(15,23,42,0) 70%)' }}></div>
        <div className="absolute top-[60%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(15,23,42,0) 70%)' }}></div>
      </div>

      {/* Floating Finance Icons for Context */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top Left Wallet */}
        <div className="absolute top-[2%] md:top-[10%] -left-[10%] md:left-[15%] rotate-[-15deg] transform scale-75 md:scale-150 opacity-60 md:opacity-100" style={{ color: 'rgba(99,102,241,0.06)' }}>
          <svg className="w-48 h-48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
          </svg>
        </div>
        {/* Bottom Left Chart - Hidden on very small mobile */}
        <div className="hidden sm:block absolute bottom-[20%] left-[2%] md:left-[10%] rotate-[15deg] transform scale-100 md:scale-125" style={{ color: 'rgba(99,102,241,0.04)' }}>
          <svg className="w-56 h-56" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
        </div>
        {/* Bottom Right Credit Card */}
        <div className="absolute bottom-[2%] md:bottom-[10%] -right-[15%] md:right-[10%] rotate-[-25deg] transform scale-75 md:scale-125 opacity-60 md:opacity-100" style={{ color: 'rgba(99,102,241,0.06)' }}>
          <svg className="w-64 h-64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
      </div>

      <div className="relative w-full max-w-md bg-[#1E293B]/80 backdrop-blur-2xl rounded-[2.5rem] border border-[#334155]/60 p-8 sm:p-10 text-center transition-all duration-500 shadow-[0_8px_40px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-4 z-10">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', boxShadow: '0 8px 20px rgba(99,102,241,0.25)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-[#F8FAFC] tracking-tight">Coinly</h1>
        </div>
        <p className="text-[#94A3B8] font-medium mb-10 text-sm sm:text-base">A personal financial application</p>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-[#F43F5E]/10 text-[#F43F5E] border border-[#F43F5E]/20 text-sm font-bold animate-in shake-in duration-300 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-2 group">
            <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider ml-1 transition-colors">Username</label>
            <input
              name="username"
              type="text"
              placeholder="Enter username"
              className="input-dark px-5 py-4 w-full bg-[#0F172A]"
              required
            />
          </div>
          <div className="space-y-2 group">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider transition-colors">Password</label>
            </div>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="input-dark px-5 py-4 w-full bg-[#0F172A]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full relative flex items-center justify-center text-white font-bold py-4 rounded-2xl hover:-translate-y-0.5 active:scale-[0.98] mt-8 disabled:opacity-80 disabled:cursor-wait transition-all duration-300 overflow-hidden group/btn"
            style={{ background: 'linear-gradient(90deg, #6366F1 0%, #4F46E5 100%)', boxShadow: '0 4px 15px rgba(99,102,241,0.25)' }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative flex items-center justify-center">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </span>
          </button>
        </form>

        <p className="mt-8 text-[#94A3B8] text-sm font-medium">
          Managed by <a href="https://github.com/nabil0203" target="_blank" className="font-bold hover:underline transition-colors text-[#6366F1]">Chowdhury Nabil Ahmed</a>
        </p>
      </div>
    </div>
  );
}
