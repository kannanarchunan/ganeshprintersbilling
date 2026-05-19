'use client';

import { X, CheckCircle, Edit, Trash } from 'lucide-react';
import { Bill } from '@/types';
import { cn } from '@/lib/utils';

interface BillActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  onComplete: (id: string) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
}

export default function BillActionSheet({
  isOpen,
  onClose,
  bill,
  onComplete,
  onEdit,
  onDelete,
}: BillActionSheetProps) {
  if (!isOpen || !bill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Action Sheet slide-up menu */}
      <div className="bg-white rounded-t-3xl p-5 w-full max-w-md border-t border-slate-100 shadow-2xl relative z-10 animate-slide-up pb-[calc(env(safe-area-inset-bottom,16px)+16px)]">
        {/* Grabber indicator */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Bill Operations</h3>
            <p className="text-[10px] text-slate-400 font-semibold">Bill #{bill.bill_number} • Outstanding</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Action List buttons */}
        <div className="space-y-2">
          {/* 1. Mark Paid/Completed */}
          <button
            onClick={() => {
              onComplete(bill.id);
              onClose();
            }}
            className="w-full bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100 text-emerald-800 flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl active:scale-98 transition-all font-bold text-xs"
          >
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            Mark as Completed (Paid)
          </button>

          {/* 2. Edit Invoice */}
          <button
            onClick={() => {
              onEdit(bill);
              onClose();
            }}
            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-700 flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl active:scale-98 transition-all font-bold text-xs"
          >
            <Edit className="h-5 w-5 text-slate-500" />
            Edit Bill Details
          </button>

          {/* 3. Delete Invoice */}
          <button
            onClick={() => {
              onDelete(bill);
              onClose();
            }}
            className="w-full bg-red-50 hover:bg-red-100 border border-red-100/70 text-red-700 flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl active:scale-98 transition-all font-bold text-xs"
          >
            <Trash className="h-5 w-5 text-red-600" />
            Delete Bill Record
          </button>

          {/* 4. Close Sheet */}
          <button
            onClick={onClose}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center py-3.5 rounded-2xl active:scale-98 transition-all font-bold text-xs mt-2"
          >
            Cancel Action
          </button>
        </div>
      </div>
    </div>
  );
}
