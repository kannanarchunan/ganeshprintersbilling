import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { placeSchema } from '@/lib/validators/placeSchema';
import { syncToSheets } from '@/lib/sheets/sync';

// 1. GET: Fetch all places alphabetically sorted A-Z with aggregate stats
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();

    // Fetch places A-Z
    const { data: places, error: placesError } = await supabase
      .from('places')
      .select('*')
      .order('name', { ascending: true });

    if (placesError) throw placesError;

    // Fetch outstanding metrics from bills to aggregate in memory
    const { data: bills, error: billsError } = await supabase
      .from('bills')
      .select('place_id, amount, status');

    if (billsError) throw billsError;

    // Calculate aggregates in-memory (highly performant and robust)
    const aggregatedPlaces = places.map((place) => {
      const placeBills = bills?.filter((b) => b.place_id === place.id) || [];
      const pendingBills = placeBills.filter((b) => b.status === 'pending');
      const completedBills = placeBills.filter((b) => b.status === 'completed');

      const totalPending = pendingBills.reduce((sum, b) => sum + Number(b.amount), 0);
      const totalCompleted = completedBills.reduce((sum, b) => sum + Number(b.amount), 0);

      return {
        ...place,
        pending_count: pendingBills.length,
        completed_count: completedBills.length,
        total_pending: totalPending,
        total_completed: totalCompleted,
      };
    });

    return NextResponse.json({ data: aggregatedPlaces });
  } catch (err: any) {
    console.error('API GET Places Failure:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve places list.' },
      { status: 500 }
    );
  }
}

// 2. POST: Create a new location with Zod checks & Sheets sync
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Zod validation checks
    const parsed = placeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Insert to database
    const { data: newPlace, error: insertError } = await supabase
      .from('places')
      .insert([{ name: parsed.data.name }])
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'A location with this name already exists.' },
          { status: 409 }
        );
      }
      throw insertError;
    }

    // Append to activity log table
    await supabase.from('activity_logs').insert([
      {
        action_type: 'place_created',
        place_id: newPlace.id,
        place_name: newPlace.name,
      },
    ]);

    // Google Sheets synchronization (non-blocking)
    await syncToSheets({ type: 'place_created', place: newPlace });

    return NextResponse.json({
      data: newPlace,
      message: 'Location successfully created.',
    });
  } catch (err: any) {
    console.error('API POST Places Failure:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to submit location.' },
      { status: 500 }
    );
  }
}
