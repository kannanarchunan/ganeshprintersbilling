'use client';

import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import Button from '../ui/Button';

interface AddBillSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (billData: {
    bill_number: string;
    amount: number;
    notes?: string;
    due_date?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function AddBillSheet({
  isOpen,
  onClose,
  onAdd,
  isLoading = false,
}: AddBillSheetProps) {
  const [billNum, setBillNum] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedNum = billNum.trim();
    const parsedAmount = parseFloat(amount);

    if (!trimmedNum) {
      setError('Bill number is required.');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please specify a valid amount greater than 0.');
      return;
    }

    try {
      await onAdd({
        bill_number: trimmedNum,
        amount: parsedAmount,
        notes: notes.trim() || undefined,
        due_date: dueDate || undefined,
      });

      // Clear input fields
      setBillNum('');
      setAmount('');
      setNotes('');
      setDueDate('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit bill. Number may be duplicate.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Slide-Up Container */}
      <div className="bg-white rounded-t-3xl p-5 w-full max-w-md border-t border-slate-100 shadow-2xl relative z-10 animate-slide-up pb-[calc(env(safe-area-inset-bottom,16px)+16px)]">
        {/* Grabber */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 border border-primary-100/50">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Add New Bill</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Log a pending delivery invoice</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <p className="text-[10px] text-red-600 bg-red-50 border border-red-100/50 rounded-xl p-2 font-semibold">
              ⚠️ {error}
            </p>
          )}

          <div className="space-y-1">
            <label htmlFor="bill-num" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Bill / Invoice Number
            </label>
            <input
              id="bill-num"
              type="text"
              placeholder="e.g. 50412"
              value={billNum}
              onChange={(e) => setBillNum(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 focus:border-primary-400 focus:bg-white rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none transition-all"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="bill-amount" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Invoice Amount (₹)
            </label>
            <input
              id="bill-amount"
              type="number"
              inputMode="decimal"
              placeholder="e.g. 15450"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 focus:border-primary-400 focus:bg-white rounded-2xl px-4 py-2.5 text-xs font-bold focus:outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="bill-due" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Due Date (Optional)
            </label>
            <input
              id="bill-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 focus:border-primary-400 focus:bg-white rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="bill-notes" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Delivery Notes (Optional)
            </label>
            <input
              id="bill-notes"
              type="text"
              placeholder="e.g. 5 boxes wall poster, Cash on Delivery"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 focus:border-primary-400 focus:bg-white rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none transition-all"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-xl text-xs h-10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 rounded-xl text-xs h-10"
            >
              {isLoading ? 'Saving...' : 'Add Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
