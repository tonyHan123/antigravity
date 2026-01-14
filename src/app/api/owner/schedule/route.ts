import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

/**
 * ============================================
 * Owner Schedule API
 * GET /api/owner/schedule?shopId=xxx
 * 
 * Returns: business hours, blocked slots, holidays
 * ============================================
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const shopId = searchParams.get('shopId');

        if (!shopId) {
            return NextResponse.json({ error: 'shopId is required' }, { status: 400 });
        }

        const supabase = createServerClient();

        // Fetch all schedule data in parallel
        const [hoursResult, blockedResult, holidaysResult] = await Promise.all([
            // 1. Business Hours (요일별 영업시간)
            supabase
                .from('shop_hours')
                .select('*')
                .eq('shop_id', shopId)
                .order('day_of_week', { ascending: true }),

            // 2. Blocked Slots (차단된 시간)
            supabase
                .from('shop_blocked_slots')
                .select('*')
                .eq('shop_id', shopId)
                .gte('blocked_date', new Date().toISOString().split('T')[0]) // Only future slots
                .order('blocked_date', { ascending: true }),

            // 3. Holidays (휴무일)
            supabase
                .from('shop_holidays')
                .select('*')
                .eq('shop_id', shopId)
                .gte('date', new Date().toISOString().split('T')[0]) // Only future holidays
                .order('date', { ascending: true })
        ]);

        return NextResponse.json({
            hours: hoursResult.data || [],
            blockedSlots: blockedResult.data || [],
            holidays: holidaysResult.data || []
        });

    } catch (error: any) {
        console.error('Error in GET /api/owner/schedule:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/owner/schedule
 * Save business hours for a shop
 * 
 * Body: { shopId, hours: [{ day_of_week, open_time, close_time, is_closed }] }
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { shopId, hours } = body;

        if (!shopId || !hours) {
            return NextResponse.json({ error: 'shopId and hours are required' }, { status: 400 });
        }

        const supabase = createServerClient();

        // Delete existing hours and insert new ones
        await supabase
            .from('shop_hours')
            .delete()
            .eq('shop_id', shopId);

        const hoursData = hours.map((h: any) => ({
            shop_id: shopId,
            day_of_week: h.day_of_week,
            open_time: h.open_time,
            close_time: h.close_time,
            is_closed: h.is_closed || false
        }));

        const { data, error } = await supabase
            .from('shop_hours')
            .insert(hoursData)
            .select();

        if (error) {
            console.error('Error saving hours:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ hours: data });

    } catch (error: any) {
        console.error('Error in POST /api/owner/schedule:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
