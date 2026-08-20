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

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsMenuOpen(true);
    requestAnimationFrame(() => setMenuVisible(true));
  };

  const closeMenu = () => {
    setMenuVisible(false);
    closeTimer.current = setTimeout(() => setIsMenuOpen(false), 260);
  };

  const toggleMenu = () => (menuVisible ? closeMenu() : openMenu());

  useEffect(() => {
    closeMenu();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <header
      className="sticky top-0 z-50 px-4 md:px-10 py-3 md:py-3.5"
      style={{
        background: 'rgba(8,14,26,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 40px rgba(0,0,0,0.5), 0 0 0 0 transparent',
      }}
    >
      {/* Gradient accent line along the bottom of the header */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.5) 30%, rgba(139,92,246,0.4) 70%, transparent 100%)' }}
      />

      <div className={`${isFullWidthPage ? 'max-w-full' : 'max-w-7xl mx-auto'} flex items-center justify-between`}>

        {/* Left: Branding */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              boxShadow: '0 4px 16px rgba(99,102,241,0.40)',
            }}
          >
            {/* Coin icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span
            className="text-xl md:text-2xl font-black tracking-tight transition-all duration-300"
            style={{ color: '#F1F5F9' }}
          >
            Coin<span style={{
              background: 'linear-gradient(90deg, #818CF8, #C084FC)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>ly</span>
          </span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3">

          {/* Balance chip — glassmorphism */}
          {typeof balance === 'number' && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl mr-1 md:mr-2"
              style={{
                background: 'rgba(99,102,241,0.10)',
                border: '1px solid rgba(99,102,241,0.22)',
              }}
            >
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>Balance</span>
              <span
                className="text-xs md:text-sm font-black tabular-nums"
                style={{
                  background: 'linear-gradient(90deg, #818CF8, #C084FC)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ৳ {balance.toLocaleString()}
              </span>
            </div>
          )}

          {/* Profile & Logout — Desktop */}
          <div className="hidden md:flex items-center gap-1 ml-1">
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 text-sm font-bold"
              style={
                pathname === '/profile'
                  ? {
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      color: 'white',
                      boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                    }
                  : {
                      color: '#64748B',
                      background: 'transparent',
                    }
              }
              onMouseEnter={e => {
                if (pathname !== '/profile') {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLElement).style.color = '#F1F5F9';
                }
              }}
              onMouseLeave={e => {
                if (pathname !== '/profile') {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#64748B';
                }
              }}
              title="Profile Settings"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={
                  pathname === '/profile'
                    ? { background: 'rgba(255,255,255,0.2)' }
                    : { background: 'rgba(255,255,255,0.05)', color: '#64748B' }
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="max-w-25 truncate">{username}</span>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="p-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
                style={{ color: '#64748B' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = '#F43F5E';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = '#64748B';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
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
            className="md:hidden p-2 rounded-xl transition-colors active:scale-95"
            style={{ color: '#64748B' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLElement).style.color = '#F1F5F9';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = '#64748B';
            }}
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              <span className="absolute left-0 h-0.5 w-6 bg-current rounded-full transition-all duration-200"
                style={{ top: menuVisible ? '50%' : '25%', transform: menuVisible ? 'translateY(-50%) rotate(45deg)' : 'translateY(-50%)' }} />
              <span className="absolute left-0 top-1/2 h-0.5 w-6 bg-current rounded-full transition-all duration-200"
                style={{ opacity: menuVisible ? 0 : 1, transform: 'translateY(-50%)' }} />
              <span className="absolute left-0 h-0.5 w-6 bg-current rounded-full transition-all duration-200"
                style={{ top: menuVisible ? '50%' : '75%', transform: menuVisible ? 'translateY(-50%) rotate(-45deg)' : 'translateY(-50%)' }} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div
          className="absolute top-[calc(100%+6px)] right-4 w-56 p-1.5 md:hidden flex flex-col gap-0.5 z-50 origin-top-right"
          style={{
            background: 'rgba(8,14,26,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '1rem',
            boxShadow: '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)',
            transition: 'opacity 0.22s ease, transform 0.22s ease',
            opacity: menuVisible ? 1 : 0,
            transform: menuVisible ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(-10px)',
          }}
        >
          <Link
            href="/profile"
            className="px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all w-full active:scale-95"
            style={{ color: '#CBD5E1' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            onClick={closeMenu}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="font-bold" style={{ color: '#F1F5F9' }}>Profile</span>
          </Link>

          <form action={logoutAction} className="w-full">
            <button
              type="submit"
              className="px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all w-full active:scale-95"
              style={{ color: '#F43F5E' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.10)', color: '#F43F5E' }}>
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
