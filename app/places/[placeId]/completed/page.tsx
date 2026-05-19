'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, CheckCircle2, History } from 'lucide-react';
import AuthGuard from '@/components/layout/AuthGuard';
import MobileLayout from '@/components/layout/MobileLayout';
import PageHeader from '@/components/layout/PageHeader';
import BillCard from '@/components/bills/BillCard';
import ExportPDFButton from '@/components/pdf/ExportPDFButton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SkeletonCard from '@/components/ui/SkeletonCard';
import EmptyState from '@/components/ui/EmptyState';
import { useBills } from '@/hooks/useBills';
import { useToast } from '@/components/ui/ToastProvider';
import { formatIndianCurrency } from '@/lib/utils';
import { Bill } from '@/types';

interface CompletedBillsProps {
  params: {
    placeId: string;
  };
}

export default function CompletedBillsPage({ params }: CompletedBillsProps) {
  const { placeId } = params;
  const { toast } = useToast();

  const [placeName, setPlaceName] = useState('Location');
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // TanStack Query Completed Bills (ordered newest completed first)
  const {
    bills,
    isLoading,
    error,
    refetch,
    deleteBill,
    isDeleting,
  } = useBills(placeId, 'completed');

  // Fetch location profile dynamically
  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const res = await fetch(`/api/places/${placeId}`);
        if (res.ok) {
          const payload = await res.json();
          setPlaceName(payload.data?.name || 'Location');
        }
      } catch {
        console.warn('Place fetch failed.');
      }
    };
    fetchPlace();
  }, [placeId]);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast('Paid bills statement refreshed.', 'info');
    } catch {
      toast('Refresh failed. Please check network connection.', 'error');
    }
  };

  const handleDeleteCompletedBill = async () => {
    if (!selectedBill) return;
    try {
      await deleteBill(selectedBill.id);
      toast('Paid bill record deleted successfully.', 'success');
      setIsDeleteOpen(false);
      setSelectedBill(null);
      handleRefresh();
    } catch {
      toast('Failed to delete bill record.', 'error');
    }
  };

  // Filter paid bills by bill number
  const filteredBills = bills.filter((b) =>
    b.bill_number.toLowerCase().includes(search.toLowerCase())
  );

  // Aggregate paid sum
  const totalPaidSum = bills.reduce((sum, b) => sum + Number(b.amount), 0);

  return (
    <AuthGuard>
      <MobileLayout showNav={true}>
        <PageHeader
          title={placeName}
          subtitle="Completed / Paid Bills"
          showBack={true}
          backHref={`/places/${placeId}`}
          rightAction={
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-white/80 hover:text-white hover:bg-white/10 active:scale-90 p-2 rounded-full transition-all duration-100 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          }
        />

        {/* 1. Large Search Bar */}
        <div className="relative mx-4 mt-3 mb-1 select-none">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Bill Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-primary-400 focus:bg-white rounded-2xl pl-10 pr-9 py-2.5 placeholder:text-slate-400 text-xs font-semibold focus:outline-none transition-all duration-150"
          />
        </div>

        {/* 2. Paid Balance Summary Banner */}
        {bills.length > 0 && !search && (
          <div className="mx-4 mt-2.5 bg-gradient-to-tr from-primary-600 to-primary-700 rounded-2xl p-4.5 text-white shadow-lg shadow-primary-600/20 select-none flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary-100">
                Total Collected Balance
              </span>
              <h2 className="text-2xl font-black tracking-tight leading-none mt-1">
                {formatIndianCurrency(totalPaidSum)}
              </h2>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </div>
        )}

        {/* 3. Bills List */}
        <div className="flex-1 overflow-y-auto pt-3 pb-6 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="mx-4">
                  <SkeletonCard />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-xs text-red-600 font-bold bg-red-50 border border-red-100 rounded-2xl p-4.5">
                ⚠️ Failed to load completed bills list.
              </p>
            </div>
          ) : filteredBills.length === 0 ? (
            <EmptyState
              icon={History}
              title={search ? 'No Match Found' : 'No Paid Bills'}
              description={
                search
                  ? `No matching completed invoices were found for "${search}".`
                  : `There are no completed bills registered for "${placeName}" yet.`
              }
            />
          ) : (
            filteredBills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                onSelect={(b) => {
                  setSelectedBill(b);
                  setIsDeleteOpen(true); // Open confirm deletion on tap for completed bills
                }}
              />
            ))
          )}
        </div>

        {/* 4. PDF Exporter button at bottom */}
        {filteredBills.length > 0 && (
          <ExportPDFButton 
            placeName={placeName} 
            bills={filteredBills} 
            label="Export Completed Bills PDF"
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="Delete Paid Record?"
          description={`Are you sure you want to delete PAID bill #${selectedBill?.bill_number}? This cannot be undone.`}
          confirmText="Delete Record"
          onConfirm={handleDeleteCompletedBill}
          isLoading={isDeleting}
        />
      </MobileLayout>
    </AuthGuard>
  );
}
