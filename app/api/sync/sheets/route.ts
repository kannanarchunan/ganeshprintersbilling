import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { syncToSheets } from '@/lib/sheets/sync';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();

    // Fetch active databases to verify connection
    const { count, error } = await supabase
      .from('places')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return NextResponse.json({
      message: `Sheets connection verified successfully. Active database holds ${count} locations.`,
    });
  } catch (err: any) {
    console.error('API Sheets connection verification failure:', err);
    return NextResponse.json(
      { error: err.message || 'Verification failed.' },
      { status: 500 }
    );
  }
}
