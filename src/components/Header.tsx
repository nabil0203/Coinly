'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';

export function Header({ username, balance }: { username: string; balance?: number }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const pathname = usePathname();
  const isFullWidthPage = pathname === '/ledger' || pathname === '/profile';
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animated open/close: keep DOM alive while transition out
  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsMenuOpen(true);
    requestAnimationFrame(() => setMenuVisible(true));
  };

  const closeMenu = () => {
    setMenuVisible(false);
    closeTimer.current = setTimeout(() => setIsMenuOpen(false), 250);
  };

  const toggleMenu = () => (menuVisible ? closeMenu() : openMenu());

  // Close on route change
  useEffect(() => {
    closeMenu();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-[#1E293B]/90 backdrop-blur-md border-b border-[#334155] shadow-[0_1px_20px_rgba(0,0,0,0.4)] px-4 md:px-10 py-3 md:py-4">
      <div className={`${isFullWidthPage ? 'max-w-full' : 'max-w-7xl mx-auto'} flex items-center justify-between`}>

        {/* Left: Branding */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tight text-[#F8FAFC] transition-colors duration-300 group-hover:text-[#818CF8]">Coinly</span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Balance indicator */}
          {typeof balance === 'number' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#263347] border border-[#334155] rounded-lg mr-1 md:mr-2">
              <span className="hidden md:block text-[10px] font-bold text-[#94A3B8] uppercase tracking-tight">Balance</span>
              <span className="text-xs md:text-sm font-black text-[#6366F1] tabular-nums">৳ {balance.toLocaleString()}</span>
            </div>
          )}

          {/* Profile & Logout — Desktop */}
          <div className="hidden md:flex items-center gap-1 ml-1">
            <Link
              href="/profile"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-bold ${
                pathname === '/profile'
                  ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/25'
                  : 'text-[#94A3B8] hover:bg-[#263347] hover:text-[#F8FAFC]'
              }`}
              title="Profile Settings"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${pathname === '/profile' ? 'bg-white/20' : 'bg-[#263347] text-[#94A3B8]'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="max-w-[100px] truncate">{username}</span>
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="p-2.5 text-[#94A3B8] hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-xl transition-all active:scale-95"
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
            onClick={toggleMenu}
            className="md:hidden p-2 text-[#94A3B8] hover:bg-[#263347] rounded-xl transition-colors active:scale-95"
            aria-label="Toggle menu"
          >
            {/* Animated hamburger ↔ X */}
            <div className="relative w-6 h-6">
              {/* Top bar */}
              <span
                className="absolute left-0 h-0.5 w-6 bg-current rounded-full transition-all duration-200"
                style={{
                  top: menuVisible ? '50%' : '25%',
                  transform: menuVisible ? 'translateY(-50%) rotate(45deg)' : 'translateY(-50%)',
                }}
              />
              {/* Middle bar */}
              <span
                className="absolute left-0 top-1/2 h-0.5 w-6 bg-current rounded-full transition-all duration-200"
                style={{
                  opacity: menuVisible ? 0 : 1,
                  transform: 'translateY(-50%)',
                }}
              />
              {/* Bottom bar */}
              <span
                className="absolute left-0 h-0.5 w-6 bg-current rounded-full transition-all duration-200"
                style={{
                  top: menuVisible ? '50%' : '75%',
                  transform: menuVisible ? 'translateY(-50%) rotate(-45deg)' : 'translateY(-50%)',
                }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown — kept in DOM for exit animation */}
      {isMenuOpen && (
        <div
          className="absolute top-[calc(100%+8px)] right-4 w-56 bg-[#1E293B]/95 backdrop-blur-xl border border-[#334155] rounded-2xl shadow-2xl shadow-black/40 p-2 md:hidden flex flex-col gap-1 z-50 origin-top-right"
          style={{
            transition: 'opacity 0.22s ease, transform 0.22s ease',
            opacity: menuVisible ? 1 : 0,
            transform: menuVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-8px)',
          }}
        >
          <Link
            href="/profile"
            className="px-4 py-3 hover:bg-[#263347] rounded-xl flex items-center gap-3 transition-all w-full border border-transparent hover:border-[#334155] active:scale-95"
            onClick={closeMenu}
          >
            <div className="w-8 h-8 rounded-lg bg-[#263347] flex items-center justify-center text-[#94A3B8]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="font-bold text-[#F8FAFC]">Profile</span>
          </Link>
          <form action={logoutAction} className="w-full">
            <button
              type="submit"
              className="px-4 py-3 hover:bg-[#F43F5E]/10 text-[#F43F5E] rounded-xl flex items-center gap-3 transition-all w-full border border-transparent hover:border-[#F43F5E]/20 active:scale-95"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F43F5E]/10 flex items-center justify-center text-[#F43F5E]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
