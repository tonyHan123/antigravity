import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

/**
 * GET /api/owner/reviews
 * Get all reviews for the owner's shop
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
            .select('id')
            .eq('email', session.user.email)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get owner's shop
        const { data: shop } = await supabase
            .from('shops' as any)
            .select('id')
            .eq('owner_id', profile.id)
            .single() as { data: any };

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        }

        // Get all reviews for this shop with user profiles
        const { data: reviews, error } = await supabase
            .from('reviews' as any)
            .select(`
                *,
                profiles:user_id (name, email),
                bookings:booking_id (date, time, services(name)),
                moderation_request:review_moderation_requests(id, status, reason)
            `)
            .eq('shop_id', shop.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ reviews, shopId: shop.id });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
