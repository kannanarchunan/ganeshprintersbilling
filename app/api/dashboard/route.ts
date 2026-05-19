import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();

    // 1. Fetch metrics
    const { count: totalPlaces, error: placesError } = await supabase
      .from('places')
      .select('*', { count: 'exact', head: true });

    if (placesError) throw placesError;

    const { data: bills, error: billsError } = await supabase
      .from('bills')
      .select('amount, status, place_id');

    if (billsError) throw billsError;

    // Fetch places profiles to map details in-memory
    const { data: places, error: placeProfilesError } = await supabase
      .from('places')
      .select('id, name');

    if (placeProfilesError) throw placeProfilesError;

    // Calculate aggregated metrics
    const totalBills = bills?.length || 0;
    const totalPending = bills?.filter((b) => b.status === 'pending') || [];
    const totalCompleted = bills?.filter((b) => b.status === 'completed') || [];

    const totalPendingAmount = totalPending.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalCompletedAmount = totalCompleted.reduce((sum, b) => sum + Number(b.amount), 0);

    // 2. Fetch Top Outstanding places (places with outstanding balances)
    const placePendingBalances = places.map((place) => {
      const placePending = totalPending.filter((b) => b.place_id === place.id);
      const pendingSum = placePending.reduce((sum, b) => sum + Number(b.amount), 0);
      return {
        ...place,
        pending_sum: pendingSum,
        pending_count: placePending.length,
      };
    });

    // Sort by outstanding sum desc, filter for non-zero sums, take top 5
    const topOutstandingPlaces = placePendingBalances
      .filter((p) => p.pending_sum > 0)
      .sort((a, b) => b.pending_sum - a.pending_sum)
      .slice(0, 5);

    // 3. Fetch recent activities (limit 10)
    const { data: recentActivity, error: activityError } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (activityError) throw activityError;

    const dashboardPayload = {
      metrics: {
        totalPlaces: totalPlaces || 0,
        totalPendingAmount,
        totalCompletedAmount,
        totalBills,
      },
      topOutstandingPlaces,
      recentActivity: recentActivity || [],
    };

    return NextResponse.json({ data: dashboardPayload });
  } catch (err: any) {
    console.error('API GET Dashboard Failure:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to aggregate dashboard data.' },
      { status: 500 }
    );
  }
}
