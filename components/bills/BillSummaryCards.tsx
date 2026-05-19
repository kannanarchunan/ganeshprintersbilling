import { Clock, CheckCircle2, FileText } from 'lucide-react';
import { formatIndianCurrency } from '@/lib/utils';

interface BillSummaryCardsProps {
  totalPending: number;
  totalCompleted: number;
  billCount: number;
}

export default function BillSummaryCards({
  totalPending,
  totalCompleted,
  billCount,
}: BillSummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5 mx-4 my-2 select-none">
      {/* 1. Pending Amount (Amber/Yellow Badge) */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-amber-600">
          <Clock className="h-4 w-4 shrink-0" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Pending</span>
        </div>
        <div className="mt-2">
          <div className="text-[10px] md:text-xs font-black text-amber-800 leading-none">
            {formatIndianCurrency(totalPending)}
          </div>
          <p className="text-[8px] text-amber-600/80 font-bold mt-1">To Collect</p>
        </div>
      </div>

      {/* 2. Completed Amount (Green Badge) */}
      <div className="bg-primary-50 border border-primary-100 rounded-2xl p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-primary-600">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Collected</span>
        </div>
        <div className="mt-2">
          <div className="text-[10px] md:text-xs font-black text-primary-800 leading-none">
            {formatIndianCurrency(totalCompleted)}
          </div>
          <p className="text-[8px] text-primary-600/80 font-bold mt-1">Paid off</p>
        </div>
      </div>

      {/* 3. Invoices Count (Gray/Blue Badge) */}
      <div className="bg-slate-50 border border-slate-250 rounded-2xl p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-500">
          <FileText className="h-4 w-4 shrink-0" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Invoices</span>
        </div>
        <div className="mt-2">
          <div className="text-[11px] md:text-sm font-black text-slate-800 leading-none">
            {billCount}
          </div>
          <p className="text-[8px] text-slate-500/80 font-bold mt-1">Total Bills</p>
        </div>
      </div>
    </div>
  );
}
