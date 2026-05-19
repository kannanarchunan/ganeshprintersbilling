'use client';

import { Search, X } from 'lucide-react';

interface PlaceSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function PlaceSearchBar({
  value,
  onChange,
  placeholder = 'Search delivery locations...',
}: PlaceSearchBarProps) {
  return (
    <div className="relative mx-4 mt-3 mb-1 select-none">
      <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 focus:border-primary-400 focus:bg-white rounded-2xl pl-10 pr-9 py-2.5 placeholder:text-slate-400 text-xs font-semibold focus:outline-none transition-all duration-150"
        autoFocus
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 active:scale-90"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
