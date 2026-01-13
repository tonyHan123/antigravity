import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

interface Params {
    params: Promise<{ couponId: string }>;
}

/**
 * POST /api/coupons/claim/[couponId]
 * Claim a coupon to user's wallet
 */
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { couponId } = await params;
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

        // Check if coupon exists and is valid
        const { data: coupon } = await supabase
            .from('coupons')
            .select('*')
            .eq('id', couponId)
            .eq('is_active', true)
            .gte('valid_until', new Date().toISOString().split('T')[0])
            .single();

        if (!coupon) {
            return NextResponse.json({ error: 'Coupon not found or expired' }, { status: 404 });
        }

        // Claim the coupon
        const { data: userCoupon, error } = await supabase
            .from('user_coupons')
            .insert({
                user_id: profile.id,
                coupon_id: couponId,
            })
            .select()
            .single();

        if (error) {
            // Check for duplicate
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Coupon already claimed' }, { status: 400 });
            }
            console.error('Error claiming coupon:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ userCoupon, message: 'Coupon claimed successfully' }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
