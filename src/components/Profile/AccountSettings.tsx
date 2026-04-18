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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 sm:space-y-10">
      
      <div className="bg-[#1E293B] md:bg-transparent border border-[#334155] md:border-transparent rounded-3xl p-6 sm:p-0">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">Security Preferences</h2>
          <p className="text-sm text-[#94A3B8]">Manage your password and security settings.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
          <div className="space-y-2" style={{ animation: 'slide-in-up 0.35s ease-out both', animationDelay: '0ms' }}>
            <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider ml-1">Current Password</label>
            <input
              name="currentPassword"
              type="password"
              placeholder="••••••••"
              className="input-dark px-4 py-3 sm:px-5 sm:py-4 bg-[#0F172A]"
              required
            />
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2" style={{ animation: 'slide-in-up 0.35s ease-out both', animationDelay: '70ms' }}>
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider ml-1">New Password</label>
                <input
                name="newPassword"
                type="password"
                placeholder="••••••••"
                className="input-dark px-4 py-3 sm:px-5 sm:py-4 bg-[#0F172A]"
                required
                />
            </div>
            <div className="space-y-2" style={{ animation: 'slide-in-up 0.35s ease-out both', animationDelay: '140ms' }}>
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider ml-1">Confirm New Password</label>
                <input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="input-dark px-4 py-3 sm:px-5 sm:py-4 bg-[#0F172A]"
                required
                />
            </div>
          </div>

          {errorPos && (
             <div className="p-4 rounded-xl bg-[#F43F5E]/10 text-[#F43F5E] border border-[#F43F5E]/20 text-sm font-bold flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
               </svg>
               {errorPos}
             </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 text-sm font-bold flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
               </svg>
               Password updated successfully!
            </div>
          )}

          <div className="pt-2" style={{ animation: 'slide-in-up 0.35s ease-out both', animationDelay: '210ms' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:w-auto min-w-[170px] !py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

      <div className="bg-[#1E293B] md:bg-transparent border border-[#334155] md:border-transparent rounded-3xl p-6 sm:p-0 pt-0 sm:pt-6 border-t md:border-[#334155]">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">Connected Accounts</h2>
          <p className="text-sm text-[#94A3B8]">Manage your linked email and identity providers.</p>
        </div>

        <div className="max-w-md space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#263347] border border-[#334155] rounded-2xl transition-all duration-200 hover:border-[#6366F1]/30 hover:shadow-[0_4px_16px_rgba(99,102,241,0.1)] ring-1 ring-transparent hover:ring-[#6366F1]/15 interactive-card">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-[#F8FAFC] truncate">{user.email}</p>
                        <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold">Primary Email</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-bold shrink-0">
                    Verified
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
