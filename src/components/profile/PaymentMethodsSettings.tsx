import React, { useState } from 'react';
import { getMethodIcon } from '@/utils/icons';
import { addPaymentMethod, deletePaymentMethod, renamePaymentMethod } from '@/app/actions/payment';
import { PaymentMethodType } from './ProfileInformation';

interface PaymentMethodsSettingsProps {
  paymentMethods: PaymentMethodType[];
}

export function PaymentMethodsSettings({ paymentMethods }: PaymentMethodsSettingsProps) {
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [newMethodName, setNewMethodName] = useState('');
  const [isSavingMethod, setIsSavingMethod] = useState(false);
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [editMethodName, setEditMethodName] = useState('');

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
                    <button type="button" onClick={() => handleRenameMethod((pm._id || pm.id) as string)} className="text-green-600 font-bold text-xs">OK</button>
                  </div>
                ) : (
                  <h4 className="font-black text-fintech-text-main text-base md:text-lg truncate font-poppins">{pm.name}</h4>
                )}
                <p className="text-xs md:text-sm font-black text-indigo-600">৳ {pm.balance.toLocaleString()}</p>
              </div>

              {/* Action Icons Override */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                <button
                  type="button"
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
                  type="button"
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
  );
}
