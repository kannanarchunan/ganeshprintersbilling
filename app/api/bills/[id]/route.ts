import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { billSchema } from '@/lib/validators/billSchema';
import { syncToSheets } from '@/lib/sheets/sync';

interface RouteContext {
  params: {
    id: string;
  };
}

// 1. GET: Retrieve a single bill
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const supabase = getSupabaseServer();

    const { data: bill, error: billError } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .single();

    if (billError) {
      return NextResponse.json({ error: 'Bill not found.' }, { status: 404 });
    }

    return NextResponse.json({ data: bill });
  } catch (err: any) {
    console.error('API GET Single Bill Failure:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve bill.' },
      { status: 500 }
    );
  }
}

// 2. PUT: Update bill details
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await request.json();

    const parsed = billSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Fetch place name for logging
    const { data: place } = await supabase
      .from('places')
      .select('name')
      .eq('id', parsed.data.place_id)
      .single();

    const placeName = place?.name || 'Unknown Place';

    // Update bill
    const updateData = {
      place_id: parsed.data.place_id,
      bill_number: parsed.data.bill_number,
      amount: parsed.data.amount,
      notes: parsed.data.notes || null,
      due_date: parsed.data.due_date || null,
    };

    const { data: updatedBill, error: updateError } = await supabase
      .from('bills')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === '23505') {
        return NextResponse.json(
          { error: `Bill number ${parsed.data.bill_number} already exists for this place.` },
          { status: 409 }
        );
      }
      throw updateError;
    }

    // Log Activity
    await supabase.from('activity_logs').insert([
      {
        action_type: 'bill_updated',
        bill_id: id,
        place_id: updatedBill.place_id,
        place_name: placeName,
        bill_number: updatedBill.bill_number,
        amount: updatedBill.amount,
        status: updatedBill.status,
      },
    ]);

    // Google Sheets synchronization (non-blocking)
    await syncToSheets({ type: 'bill_updated', bill: updatedBill });

    return NextResponse.json({
      data: updatedBill,
      message: 'Bill details successfully saved.',
    });
  } catch (err: any) {
    console.error('API PUT Bill Failure:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update bill.' },
      { status: 500 }
    );
  }
}

// 3. DELETE: Remove bill
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const supabase = getSupabaseServer();

    // Fetch details for logging/sync before deletion
    const { data: billToDelete } = await supabase
      .from('bills')
      .select('*, places(name)')
      .eq('id', id)
      .single();

    if (!billToDelete) {
      return NextResponse.json({ error: 'Bill record not found.' }, { status: 404 });
    }

    const placeName = (billToDelete.places as any)?.name || 'Unknown Place';

    // Delete bill
    const { error: deleteError } = await supabase
      .from('bills')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Log deletion
    await supabase.from('activity_logs').insert([
      {
        action_type: 'bill_deleted',
        bill_id: id,
        place_id: billToDelete.place_id,
        place_name: placeName,
        bill_number: billToDelete.bill_number,
        amount: billToDelete.amount,
      },
    ]);

    // Sheets synchronization
    await syncToSheets({ type: 'bill_deleted', bill: billToDelete });

    return NextResponse.json({
      message: 'Bill record successfully deleted.',
    });
  } catch (err: any) {
    console.error('API DELETE Bill Failure:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete bill.' },
      { status: 500 }
    );
  }
}
