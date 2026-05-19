import { useQuery } from '@tanstack/react-query';
import { ActivityLog, Place } from '@/types';

export interface DashboardData {
  metrics: {
    totalPlaces: number;
    totalPendingAmount: number;
    totalCompletedAmount: number;
    totalBills: number;
  };
  topOutstandingPlaces: (Place & { pending_sum: number })[];
  recentActivity: ActivityLog[];
}

export const useDashboard = () => {
  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to retrieve dashboard metrics');
      const payload = await res.json();
      return payload.data;
    },
    staleTime: 30000,
  });

  return {
    dashboardData: data,
    isLoading,
    error,
    refetch,
  };
};
