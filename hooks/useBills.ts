import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bill } from '@/types';

export const useBills = (placeId: string, status?: 'pending' | 'completed') => {
  const queryClient = useQueryClient();

  // 1. Query key includes parameters for high quality cache separation
  const queryKey = ['bills', placeId, status].filter(Boolean);

  const { data: bills = [], isLoading, error, refetch } = useQuery<Bill[]>({
    queryKey,
    queryFn: async () => {
      let url = `/api/bills?placeId=${placeId}`;
      if (status) url += `&status=${status}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to retrieve bills');
      const payload = await res.json();
      return payload.data || [];
    },
    staleTime: 30000,
    enabled: !!placeId,
  });

  // 2. Create mutation
  const createBillMutation = useMutation({
    mutationFn: async (billData: Omit<Bill, 'id' | 'created_at' | 'status' | 'completed_at'>) => {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || 'Failed to submit bill');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // 3. Update mutation
  const updateBillMutation = useMutation({
    mutationFn: async ({ id, ...billData }: Partial<Bill> & { id: string }) => {
      const res = await fetch(`/api/bills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || 'Failed to save bill edits');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // 4. Mark Complete mutation (with snatch Optimistic Updates)
  const completeBillMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/bills/${id}/complete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to mark invoice complete');
      return res.json();
    },
    // Snappy Optimistic UI Updates!
    onMutate: async (billId: string) => {
      // Cancel outgoing queries to avoid overwriting optimistic state
      await queryClient.cancelQueries({ queryKey: ['bills'] });

      // Snapshot the previous cache value
      const previousBills = queryClient.getQueryData<Bill[]>(queryKey);

      // Optimistically update the matching bill in cache
      if (previousBills) {
        queryClient.setQueryData<Bill[]>(
          queryKey,
          previousBills.map((b) =>
            b.id === billId
              ? { ...b, status: 'completed', completed_at: new Date().toISOString() }
              : b
          )
        );
      }

      // Return context with backup value
      return { previousBills };
    },
    onError: (_err, _billId, context) => {
      // Revert cache if server request fails
      if (context?.previousBills) {
        queryClient.setQueryData(queryKey, context.previousBills);
      }
    },
    onSettled: () => {
      // Sync cache back with database
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // 5. Delete mutation
  const deleteBillMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/bills/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete bill record');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    bills,
    isLoading,
    error,
    refetch,
    createBill: createBillMutation.mutateAsync,
    isCreating: createBillMutation.isPending,
    updateBill: updateBillMutation.mutateAsync,
    isUpdating: updateBillMutation.isPending,
    completeBill: completeBillMutation.mutateAsync,
    isCompleting: completeBillMutation.isPending,
    deleteBill: deleteBillMutation.mutateAsync,
    isDeleting: deleteBillMutation.isPending,
  };
};
export default useBills;
