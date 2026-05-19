import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="w-full bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-xl" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-28" />
            <div className="h-3 bg-slate-150 rounded w-16" />
          </div>
        </div>
        <div className="h-6 bg-slate-200 rounded-full w-10" />
      </div>
    </div>
  );
}

export function SkeletonBanner() {
  return (
    <div className="w-full bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-2/3" />
      <div className="grid grid-cols-3 gap-2">
        <div className="h-12 bg-slate-150 rounded-xl" />
        <div className="h-12 bg-slate-150 rounded-xl" />
        <div className="h-12 bg-slate-150 rounded-xl" />
      </div>
    </div>
  );
}
