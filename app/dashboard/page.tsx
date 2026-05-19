'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, MapPin, ClipboardList, Wallet, Sparkles, TrendingUp, History, CloudLightning } from 'lucide-react';
import AuthGuard from '@/components/layout/AuthGuard';
import MobileLayout from '@/components/layout/MobileLayout';
import PageHeader from '@/components/layout/PageHeader';
import SkeletonCard, { SkeletonBanner } from '@/components/ui/SkeletonCard';
import EmptyState from '@/components/ui/EmptyState';
import { useDashboard } from '@/hooks/useDashboard';
import { useToast } from '@/components/ui/ToastProvider';
import { formatIndianCurrency } from '@/lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { dashboardData, isLoading, error, refetch } = useDashboard();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSyncSheets = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/sync/sheets', { method: 'POST' });
      if (!res.ok) throw new Error('Google Sheets synchronization failed');
      const data = await res.json();
      toast(data.message || 'Sheets successfully synchronized!', 'success');
    } catch (err: any) {
      toast(err.message || 'Sync failed. Please verify credentials.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast('Dashboard analytics refreshed!', 'info');
    } catch {
      toast('Refresh failed. Please check network connection.', 'error');
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <MobileLayout showNav={true}>
          <PageHeader title="Dashboard" showLogout={true} />
          <div className="p-4 space-y-4">
            <SkeletonBanner />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </MobileLayout>
      </AuthGuard>
    );
  }

  if (error || !dashboardData) {
    return (
      <AuthGuard>
        <MobileLayout showNav={true}>
          <PageHeader title="Dashboard" showLogout={true} />
          <div className="p-6 text-center select-none">
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-2xl p-4.5">
              ⚠️ Failed to load administrative metrics. Please try again later.
            </p>
          </div>
        </MobileLayout>
      </AuthGuard>
    );
  }

  const { metrics, topOutstandingPlaces, recentActivity } = dashboardData;

  return (
    <AuthGuard>
      <MobileLayout showNav={true}>
        <PageHeader
          title="Admin Dashboard"
          subtitle="Ganesh Printers Analytics"
          showLogout={true}
          rightAction={
            <div className="flex items-center gap-1">
              <button
                onClick={handleSyncSheets}
                disabled={isSyncing}
                className="text-white/80 hover:text-white hover:bg-white/10 active:scale-90 p-2 rounded-full transition-all duration-100 disabled:opacity-50"
                title="Sync Google Sheets"
              >
                <CloudLightning className={`h-4.5 w-4.5 ${isSyncing ? 'animate-bounce text-amber-300' : ''}`} />
              </button>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="text-white/80 hover:text-white hover:bg-white/10 active:scale-90 p-2 rounded-full transition-all duration-100 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`h-4.5 w-4.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-5 select-none">
          
          {/* 1. Summary Metrics Cards (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Places */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <MapPin className="h-5 w-5 text-primary-500" />
                <span className="text-[8px] font-bold uppercase tracking-wider">Locations</span>
              </div>
              <div className="mt-3">
                <div className="text-base font-extrabold text-slate-800 leading-none">
                  {metrics.totalPlaces}
                </div>
                <p className="text-[8px] text-slate-400 font-semibold mt-1">Delivery Places</p>
              </div>
            </div>

            {/* Total Invoices */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <ClipboardList className="h-5 w-5 text-amber-500" />
                <span className="text-[8px] font-bold uppercase tracking-wider">Invoices</span>
              </div>
              <div className="mt-3">
                <div className="text-base font-extrabold text-slate-800 leading-none">
                  {metrics.totalBills}
                </div>
                <p className="text-[8px] text-slate-400 font-semibold mt-1">Total Invoiced</p>
              </div>
            </div>

            {/* Total Pending Rupees */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-600">
                <Wallet className="h-5 w-5 shrink-0" />
                <span className="text-[8px] font-bold uppercase tracking-wider">Pending</span>
              </div>
              <div className="mt-3">
                <div className="text-sm font-black text-amber-800 leading-none">
                  {formatIndianCurrency(metrics.totalPendingAmount)}
                </div>
                <p className="text-[8px] text-amber-600/80 font-semibold mt-1">Outstanding Balance</p>
              </div>
            </div>

            {/* Total Completed Rupees */}
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-primary-600">
                <TrendingUp className="h-5 w-5 shrink-0" />
                <span className="text-[8px] font-bold uppercase tracking-wider">Collected</span>
              </div>
              <div className="mt-3">
                <div className="text-sm font-black text-primary-800 leading-none">
                  {formatIndianCurrency(metrics.totalCompletedAmount)}
                </div>
                <p className="text-[8px] text-primary-600/80 font-semibold mt-1">Paid off Balance</p>
              </div>
            </div>
          </div>

          {/* 2. Top 5 Places by Pending Amount */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3.5">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Top Outstanding Locations
            </h3>

            {topOutstandingPlaces.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic">
                Awesome! No locations have outstanding bills.
              </p>
            ) : (
              <div className="space-y-3">
                {topOutstandingPlaces.map((place, idx) => (
                  <button
                    key={place.id}
                    onClick={() => router.push(`/places/${place.id}`)}
                    className="w-full flex items-center justify-between text-left group active:opacity-80"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-400">{idx + 1}.</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 leading-tight group-hover:text-primary-600 transition-colors">
                          {place.name}
                        </h4>
                        <p className="text-[8px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">
                          {place.pending_count} pending invoices
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100/50">
                      {formatIndianCurrency(place.pending_sum)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Recent Activity Log (10 events) */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3.5">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <History className="h-4 w-4 text-slate-400" />
              System Activity Logs
            </h3>

            {recentActivity.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic">
                No system logs recorded.
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((log) => {
                  const logDate = new Date(log.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: 'numeric',
                    minute: '2-digit',
                  });

                  return (
                    <div key={log.id} className="text-[10px] flex items-start justify-between gap-3 border-b border-slate-200/50 pb-2.5 last:border-0 last:pb-0">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-700 leading-snug">
                          {log.action_type === 'place_created' && `Created delivery place "${log.place_name}"`}
                          {log.action_type === 'place_updated' && `Renamed place to "${log.place_name}"`}
                          {log.action_type === 'place_deleted' && `Deleted place "${log.place_name}"`}
                          {log.action_type === 'bill_created' && `Logged bill #${log.bill_number} for ${log.place_name}`}
                          {log.action_type === 'bill_completed' && `Collected bill #${log.bill_number} for ${log.place_name}`}
                          {log.action_type === 'bill_updated' && `Updated bill #${log.bill_number} details for ${log.place_name}`}
                          {log.action_type === 'bill_deleted' && `Deleted bill #${log.bill_number} for ${log.place_name}`}
                        </span>
                        {log.amount && (
                          <p className="font-extrabold text-slate-500">
                            Amount: {formatIndianCurrency(Number(log.amount))}
                          </p>
                        )}
                      </div>
                      <span className="text-[8px] text-slate-400 font-bold shrink-0">{logDate}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </MobileLayout>
    </AuthGuard>
  );
}
