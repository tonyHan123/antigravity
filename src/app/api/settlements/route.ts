import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

/**
 * GET /api/settlements
 * Get settlements (for shop owners or admin)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('email', session.user.email)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const searchParams = request.nextUrl.searchParams;
        const shopId = searchParams.get('shopId');
        const status = searchParams.get('status');

        let query = supabase
            .from('settlements')
            .select(`
        *,
        shops:shop_id (id, name, owner_id)
      `)
            .order('created_at', { ascending: false });

        // If not admin, only show own shop's settlements
        if (profile.role !== 'admin') {
            const { data: ownedShops } = await supabase
                .from('shops')
                .select('id')
                .eq('owner_id', profile.id);

            const shopIds = ownedShops?.map(s => s.id) || [];

            if (shopIds.length === 0) {
                return NextResponse.json({ settlements: [] });
            }

            query = query.in('shop_id', shopIds);
        } else if (shopId) {
            query = query.eq('shop_id', shopId);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data: settlements, error } = await query;

        if (error) {
            console.error('Error fetching settlements:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ settlements });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/settlements
 * Create a settlement record (Admin only)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        // Check if admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('email', session.user.email)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();

        const { data: settlement, error } = await supabase
            .from('settlements')
            .insert({
                shop_id: body.shopId,
                period_start: body.periodStart,
                period_end: body.periodEnd,
                gross_amount: body.grossAmount,
                fee_rate: body.feeRate,
                fee_amount: body.feeAmount,
                net_amount: body.netAmount,
                status: 'pending',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating settlement:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ settlement }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

