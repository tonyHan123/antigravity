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
 * 
 * Requirements:
 * - Must have a completed booking (confirmed status + service time passed)
 * - Cannot review the same booking twice
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
        const { bookingId, rating, content } = body;

        // 1. Validate required fields
        if (!bookingId) {
            return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
        }
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }
        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: 'Review content is required' }, { status: 400 });
        }

        // 2. Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 3. Validate booking exists, belongs to user, and is for this shop
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*, services(duration_min)')
            .eq('id', bookingId)
            .eq('user_id', profile.id)
            .eq('shop_id', shopId)
            .single();

        if (bookingError || !booking) {
            return NextResponse.json({ error: 'Booking not found or does not belong to you' }, { status: 404 });
        }

        // 4. Check booking status is confirmed
        if (booking.status !== 'confirmed' && booking.status !== 'completed') {
            return NextResponse.json({ error: 'Can only review confirmed/completed bookings' }, { status: 400 });
        }

        // 5. Check service time has passed (booking time + duration < now)
        const now = new Date();
        const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
        const durationMin = (booking.services as any)?.duration_min || 30;
        const serviceEndTime = new Date(bookingDateTime.getTime() + durationMin * 60 * 1000);

        if (now < serviceEndTime) {
            return NextResponse.json({
                error: 'Cannot review before service is completed',
                serviceEndTime: serviceEndTime.toISOString()
            }, { status: 400 });
        }

        // 6. Check if review already exists for this booking
        const { data: existingReview } = await supabase
            .from('reviews')
            .select('id')
            .eq('booking_id', bookingId)
            .single();

        if (existingReview) {
            return NextResponse.json({ error: 'You have already reviewed this booking' }, { status: 400 });
        }

        // 7. Create the review
        const { data: review, error } = await supabase
            .from('reviews')
            .insert({
                user_id: profile.id,
                shop_id: shopId,
                booking_id: bookingId,
                rating: rating,
                content: content.trim(),
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

