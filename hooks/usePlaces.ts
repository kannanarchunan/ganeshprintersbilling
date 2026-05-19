import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Place } from '@/types';

// Fetch all places A-Z
export const usePlaces = () => {
  const queryClient = useQueryClient();

  const { data: places = [], isLoading, error, refetch } = useQuery<Place[]>({
    queryKey: ['places'],
    queryFn: async () => {
      const res = await fetch('/api/places');
      if (!res.ok) throw new Error('Failed to retrieve places list');
      const payload = await res.json();
      return payload.data || [];
    },
    staleTime: 30000,
  });

  // Create mutation
  const createPlaceMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || 'Failed to create location');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Rename mutation
  const updatePlaceMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await fetch(`/api/places/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || 'Failed to update location name');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['place', variables.id] });
    },
  });

  // Delete mutation
  const deletePlaceMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/places/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete location');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    places,
    isLoading,
    error,
    refetch,
    createPlace: createPlaceMutation.mutateAsync,
    isCreating: createPlaceMutation.isPending,
    updatePlace: updatePlaceMutation.mutateAsync,
    isUpdating: updatePlaceMutation.isPending,
    deletePlace: deletePlaceMutation.mutateAsync,
    isDeleting: deletePlaceMutation.isPending,
  };
};
