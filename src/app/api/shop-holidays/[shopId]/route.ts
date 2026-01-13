import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

interface Params {
    params: Promise<{ shopId: string }>;
}

/**
 * GET /api/shop-holidays/[shopId]
 * Get shop holidays
 */
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { shopId } = await params;
        const supabase = createServerClient();

        const searchParams = request.nextUrl.searchParams;
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        let query = supabase
            .from('shop_holidays')
            .select('*')
            .eq('shop_id', shopId)
            .order('holiday_date', { ascending: true });

        if (from) {
            query = query.gte('holiday_date', from);
        }
        if (to) {
            query = query.lte('holiday_date', to);
        }

        const { data: holidays, error } = await query;

        if (error) {
            console.error('Error fetching holidays:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ holidays });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/shop-holidays/[shopId]
 * Add a holiday (Owner only)
 */
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { shopId } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();
        const body = await request.json();

        // Verify ownership
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        const { data: shop } = await supabase
            .from('shops')
            .select('id')
            .eq('id', shopId)
            .eq('owner_id', profile?.id)
            .single();

        if (!shop) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const { data: holiday, error } = await supabase
            .from('shop_holidays')
            .insert({
                shop_id: shopId,
                holiday_date: body.date,
                reason: body.reason || null,
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Holiday already exists' }, { status: 400 });
            }
            console.error('Error adding holiday:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ holiday }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/shop-holidays/[shopId]
 * Remove a holiday (Owner only)
 */
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { shopId } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();
        const searchParams = request.nextUrl.searchParams;
        const date = searchParams.get('date');

        if (!date) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        // Verify ownership
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        const { data: shop } = await supabase
            .from('shops')
            .select('id')
            .eq('id', shopId)
            .eq('owner_id', profile?.id)
            .single();

        if (!shop) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const { error } = await supabase
            .from('shop_holidays')
            .delete()
            .eq('shop_id', shopId)
            .eq('holiday_date', date);

        if (error) {
            console.error('Error removing holiday:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Holiday removed' });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
