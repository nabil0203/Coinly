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
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-[#f8fafc] px-4">
      {/* Decorative Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-b from-blue-300/30 to-purple-300/10 blur-[100px]"></div>
        <div className="absolute top-[60%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-t from-cyan-300/30 to-blue-300/10 blur-[100px]"></div>
      </div>

      {/* Floating Finance Icons for Context */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top Left Wallet */}
        <div className="absolute top-[2%] md:top-[10%] -left-[10%] md:left-[15%] text-blue-500/5 rotate-[-15deg] transform scale-75 md:scale-150 opacity-60 md:opacity-100">
          <svg className="w-48 h-48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
          </svg>
        </div>
        {/* Bottom Left Chart - Hidden on very small mobile */}
        <div className="hidden sm:block absolute bottom-[20%] left-[2%] md:left-[10%] text-indigo-500/5 rotate-[15deg] transform scale-100 md:scale-125">
          <svg className="w-56 h-56" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
        </div>
        {/* Top Right Banknotes - Hidden on very small mobile */}
        <div className="hidden sm:block absolute top-[15%] right-[5%] md:right-[15%] text-cyan-500/5 rotate-[20deg] transform scale-100 md:scale-150">
          <svg className="w-40 h-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        </div>
        {/* Bottom Right Credit Card */}
        <div className="absolute bottom-[2%] md:bottom-[10%] -right-[15%] md:right-[10%] text-blue-600/5 rotate-[-25deg] transform scale-75 md:scale-125 opacity-60 md:opacity-100">
          <svg className="w-64 h-64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
      </div>

      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white/60 p-8 sm:p-10 text-center transition-all duration-500 hover:shadow-[0_16px_60px_rgb(0,0,0,0.06)] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out z-10">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Coinly</h1>
        </div>
        <p className="text-slate-500 font-medium mb-10 text-sm sm:text-base">A personalbfinancial application</p>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold animate-in shake-in duration-300 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-2 group">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-blue-600 transition-colors">Username</label>
            <input
              name="username"
              type="text"
              placeholder="Enter username"
              className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400 hover:border-slate-300 shadow-sm"
              required
            />
          </div>
          <div className="space-y-2 group">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">Password</label>
            </div>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400 hover:border-slate-300 shadow-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full relative flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 active:scale-[0.98] mt-8 disabled:opacity-80 disabled:cursor-wait transition-all duration-300 overflow-hidden group/btn"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative flex items-center justify-center">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

        {/* <p className="mt-8 text-slate-500 font-medium">
          New here? <Link href="/register" className="text-blue-600 font-bold hover:text-indigo-600 transition-colors hover:underline underline-offset-4">Create account</Link>
        </p> */}

        <p className="mt-8 text-slate-500 text-sm font-medium">
          Managed by <a href="https://github.com/nabil0203" target="_blank" className="text-blue-600 font-bold hover:underline">Chowdhury Nabil Ahmed</a>
        </p>
      </div>
    </div>
  );
}
