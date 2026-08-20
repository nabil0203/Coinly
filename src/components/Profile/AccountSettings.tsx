'use client';

import React, { useState } from 'react';

interface AccountSettingsProps {
  user: {
    username: string;
    email: string;
  };
  changePasswordAction: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
}

export function AccountSettings({ user, changePasswordAction }: AccountSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorPos, setErrorPos] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorPos('');

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setErrorPos('New passwords do not match');
      setLoading(false);
      return;
    }

    const res = await changePasswordAction(formData);

    if (res?.error) setErrorPos(res.error);
    else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    }

    setLoading(false);
  }

  return (
    <div className="space-y-8" style={{ animation: 'slide-in-up 0.4s ease-out both' }}>
      {/* ── Security / Password Change Card ── */}
      <div>
        <div className="mb-6">
          <h2 className="text-base sm:text-lg font-black" style={{ color: '#F1F5F9' }}>Security &amp; Password</h2>
          <p className="text-xs sm:text-sm" style={{ color: '#94A3B8' }}>Manage and update your account password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: '#94A3B8' }}>
              Current Password
            </label>
            <input
              name="currentPassword"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all"
              style={{
                backgroundColor: '#0A1525',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F1F5F9',
              }}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6366F1'; }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: '#94A3B8' }}>
              New Password
            </label>
            <input
              name="newPassword"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all"
              style={{
                backgroundColor: '#0A1525',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F1F5F9',
              }}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6366F1'; }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: '#94A3B8' }}>
              Confirm New Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all"
              style={{
                backgroundColor: '#0A1525',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F1F5F9',
              }}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6366F1'; }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
              required
            />
          </div>

          {errorPos && (
            <div
              className="p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2"
              style={{
                background: 'rgba(244,63,94,0.12)',
                color: '#FB7185',
                border: '1px solid rgba(244,63,94,0.25)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorPos}
            </div>
          )}

          {success && (
            <div
              className="p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2"
              style={{
                background: 'rgba(16,185,129,0.12)',
                color: '#34D399',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Password updated successfully!
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl text-xs font-black transition-all duration-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(99,102,241,0.30)',
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Connected Accounts Card ── */}
      <div
        className="pt-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-black" style={{ color: '#F1F5F9' }}>Primary Account</h2>
          <p className="text-xs sm:text-sm" style={{ color: '#94A3B8' }}>Verified identity linked to your account.</p>
        </div>

        <div className="max-w-lg">
          <div
            className="flex items-center justify-between p-4 rounded-2xl transition-all"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)',
              backgroundColor: '#0A1525',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(99,102,241,0.12)',
                  color: '#818CF8',
                  border: '1px solid rgba(99,102,241,0.25)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold truncate" style={{ color: '#F1F5F9' }}>{user.email}</p>
                <p className="text-[9px] uppercase tracking-widest font-extrabold" style={{ color: '#94A3B8' }}>Primary Email</p>
              </div>
            </div>
            <div
              className="px-2.5 py-1 rounded-full text-[10px] font-black shrink-0"
              style={{
                background: 'rgba(16,185,129,0.12)',
                color: '#34D399',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            >
              Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
