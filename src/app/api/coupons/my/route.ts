import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

/**
 * GET /api/coupons/my
 * Get current user's claimed coupons (Coupon Wallet)
 */
export async function GET() {
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

        // Get user's claimed coupons with coupon details
        const { data: userCoupons, error } = await supabase
            .from('user_coupons')
            .select(`
        *,
        coupons:coupon_id (
          *,
          shops:shop_id (id, name)
        )
      `)
            .eq('user_id', profile.id)
            .is('used_at', null) // Only unused coupons
            .order('claimed_at', { ascending: false });

        if (error) {
            console.error('Error fetching user coupons:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ userCoupons });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

