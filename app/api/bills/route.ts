import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { billSchema } from '@/lib/validators/billSchema';
import { syncToSheets } from '@/lib/sheets/sync';

// 1. GET: Fetch bills with query parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');
    const status = searchParams.get('status');

    const supabase = getSupabaseServer();

    let query = supabase.from('bills').select('*');

    if (placeId) {
      query = query.eq('place_id', placeId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Sort order: Completed bills -> Completed date desc. Pending bills -> Created date desc.
    if (status === 'completed') {
      query = query.order('completed_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: bills, error: billsError } = await query;
    if (billsError) throw billsError;

    return NextResponse.json({ data: bills });
  } catch (err: any) {
    console.error('API GET Bills Failure:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve bills.' },
      { status: 500 }
    );
  }
}

// 2. POST: Create a new pending bill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Zod validation check
    const parsed = billSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Fetch place details for activity logging
    const { data: place } = await supabase
      .from('places')
      .select('name')
      .eq('id', parsed.data.place_id)
      .single();

    const placeName = place?.name || 'Unknown Place';

    // Format fields
    const insertData = {
      place_id: parsed.data.place_id,
      bill_number: parsed.data.bill_number,
      amount: parsed.data.amount,
      notes: parsed.data.notes || null,
      due_date: parsed.data.due_date || null,
      status: 'pending',
    };

    const { data: newBill, error: insertError } = await supabase
      .from('bills')
      .insert([insertData])
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: `Bill number ${parsed.data.bill_number} already exists for this place.` },
          { status: 409 }
        );
      }
      throw insertError;
    }

    // Log Activity
    await supabase.from('activity_logs').insert([
      {
        action_type: 'bill_created',
        bill_id: newBill.id,
        place_id: newBill.place_id,
        place_name: placeName,
        bill_number: newBill.bill_number,
        amount: newBill.amount,
        status: newBill.status,
      },
    ]);

    // Google Sheets synchronization (non-blocking)
    await syncToSheets({ type: 'bill_created', bill: newBill });

    return NextResponse.json({
      data: newBill,
      message: 'Bill successfully created.',
    });
  } catch (err: any) {
    console.error('API POST Bill Failure:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to submit bill.' },
      { status: 500 }
    );
  }
}
