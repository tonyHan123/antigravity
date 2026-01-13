import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

interface Params {
    params: Promise<{ shopId: string }>;
}

/**
 * GET /api/reviews/[shopId]
 * Get all reviews for a shop
 */
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { shopId } = await params;
        const supabase = createServerClient();

        const { data: reviews, error } = await supabase
            .from('reviews')
            .select(`
        *,
        profiles:user_id (name, email)
      `)
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ reviews });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/reviews/[shopId]
 * Create a review for a shop
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

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Create review
        const { data: review, error } = await supabase
            .from('reviews')
            .insert({
                user_id: profile.id,
                shop_id: shopId,
                booking_id: body.bookingId || null,
                rating: body.rating,
                content: body.content,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating review:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ review }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
