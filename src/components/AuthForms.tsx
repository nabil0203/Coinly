'use client';

import React, { useState } from 'react';
import { loginAction, registerAction } from '@/app/actions/auth';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const result = await loginAction(formData);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-10 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-fintech-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-fintech-primary" viewBox="0 0 20 20" fill="currentColor">
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
              type="text" 
              placeholder="Enter your username"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-fintech-primary/10 focus:border-fintech-primary outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            </div>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-fintech-primary/10 focus:border-fintech-primary outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full btn-primary !py-4 !rounded-2xl shadow-xl shadow-fintech-primary/20 hover:shadow-2xl hover:shadow-fintech-primary/30 active:scale-[0.98] mt-4 disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <p className="mt-10 text-slate-500 font-medium">
          New here? <a href="/register" className="text-fintech-primary font-black hover:underline underline-offset-4">Create account</a>
        </p>
      </div>
    </div>
  );
}

export function Register() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('email', email);
    formData.append('fullName', fullName);
    const result = await registerAction(formData);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => window.location.href = '/login', 1500);
    } else {
      setError(result.error || 'Registration failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-10 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-fintech-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-fintech-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 104.1 0h-4.1z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Join Coinly</h1>
        <p className="text-slate-400 font-medium mb-10">Start tracking your wealth today</p>
        
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold animate-in shake-in duration-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 text-green-600 border border-green-100 text-sm font-bold animate-in fade-in duration-300">
            Account created! Redirecting to login...
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe"
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-fintech-primary/10 focus:border-fintech-primary outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300" 
              value={fullName} 
              onChange={e => setFullName(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
            <input 
              type="email" 
              placeholder="john@example.com"
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-fintech-primary/10 focus:border-fintech-primary outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
            <input 
              type="text" 
              placeholder="johndoe123"
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-fintech-primary/10 focus:border-fintech-primary outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-fintech-primary/10 focus:border-fintech-primary outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full btn-primary !py-4 !rounded-2xl shadow-xl shadow-fintech-primary/20 hover:shadow-2xl hover:shadow-fintech-primary/30 active:scale-[0.98] mt-4 disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <p className="mt-10 text-slate-500 font-medium">
          Already a member? <a href="/login" className="text-fintech-primary font-black hover:underline underline-offset-4">Sign in</a>
        </p>
      </div>
    </div>
  );
}
