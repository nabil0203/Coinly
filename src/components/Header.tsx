'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';

export function Header({ username, balance }: { username: string; balance?: number }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isFullWidthPage = pathname === '/ledger' || pathname === '/profile';

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm px-4 md:px-10 py-3 md:py-5">
      <div className={`${isFullWidthPage ? 'max-w-full' : 'max-w-7xl mx-auto'} flex items-center justify-between`}>
        
        {/* Left: Branding */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 group-hover:text-blue-600 transition-colors duration-300">Coinly</span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Balance subtle indicator */}
          {typeof balance === 'number' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg mr-1 md:mr-2">
              <span className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-tight">Balance</span>
              <span className="text-xs md:text-sm font-black text-slate-600 tabular-nums">৳ {balance.toLocaleString()}</span>
            </div>
          )}

          {/* Profile & Logout Desktop */}
          <div className="hidden md:flex items-center gap-2 ml-2">
            <Link 
              href="/profile" 
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-bold ${pathname === '/profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
              title="Profile Settings"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="max-w-[100px] truncate">{username}</span>
            </Link>
            <form action={logoutAction}>
              <button 
                type="submit"
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-[calc(100%+12px)] right-4 w-60 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-2 md:hidden flex flex-col gap-1 items-end z-50 animate-fade-in animate-slide-in-top">
          <Link 
            href="/profile" 
            className="px-4 py-3 hover:bg-slate-50 rounded-2xl flex items-center gap-3 text-right transition-all w-full justify-end border border-transparent hover:border-slate-100 group active:scale-95"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="font-bold text-slate-700">Profile</span>
          </Link>
          <form action={logoutAction} className="w-full flex justify-end">
            <button 
              type="submit"
              className="px-4 py-3 hover:bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-right transition-all w-full justify-end border border-transparent hover:border-red-100 group active:scale-95"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50/50 flex items-center justify-center text-red-400 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="font-bold">Logout</span>
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
