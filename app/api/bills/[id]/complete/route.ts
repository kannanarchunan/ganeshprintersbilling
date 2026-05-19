import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { syncToSheets } from '@/lib/sheets/sync';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const supabase = getSupabaseServer();

    // Mark as completed in the database
    const completedAt = new Date().toISOString();
    const { data: updatedBill, error: updateError } = await supabase
      .from('bills')
      .update({
        status: 'completed',
        completed_at: completedAt,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Fetch place name for logging
    const { data: place } = await supabase
      .from('places')
      .select('name')
      .eq('id', updatedBill.place_id)
      .single();

    const placeName = place?.name || 'Unknown Place';

    // Log Activity
    await supabase.from('activity_logs').insert([
      {
        action_type: 'bill_completed',
        bill_id: id,
        place_id: updatedBill.place_id,
        place_name: placeName,
        bill_number: updatedBill.bill_number,
        amount: updatedBill.amount,
        status: 'completed',
      },
    ]);

    // Google Sheets synchronization (non-blocking)
    await syncToSheets({ type: 'bill_completed', bill: updatedBill });

    return NextResponse.json({
      data: updatedBill,
      message: 'Bill successfully marked as completed.',
    });
  } catch (err: any) {
    console.error('API POST Bill Complete Failure:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to complete bill.' },
      { status: 500 }
    );
  }
}
