'use client';

import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { Place } from '@/types';
import { formatIndianCurrency } from '@/lib/utils';

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  // Outstanding metrics
  const pendingCount = place.pending_count || 0;
  const totalPending = place.total_pending || 0;

  return (
    <Link 
      href={`/places/${place.id}`}
      className="block bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md active:bg-slate-50 transition-all select-none mx-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          {/* Elegant emerald badge icon */}
          <div className="w-10 h-10 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 border border-primary-100/50">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight line-clamp-1">
              {place.name}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">
              {pendingCount} pending bills
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Outstanding amount badge */}
          {totalPending > 0 ? (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100/50">
              {formatIndianCurrency(totalPending)}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-xl border border-primary-100/30">
              Clear
            </span>
          )}
          <ArrowRight className="h-4 w-4 text-slate-300" />
        </div>
      </div>
    </Link>
  );
}
