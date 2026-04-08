import React, { useState } from 'react';
import { updateProfileAction, changePasswordAction } from '@/app/actions/profile';
import { ProfileUser } from './ProfileInformation';

interface AccountSettingsProps {
  user: ProfileUser;
}

export function AccountSettings({ user }: AccountSettingsProps) {
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

  return (
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
                Edit
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
  );
}
