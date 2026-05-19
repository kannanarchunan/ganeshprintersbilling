import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { forceSyncAllData } from '@/lib/sheets/sync';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();

    // 1. Fetch all places
    const { data: places, error: placesError } = await supabase
      .from('places')
      .select('*')
      .order('name', { ascending: true });

    if (placesError) throw placesError;

    // 2. Fetch all bills
    const { data: bills, error: billsError } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: false });

    if (billsError) throw billsError;

    // 3. Fetch all activity logs
    const { data: logs, error: logsError } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (logsError) throw logsError;

    // 4. Force sync everything into Google Sheets
    await forceSyncAllData(places || [], bills || [], logs || []);

    return NextResponse.json({
      message: `Full database successfully synchronized to Google Sheet! Synced ${places?.length || 0} places, ${bills?.length || 0} bills, and ${logs?.length || 0} activity logs.`,
    });
  } catch (err: any) {
    console.error('API Sheets connection and sync failure:', err);
    return NextResponse.json(
      { error: err.message || 'Synchronization failed.' },
      { status: 500 }
    );
  }
}
