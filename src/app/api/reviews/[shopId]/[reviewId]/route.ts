import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

interface Params {
    params: Promise<{ shopId: string; reviewId: string }>;
}

/**
 * GET /api/reviews/[shopId]/[reviewId]
 * Get a single review
 */
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { reviewId } = await params;
        const supabase = createServerClient();

        const { data: review, error } = await supabase
            .from('reviews')
            .select(`
                *,
                profiles:user_id (name, email)
            `)
            .eq('id', reviewId)
            .single();

        if (error || !review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        return NextResponse.json({ review });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/reviews/[shopId]/[reviewId]
 * Update a review (user can edit within 7 days)
 */
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { reviewId } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();
        const body = await request.json();

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get existing review
        const { data: existingReview } = await supabase
            .from('reviews')
            .select('*')
            .eq('id', reviewId)
            .single() as { data: any };

        if (!existingReview) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        // Check ownership
        if (existingReview.user_id !== profile.id) {
            return NextResponse.json({ error: 'You can only edit your own reviews' }, { status: 403 });
        }

        // Check 7-day edit window
        const createdAt = new Date(existingReview.created_at);
        const now = new Date();
        const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff > 7) {
            return NextResponse.json({ error: 'Can only edit reviews within 7 days of creation' }, { status: 400 });
        }

        // Update review
        const updateData: any = {};
        if (body.rating !== undefined) updateData.rating = body.rating;
        if (body.content !== undefined) updateData.content = body.content.trim();

        const { data: review, error } = await supabase
            .from('reviews')
            .update(updateData)
            .eq('id', reviewId)
            .select()
            .single();

        if (error) {
            console.error('Error updating review:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ review });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/reviews/[shopId]/[reviewId]
 * Delete a review (user can delete their own)
 */
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { reviewId } = await params;
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

        // Get existing review to verify ownership
        const { data: existingReview } = await supabase
            .from('reviews')
            .select('user_id')
            .eq('id', reviewId)
            .single() as { data: any };

        if (!existingReview) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        if (existingReview.user_id !== profile.id) {
            return NextResponse.json({ error: 'You can only delete your own reviews' }, { status: 403 });
        }

        // Delete review
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);

        if (error) {
            console.error('Error deleting review:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
