import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

/**
 * GET /api/owner/bookings
 * Get all bookings for owner's shop
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is owner or admin
        if (session.user.role !== 'owner' && session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Only shop owners can access this' }, { status: 403 });
        }

        const supabase = createServerClient();
        const { searchParams } = new URL(request.url);
        const shopId = searchParams.get('shopId');

        // For owner, get their shop's bookings
        // For now, we'll get all bookings if shopId provided
        let query = supabase
            .from('bookings')
            .select(`
                *,
                profiles:user_id (id, name, email, phone),
                services:service_id (id, name, price, duration_min),
                shops:shop_id (id, name)
            `)
            .order('date', { ascending: false });

        if (shopId) {
            query = query.eq('shop_id', shopId);
        }

        const { data: bookings, error } = await query;

        if (error) {
            console.error('Error fetching bookings:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
