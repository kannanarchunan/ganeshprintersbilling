'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, ClipboardList, Clock } from 'lucide-react';
import AuthGuard from '@/components/layout/AuthGuard';
import MobileLayout from '@/components/layout/MobileLayout';
import PageHeader from '@/components/layout/PageHeader';
import BillCard from '@/components/bills/BillCard';
import AddBillFAB from '@/components/bills/AddBillFAB';
import AddBillSheet from '@/components/bills/AddBillSheet';
import EditBillSheet from '@/components/bills/EditBillSheet';
import BillActionSheet from '@/components/bills/BillActionSheet';
import ExportPDFButton from '@/components/pdf/ExportPDFButton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SkeletonCard from '@/components/ui/SkeletonCard';
import EmptyState from '@/components/ui/EmptyState';
import { useBills } from '@/hooks/useBills';
import { useToast } from '@/components/ui/ToastProvider';
import { formatIndianCurrency } from '@/lib/utils';
import { Bill } from '@/types';

interface PendingBillsProps {
  params: {
    placeId: string;
  };
}

export default function PendingBillsPage({ params }: PendingBillsProps) {
  const { placeId } = params;
  const { toast } = useToast();

  const [placeName, setPlaceName] = useState('Location');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Sheet forms & Modal toggle states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // TanStack Query for Pending Bills
  const {
    bills,
    isLoading,
    error,
    refetch,
    createBill,
    isCreating,
    updateBill,
    isUpdating,
    completeBill,
    deleteBill,
    isDeleting,
  } = useBills(placeId, 'pending');

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
      toast('Pending bills list updated.', 'info');
    } catch {
      toast('Refresh failed. Please check network connection.', 'error');
    }
  };

  const handleAddBill = async (billData: any) => {
    try {
      await createBill({ ...billData, place_id: placeId });
      toast('Bill recorded successfully!', 'success');
      handleRefresh();
    } catch (err: any) {
      toast(err.message || 'Failed to submit bill.', 'error');
      throw err;
    }
  };

  const handleEditBill = async (id: string, updateData: any) => {
    try {
      await updateBill({ id, ...updateData, place_id: placeId });
      toast('Invoice details updated.', 'success');
      handleRefresh();
    } catch (err: any) {
      toast(err.message || 'Failed to save bill edits.', 'error');
      throw err;
    }
  };

  const handleMarkComplete = async (id: string) => {
    try {
      await completeBill(id);
      toast('Invoice marked PAID successfully.', 'success');
      handleRefresh();
    } catch {
      toast('Failed to update invoice status.', 'error');
    }
  };

  const handleDeleteBill = async () => {
    if (!selectedBill) return;
    try {
      await deleteBill(selectedBill.id);
      toast('Invoice record erased.', 'success');
      setIsDeleteOpen(false);
      setSelectedBill(null);
      handleRefresh();
    } catch {
      toast('Failed to delete bill.', 'error');
    }
  };

  // Aggregate pending sums
  const totalPendingSum = bills.reduce((sum, b) => sum + Number(b.amount), 0);

  return (
    <AuthGuard>
      <MobileLayout showNav={true}>
        <PageHeader
          title={placeName}
          subtitle="Pending Bills Checklist"
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

        {/* Aggregate Outstanding Summary Card */}
        {bills.length > 0 && (
          <div className="mx-4 mt-3 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl p-4.5 text-white shadow-lg shadow-amber-500/20 select-none flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-100">
                Outstanding Balance
              </span>
              <h2 className="text-2xl font-black tracking-tight leading-none mt-1">
                {formatIndianCurrency(totalPendingSum)}
              </h2>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
        )}

        {/* Pending Invoices List */}
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
                ⚠️ Failed to load pending bills. Please pull to refresh.
              </p>
            </div>
          ) : bills.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Outstanding Balance Clear!"
              description={`Awesome! All logged bills for "${placeName}" have been completed and paid off.`}
              action={
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold px-4 py-2.5 text-xs shadow-md shadow-primary-500/20 active:scale-95 transition-all select-none"
                >
                  Create First Bill
                </button>
              }
            />
          ) : (
            bills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                onSelect={(b) => {
                  setSelectedBill(b);
                  setIsActionOpen(true);
                }}
              />
            ))
          )}
        </div>

        {/* Client-side PDF downloader button */}
        {bills.length > 0 && (
          <ExportPDFButton placeName={placeName} bills={bills} />
        )}

        {/* FAB to Add Bill */}
        <AddBillFAB onClick={() => setIsAddOpen(true)} />

        {/* 1. Add Bill Sheet Form */}
        <AddBillSheet
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAdd={handleAddBill}
          isLoading={isCreating}
        />

        {/* 2. Operations Menu Sheet */}
        <BillActionSheet
          isOpen={isActionOpen}
          onClose={() => setIsActionOpen(false)}
          bill={selectedBill}
          onComplete={handleMarkComplete}
          onEdit={() => setIsEditOpen(true)}
          onDelete={() => setIsDeleteOpen(true)}
        />

        {/* 3. Edit Bill Sheet Form */}
        <EditBillSheet
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          bill={selectedBill}
          onUpdate={handleEditBill}
          isLoading={isUpdating}
        />

        {/* 4. Delete Confirm Modal */}
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="Delete Invoice?"
          description={`Are you sure you want to delete bill #${selectedBill?.bill_number} for ${placeName}? This will permanently remove it from database and spreadsheet.`}
          confirmText="Yes, Delete Bill"
          onConfirm={handleDeleteBill}
          isLoading={isDeleting}
        />
      </MobileLayout>
    </AuthGuard>
  );
}
