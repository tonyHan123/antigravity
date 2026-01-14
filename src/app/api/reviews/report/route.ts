import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

/**
 * POST /api/reviews/report
 * Owner requests deletion of a review
 * Body: { reviewId, shopId, reason }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { reviewId, reason, shopId } = body;

        if (!reviewId || !reason || !shopId) {
            return NextResponse.json({ error: 'ReviewId, Reason and shopId are required' }, { status: 400 });
        }

        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        // Get user profile ID from email using generic select
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        // Check if report already exists
        const { data: existing } = await supabase
            .from('review_moderation_requests')
            .select('id')
            .eq('review_id', reviewId)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Request already exists for this review' }, { status: 409 });
        }

        // Insert request
        const { data, error } = await supabase
            .from('review_moderation_requests' as any)
            .insert({
                review_id: reviewId,
                shop_id: shopId,
                requester_id: profile.id,
                reason: reason,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Error reporting review:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ request: data });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
