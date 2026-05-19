'use client';

import { Square, CheckSquare, Clipboard, Calendar } from 'lucide-react';
import { Bill } from '@/types';
import { formatIndianCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface BillCardProps {
  bill: Bill;
  onSelect?: (bill: Bill) => void;
}

export default function BillCard({ bill, onSelect }: BillCardProps) {
  const isPending = bill.status === 'pending';

  const formattedAmount = formatIndianCurrency(bill.amount);
  const createdDateStr = new Date(bill.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const dueDateStr = bill.due_date 
    ? new Date(bill.due_date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      })
    : null;

  return (
    <div
      onClick={() => onSelect?.(bill)}
      className={cn(
        "bg-white border rounded-2xl p-4 flex items-start justify-between shadow-sm active:bg-slate-50 transition-all select-none mx-4 cursor-pointer",
        isPending ? "border-slate-100 border-l-4 border-l-amber-500" : "border-slate-100 border-l-4 border-l-primary-500"
      )}
    >
      <div className="flex-1 space-y-1 pr-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-800 text-sm">
            Bill #{bill.bill_number}
          </span>
          {isPending && dueDateStr && (
            <span className="inline-flex items-center gap-0.5 text-[8px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded-full">
              <Calendar className="h-2 w-2" />
              Due: {dueDateStr}
            </span>
          )}
          {!isPending && (
            <span className="text-[8px] bg-primary-50 text-primary-700 font-bold px-1.5 py-0.5 rounded-full">
              Paid
            </span>
          )}
        </div>

        <div className="text-base font-extrabold text-slate-800 leading-tight">
          {formattedAmount}
        </div>

        {bill.notes && (
          <p className="text-[10px] text-slate-500 font-medium leading-normal flex items-start gap-1">
            <Clipboard className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{bill.notes}</span>
          </p>
        )}

        <div className="text-[8px] text-slate-400 font-semibold tracking-wide">
          {isPending 
            ? `Delivered: ${createdDateStr}`
            : `Paid: ${bill.completed_at ? new Date(bill.completed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : createdDateStr}`
          }
        </div>
      </div>

      {/* Checkbox Trigger on the right */}
      <div 
        className={cn(
          "h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
          isPending ? "text-amber-500 hover:text-primary-600" : "text-primary-600 bg-primary-50/50"
        )}
      >
        {isPending ? (
          <Square className="h-5 w-5" />
        ) : (
          <CheckSquare className="h-5 w-5 fill-primary-50" />
        )}
      </div>
    </div>
  );
}
