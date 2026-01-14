import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

/**
 * ============================================
 * Blocked Slots API
 * POST /api/owner/schedule/block
 * 
 * Add or remove a blocked time slot
 * 
 * Table columns: id, shop_id, blocked_date, start_time, end_time, reason, created_at
 * ============================================
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { shopId, date, time, action, reason } = body;

        if (!shopId || !date || !time || !action) {
            return NextResponse.json({
                error: 'shopId, date, time, and action (block/unblock) are required'
            }, { status: 400 });
        }

        const supabase = createServerClient();

        if (action === 'block') {
            // Check if already blocked
            const { data: existing } = await supabase
                .from('shop_blocked_slots')
                .select('id')
                .eq('shop_id', shopId)
                .eq('blocked_date', date)
                .eq('start_time', time)
                .single();

            if (existing) {
                return NextResponse.json({ blocked: true, message: 'Already blocked' });
            }

            // Insert new blocked slot
            // end_time = start_time + 30 minutes (default slot duration)
            const [hour, min] = time.split(':').map(Number);
            let endHour = hour;
            let endMin = min + 30;
            if (endMin >= 60) {
                endMin = 0;
                endHour++;
            }
            const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

            const { data, error } = await supabase
                .from('shop_blocked_slots')
                .insert({
                    shop_id: shopId,
                    blocked_date: date,
                    start_time: time,
                    end_time: endTime,
                    reason: reason || null
                })
                .select()
                .single();

            if (error) {
                console.error('Error blocking slot:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ blocked: true, slot: data });

        } else if (action === 'unblock') {
            // Remove blocked slot
            const { error } = await supabase
                .from('shop_blocked_slots')
                .delete()
                .eq('shop_id', shopId)
                .eq('blocked_date', date)
                .eq('start_time', time);

            if (error) {
                console.error('Error unblocking slot:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ blocked: false });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Error in POST /api/owner/schedule/block:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
