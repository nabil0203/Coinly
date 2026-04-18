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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header Card */}
      <div className="bg-[#1E293B] md:bg-transparent border border-[#334155] md:border-transparent rounded-3xl overflow-hidden mb-8 sm:mb-10">
        <div className="h-24 sm:h-32 bg-gradient-to-r from-[#6366F1] to-[#0F172A] relative">
          <div className="absolute -bottom-10 sm:-bottom-12 left-6 sm:left-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#0F172A] p-1.5 sm:p-2 rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105 cursor-default">
              <div className="w-full h-full bg-[#1E293B] rounded-xl flex items-center justify-center text-3xl sm:text-4xl font-black text-[#F8FAFC] border border-[#334155] select-none">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
        <div className="pt-14 sm:pt-16 pb-6 px-6 sm:px-8 bg-[#1E293B]">
          <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">{user.full_name || user.username}</h1>
          <p className="text-sm font-medium text-[#94A3B8] flex items-center gap-2 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {user.email}
          </p>
        </div>
        
        <div className="grid grid-cols-2 divide-x divide-[#334155] border-y border-[#334155] bg-[#263347]">
            <div className="px-6 py-4">
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    <p className="font-bold text-[#F8FAFC] text-sm">Active Member</p>
                </div>
            </div>
            <div className="px-6 py-4">
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Account Type</p>
                <p className="font-bold text-[#F8FAFC] text-sm">Personal</p>
            </div>
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <div
          className="p-4 mb-6 rounded-xl bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 text-sm font-bold flex items-center gap-2"
          style={{ animation: 'slide-in-top 0.3s ease-out both' }}
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
           </svg>
           Profile updated successfully!
        </div>
      )}

      {/* View / Edit panel — key forces remount → fresh animation on each mode switch */}
      <div className="bg-[#1E293B] md:bg-transparent border border-[#334155] md:border-transparent rounded-3xl p-6 sm:p-0">
        <div
          key={isEditing ? 'edit' : 'view'}
          style={{ animation: 'slide-in-up 0.3s ease-out both' }}
        >
          {!isEditing ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">Personal Information</h2>
                  <p className="text-sm text-[#94A3B8]">Review your personal details.</p>
                </div>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setSuccess(false);
                  }}
                  className="btn-secondary !py-2 px-4 flex items-center gap-2 group active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Profile
                </button>
              </div>

              <div className="space-y-5">
                {[
                  { label: 'Full Name', value: user.full_name || 'Not provided', delay: '0ms' },
                  { label: 'Email Address', value: user.email, delay: '60ms' },
                  { label: 'Username', value: user.username, delay: '120ms' },
                ].map(({ label, value, delay }) => (
                  <div
                    key={label}
                    className="space-y-2 max-w-md"
                    style={{ animation: 'slide-in-up 0.35s ease-out both', animationDelay: delay }}
                  >
                    <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider ml-1">{label}</label>
                    <div className="px-4 py-3 sm:px-5 sm:py-4 bg-[#0F172A] border border-[#334155] rounded-xl text-[#F8FAFC] font-medium min-h-[50px] flex items-center transition-colors duration-200 hover:border-[#475569]">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">Update Profile</h2>
                <p className="text-sm text-[#94A3B8]">Change your personal information.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2 max-w-md" style={{ animation: 'slide-in-up 0.35s ease-out both', animationDelay: '0ms' }}>
                  <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider ml-1">Full Name</label>
                  <input
                    name="full_name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-dark px-4 py-3 sm:px-5 sm:py-4 bg-[#0F172A]"
                    required
                  />
                </div>

                <div className="space-y-2 max-w-md" style={{ animation: 'slide-in-up 0.35s ease-out both', animationDelay: '60ms' }}>
                  <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider ml-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-dark px-4 py-3 sm:px-5 sm:py-4 bg-[#0F172A]"
                    required
                  />
                </div>

                <div className="space-y-2 max-w-md" style={{ animation: 'slide-in-up 0.35s ease-out both', animationDelay: '120ms' }}>
                  <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider ml-1">Username</label>
                  <input
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-dark px-4 py-3 sm:px-5 sm:py-4 bg-[#0F172A]"
                    required
                  />
                </div>

                {errorPos && (
                   <div
                     className="p-4 rounded-xl bg-[#F43F5E]/10 text-[#F43F5E] border border-[#F43F5E]/20 text-sm font-bold max-w-md flex items-center gap-2"
                     style={{ animation: 'slide-in-top 0.3s ease-out both' }}
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                     </svg>
                     {errorPos}
                   </div>
                )}

                <div className="pt-4 max-w-md flex flex-col sm:flex-row gap-3" style={{ animation: 'slide-in-up 0.35s ease-out both', animationDelay: '180ms' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full sm:w-auto min-w-[140px] !py-3 sm:!py-3 flex items-center justify-center gap-2 group active:scale-95"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                    className="btn-secondary w-full sm:w-auto min-w-[120px] !py-3 sm:!py-3 flex items-center justify-center active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
