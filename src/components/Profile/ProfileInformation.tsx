'use client';

import React, { useState } from 'react';

interface ProfileInfoProps {
  user: {
    _id: string;
    username: string;
    email: string;
    full_name?: string;
  };
  updateProfileAction: (data: { username?: string; email?: string; full_name?: string; }) => Promise<{ success?: boolean; error?: string }>;
}

export function ProfileInformation({ user, updateProfileAction }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorPos, setErrorPos] = useState('');

  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [fullName, setFullName] = useState(user.full_name || '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorPos('');

    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      full_name: formData.get('full_name') as string,
    };

    const res = await updateProfileAction(data);

    if (res?.error) {
      setErrorPos(res.error);
    } else {
      setSuccess(true);
      setIsEditing(false);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6 sm:space-y-8" style={{ animation: 'slide-in-up 0.4s ease-out both' }}>
      {/* ── Profile Header Banner ── */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          backgroundColor: '#0F1929',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Banner Cover */}
        <div
          className="h-24 sm:h-28 relative"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(139,92,246,0.2) 50%, rgba(8,14,26,0.8) 100%)',
          }}
        >
          {/* Avatar */}
          <div className="absolute -bottom-9 sm:-bottom-11 left-6 sm:left-8">
            <div
              className="w-18 h-18 sm:w-22 sm:h-22 p-1.5 rounded-2xl shadow-2xl flex items-center justify-center"
              style={{
                backgroundColor: '#080E1A',
                border: '1px solid rgba(99,102,241,0.4)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 20px rgba(99,102,241,0.2)',
              }}
            >
              <div
                className="w-full h-full rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-black select-none"
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  color: '#FFFFFF',
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* User Identity Info */}
        <div className="pt-12 sm:pt-14 pb-5 px-6 sm:px-8">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: '#F1F5F9' }}>
            {user.full_name || user.username}
          </h1>
          <p className="text-xs sm:text-sm font-semibold flex items-center gap-2 mt-1" style={{ color: '#94A3B8' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {user.email}
          </p>
        </div>

        {/* Status Strip */}
        <div
          className="grid grid-cols-2 divide-x"
          style={{
            borderColor: 'rgba(255,255,255,0.06)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.015)',
          }}
        >
          <div className="px-6 py-3.5">
            <p className="text-[9px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#94A3B8' }}>Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" style={{ boxShadow: '0 0 8px #10B981' }} />
              <p className="font-bold text-xs sm:text-sm" style={{ color: '#F1F5F9' }}>Active Member</p>
            </div>
          </div>
          <div className="px-6 py-3.5">
            <p className="text-[9px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#94A3B8' }}>Account Type</p>
            <p className="font-bold text-xs sm:text-sm" style={{ color: '#818CF8' }}>Personal</p>
          </div>
        </div>
      </div>

      {/* ── Success Banner ── */}
      {success && (
        <div
          className="p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5"
          style={{
            background: 'rgba(16,185,129,0.12)',
            color: '#34D399',
            border: '1px solid rgba(16,185,129,0.25)',
            animation: 'slide-in-up 0.3s ease-out both',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Profile updated successfully!
        </div>
      )}

      {/* ── View / Edit Personal Information ── */}
      <div>
        {!isEditing ? (
          <div className="space-y-6" style={{ animation: 'slide-in-up 0.3s ease-out both' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black" style={{ color: '#F1F5F9' }}>Personal Information</h2>
                <p className="text-xs sm:text-sm" style={{ color: '#94A3B8' }}>Review your account profile details.</p>
              </div>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setSuccess(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer"
                style={{
                  background: 'rgba(99,102,241,0.12)',
                  color: '#818CF8',
                  border: '1px solid rgba(99,102,241,0.25)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.20)';
                  (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.12)';
                  (e.currentTarget as HTMLElement).style.color = '#818CF8';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            </div>

            <div className="space-y-4 max-w-lg">
              {[
                { label: 'Full Name', value: user.full_name || 'Not provided' },
                { label: 'Email Address', value: user.email },
                { label: 'Username', value: user.username },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: '#94A3B8' }}>
                    {label}
                  </label>
                  <div
                    className="px-4 py-3 rounded-xl font-semibold text-sm transition-all"
                    style={{
                      backgroundColor: '#0A1525',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#F1F5F9',
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6" style={{ animation: 'slide-in-up 0.3s ease-out both' }}>
            <div>
              <h2 className="text-base sm:text-lg font-black" style={{ color: '#F1F5F9' }}>Update Profile</h2>
              <p className="text-xs sm:text-sm" style={{ color: '#94A3B8' }}>Modify your profile information below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: '#94A3B8' }}>
                  Full Name
                </label>
                <input
                  name="full_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  Username
                </label>
                <input
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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

              <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
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
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setIsEditing(false);
                    setErrorPos('');
                    setUsername(user.username);
                    setEmail(user.email);
                    setFullName(user.full_name || '');
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
                  style={{
                    color: '#94A3B8',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F1F5F9'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8'; }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
