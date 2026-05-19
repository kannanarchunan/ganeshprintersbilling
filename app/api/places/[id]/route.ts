import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { placeSchema } from '@/lib/validators/placeSchema';
import { syncToSheets } from '@/lib/sheets/sync';

interface RouteContext {
  params: {
    id: string;
  };
}

// 1. GET: Retrieve a single place with billing aggregates
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = getSupabaseServer();
    const { id } = params;

    // Fetch place profile
    const { data: place, error: placeError } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single();

    if (placeError) {
      return NextResponse.json({ error: 'Location not found.' }, { status: 404 });
    }

    // Fetch linked bills
    const { data: bills, error: billsError } = await supabase
      .from('bills')
      .select('*')
      .eq('place_id', id);

    if (billsError) throw billsError;

    // Aggregate statistics
    const pendingBills = bills?.filter((b) => b.status === 'pending') || [];
    const completedBills = bills?.filter((b) => b.status === 'completed') || [];

    const totalPending = pendingBills.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalCompleted = completedBills.reduce((sum, b) => sum + Number(b.amount), 0);

    const placeDetails = {
      ...place,
      pending_count: pendingBills.length,
      completed_count: completedBills.length,
      total_pending: totalPending,
      total_completed: totalCompleted,
    };

    return NextResponse.json({ data: placeDetails });
  } catch (err: any) {
    console.error('API GET Single Place Failure:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve location details.' },
      { status: 500 }
    );
  }
}

// 2. PUT: Rename location
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const body = await request.json();
    const { id } = params;

    const parsed = placeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Update location name
    const { data: updatedPlace, error: updateError } = await supabase
      .from('places')
      .update({ name: parsed.data.name })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === '23505') {
        return NextResponse.json(
          { error: 'A location with this name already exists.' },
          { status: 409 }
        );
      }
      throw updateError;
    }

    // Write to Activity Logs
    await supabase.from('activity_logs').insert([
      {
        action_type: 'place_updated',
        place_id: id,
        place_name: updatedPlace.name,
      },
    ]);

    // Google Sheets sync
    await syncToSheets({ type: 'place_updated', place: updatedPlace });

    return NextResponse.json({
      data: updatedPlace,
      message: 'Location successfully renamed.',
    });
  } catch (err: any) {
    console.error('API PUT Place Failure:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to rename location.' },
      { status: 500 }
    );
  }
}

// 3. DELETE: Delete location (cascades to bills)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const supabase = getSupabaseServer();

    // Fetch place details for logging prior to deletion
    const { data: placeToDelete } = await supabase
      .from('places')
      .select('name')
      .eq('id', id)
      .single();

    const placeName = placeToDelete?.name || 'Unknown Place';

    // Delete location
    const { error: deleteError } = await supabase
      .from('places')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Log deletion
    await supabase.from('activity_logs').insert([
      {
        action_type: 'place_deleted',
        place_id: id,
        place_name: placeName,
      },
    ]);

    // Sheets synchronization
    await syncToSheets({ 
      type: 'place_deleted', 
      place: { id, name: placeName, created_at: new Date().toISOString() } 
    });

    return NextResponse.json({
      message: 'Location and all nested bills successfully deleted.',
    });
  } catch (err: any) {
    console.error('API DELETE Place Failure:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete location.' },
      { status: 500 }
    );
  }
}
