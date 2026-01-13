import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

interface Params {
    params: Promise<{ shopId: string }>;
}

/**
 * GET /api/shop-hours/[shopId]
 * Get shop operating hours
 */
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { shopId } = await params;
        const supabase = createServerClient();

        const { data: hours, error } = await supabase
            .from('shop_hours')
            .select('*')
            .eq('shop_id', shopId)
            .order('day_of_week', { ascending: true });

        if (error) {
            console.error('Error fetching shop hours:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ hours });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/shop-hours/[shopId]
 * Set shop operating hours (Owner only)
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

        // Upsert hours (body.hours should be array of {dayOfWeek, openTime, closeTime, isClosed})
        const hoursData = body.hours.map((h: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }) => ({
            shop_id: shopId,
            day_of_week: h.dayOfWeek,
            open_time: h.openTime,
            close_time: h.closeTime,
            is_closed: h.isClosed || false,
        }));

        const { data: hours, error } = await supabase
            .from('shop_hours')
            .upsert(hoursData, { onConflict: 'shop_id,day_of_week' })
            .select();

        if (error) {
            console.error('Error setting shop hours:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ hours });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
