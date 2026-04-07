'use client';

import React, { useState } from 'react';
import { getMethodIcon } from '@/utils/icons';
import { addPaymentMethod, deletePaymentMethod, renamePaymentMethod } from '@/app/actions/payment';
import { updateProfileAction, changePasswordAction } from '@/app/actions/profile';

interface ProfileUser {
  full_name?: string;
  username?: string;
  email?: string;
}

interface PaymentMethodType {
  _id?: string;
  id?: string;
  name: string;
  balance: number;
}

interface ProfileClientProps {
  user: ProfileUser;
  paymentMethods: PaymentMethodType[];
}

export function ProfileClient({ user, paymentMethods }: ProfileClientProps) {
  // State for Profile Editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // State for Password Change
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // State for Payment Methods
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [newMethodName, setNewMethodName] = useState('');
  const [isSavingMethod, setIsSavingMethod] = useState(false);
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [editMethodName, setEditMethodName] = useState('');

  // Layout State
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'payment'>('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalLiquidity = paymentMethods.reduce((acc, pm) => acc + (Number(pm.balance) || 0), 0);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const result = await updateProfileAction({
      full_name: fullName,
      username: username,
      email: email
    });
    if (result.success) {
      setIsEditingProfile(false);
    } else {
      alert(result.error);
    }
    setIsSavingProfile(false);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setIsSavingPassword(true);
    const result = await changePasswordAction({ currentPassword, newPassword, confirmPassword });
    if (result.success) {
      alert("Password updated successfully");
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      alert(result.error);
    }
    setIsSavingPassword(false);
  };

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethodName.trim()) return;
    setIsSavingMethod(true);
    await addPaymentMethod(newMethodName.trim());
    setNewMethodName('');
    setIsAddingMethod(false);
    setIsSavingMethod(false);
  };

  const handleRenameMethod = async (id: string) => {
    if (!editMethodName.trim()) return;
    await renamePaymentMethod(id, editMethodName.trim());
    setEditingMethodId(null);
  };

  const handleDeleteMethod = async (id: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      setDeletingMethodId(id);
      await deletePaymentMethod(id);
      setDeletingMethodId(null);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-50/30">
      
      {/* Mobile Header / Dropdown Toggle */}
      <div className="md:hidden bg-white border-b border-fintech-border p-4 flex items-center justify-between z-20 sticky top-0 shadow-sm">
        <h2 className="font-poppins font-black text-fintech-text-main text-lg">
          {activeTab === 'profile' && 'Profile Information'}
          {activeTab === 'account' && 'Account Settings'}
          {activeTab === 'payment' && 'Payment Methods'}
        </h2>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        ${isMobileMenuOpen ? 'block animate-in slide-in-from-top-4' : 'hidden'} 
        md:block w-full md:w-72 lg:w-80 bg-white border-b md:border-b-0 md:border-r border-fintech-border 
        md:h-screen sticky top-0 shrink-0 z-10 overflow-y-auto
      `}>
        <div className="p-6 md:p-8">
          <h1 className="text-2xl font-black text-fintech-text-main font-poppins mb-8 hidden md:block tracking-tight">
            Settings
          </h1>
          <nav className="space-y-3">
            {[
              { id: 'profile', label: 'Profile Information', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { id: 'account', label: 'Account Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
              { id: 'payment', label: 'Payment Methods', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 text-left group ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'}`}
              >
                <div className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${activeTab === item.id ? 'bg-indigo-200/50 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    {item.id === 'account' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
                  </svg>
                </div>
                <span className="font-bold text-[15px]">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
        <div className="max-w-4xl mx-auto pb-12">
          
          {activeTab === 'profile' && (
            <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-[20px] duration-500 fade-in">
              {/* Profile Header Card */}
              <div className="bg-white rounded-[2rem] shadow-premium border border-fintech-border overflow-hidden">
        {/* Banner Gradient */}
        <div className="h-24 md:h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700"></div>

        <div className="px-6 md:px-10 pb-8 -mt-10 md:-mt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-end gap-4 md:gap-8">
              {/* Avatar Placeholder */}
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-3xl bg-white p-1 shadow-2xl border border-fintech-border overflow-hidden shrink-0">
                <div className="w-full h-full rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden">
                  <span className="text-3xl md:text-5xl font-black text-slate-200">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>

              <div className="pb-1 md:pb-4">
                <h2 className="text-2xl md:text-4xl font-black text-fintech-text-main tracking-tight font-poppins">
                  {user?.full_name || 'Coinly User'}
                </h2>
                <p className="text-fintech-text-muted font-medium text-sm md:text-lg">{user?.email}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 border-t border-fintech-border bg-slate-50/30">
          <div className="p-4 md:p-8 text-center border-r border-fintech-border">
            <span className="block text-xl md:text-3xl font-black text-indigo-600 tabular-nums font-poppins">{paymentMethods.length}</span>
            <span className="text-[8px] md:text-xs uppercase font-bold text-fintech-text-muted tracking-widest mt-1">Payment Methods</span>
          </div>
          <div className="p-4 md:p-8 text-center border-r border-fintech-border">
            <span className="block text-xl md:text-3xl font-black text-fintech-text-main tabular-nums font-poppins">৳ {totalLiquidity.toLocaleString()}</span>
            <span className="text-[8px] md:text-xs uppercase font-bold text-fintech-text-muted tracking-widest mt-1">Total Liquidity</span>
          </div>
          <div className="p-4 md:p-8 text-center">
            <span className="block text-xl md:text-3xl font-black text-fintech-text-main italic font-poppins lowercase">{user?.username}</span>
            <span className="text-[8px] md:text-xs uppercase font-bold text-fintech-text-muted tracking-widest mt-1">System Username</span>
          </div>
        </div>
      </div>
      </div>
      )}

      {activeTab === 'account' && (
        <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-[20px] duration-500 fade-in">
          {/* Account Settings Section */}
          <div className="bg-white rounded-[2rem] shadow-premium border border-fintech-border p-6 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h3 className="text-xl md:text-2xl font-black text-fintech-text-main font-poppins mb-0">Account Settings</h3>
          <div className="flex gap-3">
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="btn-primary !px-5 !py-2.5 flex items-center gap-2 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Settings
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="btn-outline !px-4 !py-2.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileSave}
                  disabled={isSavingProfile}
                  className="btn-primary !px-5 !py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-wait"
                >
                  {isSavingProfile && (
                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-fintech-text-muted uppercase tracking-widest ml-1">Username</label>
            <input
              type="text"
              className={`w-full px-5 py-3.5 border rounded-2xl transition-all outline-none font-medium ${isEditingProfile ? 'bg-white border-blue-200 focus:ring-4 focus:ring-blue-100' : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!isEditingProfile}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-fintech-text-muted uppercase tracking-widest ml-1">Email Address</label>
            <input
              type="email"
              className={`w-full px-5 py-3.5 border rounded-2xl transition-all outline-none font-medium ${isEditingProfile ? 'bg-white border-blue-200 focus:ring-4 focus:ring-blue-100' : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditingProfile}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-fintech-text-muted uppercase tracking-widest ml-1">Display Name</label>
            <input
              type="text"
              className={`w-full px-5 py-3.5 border rounded-2xl transition-all outline-none font-medium ${isEditingProfile ? 'bg-white border-blue-200 focus:ring-4 focus:ring-blue-100' : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'}`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!isEditingProfile}
            />
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-[2rem] shadow-premium border border-fintech-border p-6 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h3 className="text-xl md:text-2xl font-black text-fintech-text-main font-poppins mb-0">Change Password</h3>
          <div className="flex gap-3">
            {!isEditingPassword ? (
              <button
                onClick={() => setIsEditingPassword(true)}
                className="btn-primary !px-5 !py-2.5 flex items-center gap-2 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Change Password
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="btn-outline !px-4 !py-2.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSave}
                  disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="btn-primary !px-5 !py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-wait"
                >
                  {isSavingPassword && (
                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isSavingPassword ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditingPassword && (
          <form onSubmit={handlePasswordSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 animate-in slide-in-from-top-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-fintech-text-muted uppercase tracking-widest ml-1">Current Password</label>
              <input
                type="password"
                required
                className="w-full px-5 py-3.5 border rounded-2xl transition-all outline-none font-medium bg-white border-blue-200 focus:ring-4 focus:ring-blue-100"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-fintech-text-muted uppercase tracking-widest ml-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-5 py-3.5 border rounded-2xl transition-all outline-none font-medium bg-white border-blue-200 focus:ring-4 focus:ring-blue-100"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-fintech-text-muted uppercase tracking-widest ml-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-5 py-3.5 border rounded-2xl transition-all outline-none font-medium bg-white border-blue-200 focus:ring-4 focus:ring-blue-100"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="hidden" />
          </form>
        )}
      </div>

      </div>
      )}

      {activeTab === 'payment' && (
        <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-[20px] duration-500 fade-in">
          {/* Payment Methods Section */}
          <div className="bg-white rounded-[2rem] shadow-premium border border-fintech-border p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-fintech-text-main font-poppins">Payment Methods</h3>
            <p className="text-sm text-fintech-text-muted font-medium mt-1">Configure where your money comes from and goes to.</p>
          </div>
          <button
            onClick={() => {
              setIsAddingMethod(!isAddingMethod);
              setNewMethodName('');
            }}
            className={`${isAddingMethod ? 'btn-outline' : 'btn-primary'} !px-4 !py-2 !rounded-xl !text-xs !font-bold flex items-center gap-2`}
          >
            {isAddingMethod ? (
              <>Cancel</>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Method
              </>
            )}
          </button>
        </div>

        {/* Add Method Inline Form */}
        {isAddingMethod && (
          <form
            onSubmit={handleAddMethod}
            className="mb-8 p-6 bg-slate-50 rounded-2xl border border-blue-100 animate-in zoom-in-95 duration-300"
          >
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Label Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bank, Mobile Wallet..."
                  className="w-full px-5 py-3 border border-blue-100 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none font-medium"
                  value={newMethodName}
                  onChange={(e) => setNewMethodName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <button type="submit" disabled={isSavingMethod} className="btn-primary flex items-center justify-center !py-3 w-full md:w-auto px-10 disabled:opacity-80 disabled:cursor-wait">
                {isSavingMethod ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Method'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {paymentMethods.map(pm => (
            <div
              key={pm._id || pm.id}
              className="group relative p-5 md:p-6 bg-white border border-fintech-border rounded-2xl md:rounded-3xl flex items-center gap-5 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                {getMethodIcon(pm.name)}
              </div>
              <div className="flex-1 min-w-0">
                {editingMethodId === (pm._id || pm.id) ? (
                  <div className="flex gap-2">
                    <input
                      className="w-full text-sm font-bold border-b border-blue-300 outline-none"
                      value={editMethodName}
                      onChange={e => setEditMethodName(e.target.value)}
                      autoFocus
                    />
                    <button onClick={() => handleRenameMethod((pm._id || pm.id) as string)} className="text-green-600 font-bold text-xs">OK</button>
                  </div>
                ) : (
                  <h4 className="font-black text-fintech-text-main text-base md:text-lg truncate font-poppins">{pm.name}</h4>
                )}
                <p className="text-xs md:text-sm font-black text-indigo-600">৳ {pm.balance.toLocaleString()}</p>
              </div>

              {/* Action Icons Override */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                <button
                  onClick={() => {
                    setEditingMethodId((pm._id || pm.id) as string);
                    setEditMethodName(pm.name);
                  }}
                  className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteMethod((pm._id || pm.id) as string)}
                  disabled={deletingMethodId === (pm._id || pm.id)}
                  className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg flex items-center justify-center disabled:opacity-80 disabled:cursor-wait"
                >
                  {deletingMethodId === (pm._id || pm.id) ? (
                    <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
      )}

        </div>
      </div>
    </div>
  );
}
