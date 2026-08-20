'use client';

import React, { useState } from 'react';
import { loginAction } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div
      className="flex items-center justify-center min-h-[100dvh] relative overflow-hidden px-4 py-8"
      style={{ backgroundColor: '#080E1A' }}
    >
      {/* ── Animated Background Ambient Glow Orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-right Indigo Orb */}
        <div
          className="absolute -top-[15%] -right-[5%] w-[65%] h-[65%]"
          style={{
            borderRadius: '9999px',
            filter: 'blur(130px)',
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(8,14,26,0) 70%)',
            animation: 'glow-breathe 5s ease-in-out infinite',
          }}
        />
        {/* Mid-left Violet Orb */}
        <div
          className="absolute top-[40%] -left-[10%] w-[55%] h-[55%]"
          style={{
            borderRadius: '9999px',
            filter: 'blur(140px)',
            background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, rgba(8,14,26,0) 70%)',
            animation: 'glow-breathe 7s ease-in-out infinite 1.5s',
          }}
        />
        {/* Bottom Emerald Orb */}
        <div
          className="absolute -bottom-[10%] right-[15%] w-[45%] h-[45%]"
          style={{
            borderRadius: '9999px',
            filter: 'blur(120px)',
            background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(8,14,26,0) 70%)',
            animation: 'glow-breathe 6s ease-in-out infinite 3s',
          }}
        />
      </div>

      {/* ── Floating Faint Decorative Icons ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-[2%] md:top-[8%] -left-[8%] md:left-[8%] rotate-[-15deg] transform scale-75 md:scale-125"
          style={{ color: 'rgba(99,102,241,0.04)' }}
        >
          <svg className="w-56 h-56" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
          </svg>
        </div>
        <div
          className="hidden sm:block absolute bottom-[15%] left-[5%] rotate-15"
          style={{ color: 'rgba(16,185,129,0.03)' }}
        >
          <svg className="w-56 h-56" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
        </div>
        <div
          className="absolute bottom-[2%] md:bottom-[8%] -right-[12%] md:right-[8%] rotate-[-20deg] transform scale-75 md:scale-125"
          style={{ color: 'rgba(139,92,246,0.04)' }}
        >
          <svg className="w-64 h-64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
      </div>

      {/* ── Glassmorphism Login Card ── */}
      <div
        className="relative w-full max-w-md rounded-4xl p-8 sm:p-10 text-center transition-all duration-300 z-10"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)',
          backgroundColor: '#0F1929',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 0 1px rgba(99,102,241,0.08), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(99,102,241,0.12)',
          animation: 'slide-in-up 0.5s ease-out both',
        }}
      >
        {/* Card Top Accent Line */}
        <div
          className="absolute top-0 left-10 right-10 h-px pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.6) 50%, transparent 100%)',
          }}
        />

        {/* ── Header Brand ── */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 transition-transform duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              boxShadow: '0 8px 24px rgba(99,102,241,0.40)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: '#F1F5F9' }}>
            Coin<span style={{
              background: 'linear-gradient(90deg, #818CF8, #C084FC)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>ly</span>
          </h1>
          <p className="font-medium text-xs sm:text-sm mt-1.5" style={{ color: '#94A3B8' }}>
            Personal Finance &amp; Wealth Management
          </p>
        </div>

        {/* ── Error Notification ── */}
        {error && (
          <div
            className="mb-6 p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5"
            style={{
              background: 'rgba(244,63,94,0.12)',
              color: '#FB7185',
              border: '1px solid rgba(244,63,94,0.30)',
              animation: 'shake 0.4s ease-in-out both',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Username Field */}
          <div className="space-y-1.5">
            <label
              className="text-[10px] font-extrabold uppercase tracking-widest block ml-1"
              style={{ color: '#94A3B8' }}
            >
              Username
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                name="username"
                type="text"
                placeholder="Enter username"
                required
                className="w-full rounded-xl pl-11 pr-4 py-3 text-sm font-semibold transition-all outline-none"
                style={{
                  backgroundColor: '#0A1525',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#F1F5F9',
                }}
                onFocus={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#6366F1';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(99,102,241,0.4)';
                }}
                onBlur={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label
              className="text-[10px] font-extrabold uppercase tracking-widest block ml-1"
              style={{ color: '#94A3B8' }}
            >
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                className="w-full rounded-xl pl-11 pr-11 py-3 text-sm font-semibold transition-all outline-none"
                style={{
                  backgroundColor: '#0A1525',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#F1F5F9',
                }}
                onFocus={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#6366F1';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(99,102,241,0.4)';
                }}
                onBlur={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors cursor-pointer"
                style={{ color: '#64748B' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F1F5F9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B'; }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full relative flex items-center justify-center font-black py-3.5 rounded-xl transition-all duration-300 mt-6 active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(99,102,241,0.50)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(99,102,241,0.35)';
              (e.currentTarget as HTMLElement).style.transform = '';
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* ── Footer ── */}
        <p className="mt-8 text-xs font-medium" style={{ color: '#64748B' }}>
          Managed by{' '}
          <a
            href="https://github.com/nabil0203"
            target="_blank"
            rel="noreferrer"
            className="font-bold transition-all"
            style={{ color: '#818CF8' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C084FC'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#818CF8'; }}
          >
            Chowdhury Nabil Ahmed
          </a>
        </p>
      </div>
    </div>
  );
}
