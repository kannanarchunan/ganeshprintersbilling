'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, CheckCircle2, History, Edit, Trash } from 'lucide-react';
import AuthGuard from '@/components/layout/AuthGuard';
import MobileLayout from '@/components/layout/MobileLayout';
import PageHeader from '@/components/layout/PageHeader';
import BillSummaryCards from '@/components/bills/BillSummaryCards';
import EditPlaceSheet from '@/components/places/EditPlaceSheet';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SkeletonCard, { SkeletonBanner } from '@/components/ui/SkeletonCard';
import { usePlaces } from '@/hooks/usePlaces';
import { useToast } from '@/components/ui/ToastProvider';
import { formatIndianCurrency } from '@/lib/utils';
import { Place } from '@/types';

interface PlaceDashboardProps {
  params: {
    placeId: string;
  };
}

export default function PlaceDashboardPage({ params }: PlaceDashboardProps) {
  const { placeId } = params;
  const router = useRouter();
  const { toast } = useToast();
  
  // Custom hooks for place mutate operations
  const { updatePlace, isUpdating, deletePlace, isDeleting } = usePlaces();

  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  // Dialog & Form states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Custom fetch function to get place data and recent actions
  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`/api/places/${placeId}`);
      if (!res.ok) throw new Error();
      const payload = await res.json();
      setPlace(payload.data);

      // Fetch recent actions for this location
      const actRes = await fetch('/api/dashboard');
      if (actRes.ok) {
        const actPayload = await actRes.json();
        const logs = actPayload.data?.recentActivity || [];
        setActivities(logs.filter((log: any) => log.place_id === placeId).slice(0, 5));
      }
    } catch {
      toast('Failed to retrieve location details.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [placeId]);

  const handleRename = async (id: string, name: string) => {
    try {
      await updatePlace({ id, name });
      toast('Place renamed successfully!', 'success');
      fetchDashboardData(); // Refresh page data
    } catch (err: any) {
      toast(err.message || 'Failed to rename location.', 'error');
      throw err;
    }
  };

  const handleDelete = async () => {
    try {
      await deletePlace(placeId);
      toast('Place and linked bills deleted successfully.', 'success');
      router.replace('/places');
    } catch {
      toast('Failed to delete place. Please try again.', 'error');
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <MobileLayout showNav={true}>
          <PageHeader title="Loading..." showBack={true} />
          <div className="p-4 space-y-4">
            <SkeletonBanner />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </MobileLayout>
      </AuthGuard>
    );
  }

  if (!place) {
    return (
      <AuthGuard>
        <MobileLayout showNav={true}>
          <PageHeader title="Not Found" showBack={true} />
          <div className="p-6 text-center">
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-2xl p-4.5">
              ⚠️ This delivery place does not exist or has been deleted.
            </p>
          </div>
        </MobileLayout>
      </AuthGuard>
    );
  }

  // Aggregate outstanding stats
  const pendingCount = place.pending_count || 0;
  const totalPending = place.total_pending || 0;
  const totalCompleted = place.total_completed || 0;
  const billCount = (place.pending_count || 0) + (place.completed_count || 0);

  return (
    <AuthGuard>
      <MobileLayout showNav={true}>
        <PageHeader
          title={place.name}
          subtitle="Location Dashboard"
          showBack={true}
          backHref="/places"
          rightAction={
            <div className="flex gap-1">
              <button
                onClick={() => setIsEditOpen(true)}
                className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full active:scale-90 transition-all"
                title="Rename Location"
              >
                <Edit className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full active:scale-90 transition-all text-red-100 hover:text-red-200"
                title="Delete Location"
              >
                <Trash className="h-4.5 w-4.5" />
              </button>
            </div>
          }
        />

        {/* Dynamic Metric overview */}
        <div className="mt-3">
          <BillSummaryCards
            totalPending={totalPending}
            totalCompleted={totalCompleted}
            billCount={billCount}
          />
        </div>

        {/* Tappable Navigation Cards */}
        <div className="p-4 space-y-3.5 select-none">
          {/* 1. Pending bills quick link */}
          <button
            onClick={() => router.push(`/places/${placeId}/pending`)}
            className="w-full bg-white border border-amber-100 hover:border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm active:scale-98 active:bg-amber-50/20 transition-all text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100/50">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Pending Bills</h4>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                  Collect {formatIndianCurrency(totalPending)} outstanding
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {pendingCount > 0 && (
                <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
              <ArrowRight className="h-4 w-4 text-amber-500" />
            </div>
          </button>

          {/* 2. Completed bills quick link */}
          <button
            onClick={() => router.push(`/places/${placeId}/completed`)}
            className="w-full bg-white border border-primary-100 hover:border-primary-200 rounded-2xl p-4 flex items-center justify-between shadow-sm active:scale-98 active:bg-primary-50/20 transition-all text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 border border-primary-100/50">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Completed Bills</h4>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                  Paid bills statement archive
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-primary-600" />
          </button>
        </div>

        {/* Recent logs */}
        <div className="flex-1 px-4 pb-6 select-none">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <History className="h-4 w-4 text-slate-400" />
              Recent Local Activity
            </h4>
            
            {activities.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic">
                No recent transactions logged for this place.
              </p>
            ) : (
              <div className="space-y-2.5">
                {activities.map((log) => {
                  const logDate = new Date(log.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: 'numeric',
                    minute: '2-digit',
                  });

                  return (
                    <div key={log.id} className="text-[10px] flex items-start justify-between gap-2 border-b border-slate-200/50 pb-2 last:border-0 last:pb-0">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800">
                          {log.action_type === 'bill_created' && `Created pending bill #${log.bill_number}`}
                          {log.action_type === 'bill_completed' && `Collected bill #${log.bill_number}`}
                          {log.action_type === 'bill_updated' && `Updated details for bill #${log.bill_number}`}
                          {log.action_type === 'bill_deleted' && `Deleted bill #${log.bill_number}`}
                          {log.action_type === 'place_updated' && `Renamed location to "${log.place_name}"`}
                        </span>
                        {log.amount && (
                          <p className="font-extrabold text-slate-600">
                            Amount: {formatIndianCurrency(Number(log.amount))}
                          </p>
                        )}
                      </div>
                      <span className="text-[8px] text-slate-400 font-semibold shrink-0 text-right">{logDate}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Rename Bottom Sheet */}
        <EditPlaceSheet
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          place={place}
          onUpdate={handleRename}
          isLoading={isUpdating}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title={`Delete ${place.name}?`}
          description="Are you absolutely sure you want to delete this place? This will permanently erase this location and all linked bills. This action cannot be undone."
          confirmText="Yes, Delete Location"
          onConfirm={handleDelete}
          isLoading={isDeleting}
        />
      </MobileLayout>
    </AuthGuard>
  );
}
