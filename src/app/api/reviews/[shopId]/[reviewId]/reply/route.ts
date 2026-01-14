import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

interface Params {
    params: Promise<{ shopId: string; reviewId: string }>;
}

/**
 * POST /api/reviews/[shopId]/[reviewId]/reply
 * Owner adds a reply to a review
 */
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { shopId, reviewId } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();
        const body = await request.json();

        if (!body.reply || body.reply.trim().length === 0) {
            return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify user is the shop owner
        const { data: shop } = await supabase
            .from('shops')
            .select('owner_id')
            .eq('id', shopId)
            .single() as { data: any };

        if (!shop || shop.owner_id !== profile.id) {
            return NextResponse.json({ error: 'Only shop owner can reply to reviews' }, { status: 403 });
        }

        // Verify review exists and belongs to this shop
        const { data: review } = await supabase
            .from('reviews')
            .select('id, owner_reply')
            .eq('id', reviewId)
            .eq('shop_id', shopId)
            .single() as { data: any };

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        if (review.owner_reply) {
            return NextResponse.json({ error: 'Reply already exists. Use PATCH to update.' }, { status: 400 });
        }

        // Add reply
        const { data: updatedReview, error } = await supabase
            .from('reviews')
            .update({
                owner_reply: body.reply.trim(),
                reply_at: new Date().toISOString()
            })
            .eq('id', reviewId)
            .select()
            .single();

        if (error) {
            console.error('Error adding reply:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ review: updatedReview }, { status: 201 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/reviews/[shopId]/[reviewId]/reply
 * Owner updates their reply
 */
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { shopId, reviewId } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();
        const body = await request.json();

        if (!body.reply || body.reply.trim().length === 0) {
            return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify user is the shop owner
        const { data: shop } = await supabase
            .from('shops')
            .select('owner_id')
            .eq('id', shopId)
            .single() as { data: any };

        if (!shop || shop.owner_id !== profile.id) {
            return NextResponse.json({ error: 'Only shop owner can update replies' }, { status: 403 });
        }

        // Update reply
        const { data: updatedReview, error } = await supabase
            .from('reviews')
            .update({
                owner_reply: body.reply.trim(),
                reply_at: new Date().toISOString()
            })
            .eq('id', reviewId)
            .eq('shop_id', shopId)
            .select()
            .single();

        if (error) {
            console.error('Error updating reply:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ review: updatedReview });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/reviews/[shopId]/[reviewId]/reply
 * Owner deletes their reply
 */
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { shopId, reviewId } = await params;
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

        // Verify user is the shop owner
        const { data: shop } = await supabase
            .from('shops')
            .select('owner_id')
            .eq('id', shopId)
            .single() as { data: any };

        if (!shop || shop.owner_id !== profile.id) {
            return NextResponse.json({ error: 'Only shop owner can delete replies' }, { status: 403 });
        }

        // Remove reply (set to null)
        const { data: updatedReview, error } = await supabase
            .from('reviews')
            .update({
                owner_reply: null,
                reply_at: null
            })
            .eq('id', reviewId)
            .eq('shop_id', shopId)
            .select()
            .single();

        if (error) {
            console.error('Error deleting reply:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ review: updatedReview });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
