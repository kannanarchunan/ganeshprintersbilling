import React from 'react';
import { HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<any>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon = HelpCircle,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 bg-white rounded-2xl border border-slate-100 shadow-sm mx-4 my-2">
      <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-4 border border-slate-100/50">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">
        {title}
      </h3>
      <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-normal">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
