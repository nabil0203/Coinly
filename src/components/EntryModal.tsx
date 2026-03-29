'use client';

import React, { useState, useEffect } from 'react';

interface Entry {
  description: string;
  amount: string;
  payment_method: string;
}

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: 'expense' | 'cashin', payload: any, id?: string) => void;
  onDelete?: (type: 'expense' | 'cashin', id: string) => void;
  type: 'expense' | 'cashin';
  dateStr: string;
  paymentMethods: any[];
  editEntry?: any;
}

export function EntryModal({ isOpen, onClose, onSubmit, onDelete, type, dateStr, paymentMethods, editEntry = null }: EntryModalProps) {
  const [entries, setEntries] = useState<Entry[]>([{ description: '', amount: '', payment_method: '' }]);
  const [selectedDate, setSelectedDate] = useState(dateStr);

  const isEditing = !!editEntry;
  const defaultMethod = paymentMethods.length > 0 ? paymentMethods[0].name : 'Cash';

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setEntries([{
          description: editEntry.description || '',
          amount: String(editEntry.amount || ''),
          payment_method: editEntry.payment_method || defaultMethod
        }]);
        setSelectedDate(editEntry.date || dateStr);
      } else {
        setEntries([{ description: '', amount: '', payment_method: defaultMethod }]);
        setSelectedDate(dateStr);
      }
    }
  }, [isOpen, isEditing, editEntry, paymentMethods, dateStr, defaultMethod]);

  if (!isOpen) return null;

  const handleAddMore = () => {
    setEntries([...entries, { description: '', amount: '', payment_method: defaultMethod }]);
  };

  const handleRemoveEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const handleEntryChange = (index: number, field: keyof Entry, value: string) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'expense') {
      const methodTotals: Record<string, number> = {};
      entries.forEach(entry => {
        const amt = parseInt(entry.amount, 10) || 0;
        methodTotals[entry.payment_method] = (methodTotals[entry.payment_method] || 0) + amt;
      });

      for (const methodName in methodTotals) {
        const method = paymentMethods.find(pm => pm.name === methodName);
        let availableBalance = method ? (Number(method.balance) || 0) : 0;
        
        if (isEditing && editEntry.payment_method === methodName) {
          availableBalance += Number(editEntry.amount);
        }

        if (methodTotals[methodName] > availableBalance) {
          alert(`Insufficient balance in ${methodName}.\nAvailable: ৳ ${availableBalance}\nRequested: ৳ ${methodTotals[methodName]}`);
          return;
        }
      }
    }

    if (isEditing) {
      const entry = entries[0];
      onSubmit(type, {
        date: selectedDate,
        description: entry.description,
        amount: parseInt(entry.amount, 10),
        payment_method: entry.payment_method
      }, editEntry._id);
    } else {
      const payloads = entries.map(entry => ({
        date: selectedDate,
        description: entry.description,
        amount: parseInt(entry.amount, 10),
        payment_method: entry.payment_method
      }));
      onSubmit(type, payloads);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Delete this entry?')) {
      onDelete(type, editEntry._id);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className={`bg-white rounded-3xl shadow-2xl ${isEditing ? 'max-w-md' : 'max-w-2xl'} w-full max-h-[90vh] flex flex-col transform transition-all border border-white/20 animate-in zoom-in-95 duration-200`}>
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${type === 'expense' ? 'bg-red-500' : 'bg-green-500'}`}></div>
              {isEditing ? 'Edit' : 'Add'} {type === 'expense' ? 'Expense' : 'Income'}
            </h3>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative group">
              <input 
                type="date" 
                className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button type="button" className="p-3 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100 shadow-sm flex items-center justify-center relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide">
            {entries.map((entry, index) => (
              <div key={index} className={`relative p-5 rounded-2xl bg-slate-50/50 border border-slate-100 group transition-all hover:bg-white hover:shadow-md ${index > 0 ? 'mt-4' : ''}`}>
                {!isEditing && entries.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveEntry(index)}
                    className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 rounded-full p-1 shadow-md border border-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className={isEditing ? "md:col-span-12" : "md:col-span-12 lg:col-span-6"}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-700 placeholder:text-slate-300 font-medium"
                      value={entry.description} 
                      onChange={e => handleEntryChange(index, 'description', e.target.value)} 
                      required 
                      placeholder="What was this for?"
                    />
                  </div>
                  <div className={isEditing ? "md:col-span-6" : "md:col-span-6 lg:col-span-3"}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
                      <input 
                        type="number" 
                        step="1"
                        className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-700 font-bold tabular-nums"
                        value={entry.amount} 
                        onChange={e => handleEntryChange(index, 'amount', e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                  <div className={isEditing ? "md:col-span-6" : "md:col-span-6 lg:col-span-3"}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 whitespace-nowrap overflow-hidden text-ellipsis">Payment Method</label>
                    <select 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-slate-700 font-medium"
                      value={entry.payment_method} 
                      onChange={e => handleEntryChange(index, 'payment_method', e.target.value)}
                    >
                      {paymentMethods.length > 0 ? paymentMethods.map(pm => (
                        <option key={pm._id || pm.id} value={pm.name}>{pm.name}</option>
                      )) : (
                        <>
                          <option value="Cash">Cash</option>
                          <option value="Bank">Bank</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            
            {!isEditing && (
              <button 
                type="button" 
                onClick={handleAddMore}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-blue-600 hover:text-blue-600 hover:bg-slate-50 transition-all font-bold flex items-center justify-center gap-2 group"
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                Add Multiple Entries
              </button>
            )}
          </div>
          
          {/* Modal Footer */}
          <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
            {isEditing ? (
              <button 
                type="button" 
                onClick={handleDelete}
                className="bg-[#EF233C] text-white font-bold py-2.5 px-5 rounded-xl text-sm flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            ) : <div />}
            
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="text-slate-500 font-bold py-2 px-4 rounded-lg hover:bg-slate-200/50 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`text-white font-bold py-2.5 px-8 rounded-2xl shadow-xl transition-all active:scale-[0.98] ${type === 'expense' ? 'bg-[#EF233C] shadow-red-600/30 hover:bg-red-600' : 'bg-[#00B44A] shadow-green-600/30 hover:bg-green-600'}`}
              >
                {isEditing ? 'Save Changes' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
