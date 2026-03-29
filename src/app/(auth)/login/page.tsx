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
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-10 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Welcome Back</h1>
        <p className="text-slate-400 font-medium mb-10">Sign in to manage your finances</p>
        
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold animate-in shake-in duration-300">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
            <input 
              name="username"
              type="text" 
              placeholder="Enter your username"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300" 
              required 
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            </div>
            <input 
              name="password"
              type="password" 
              placeholder="••••••••"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300" 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/30 active:scale-[0.98] mt-4 disabled:opacity-50 transition-all"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <p className="mt-10 text-slate-500 font-medium">
          New here? <Link href="/register" className="text-blue-600 font-black hover:underline underline-offset-4">Create account</Link>
        </p>
      </div>
    </div>
  );
}
