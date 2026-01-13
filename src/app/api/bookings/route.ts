import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';
import { getOrCreateProfile } from '@/lib/profile-helper';

/**
 * GET /api/bookings
 * Fetch bookings for the current user
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        // Get or create user profile
        const profile = await getOrCreateProfile(supabase, session.user.email, session.user.name || undefined);

        if (!profile) {
            return NextResponse.json({ bookings: [] });
        }

        // Fetch bookings with related data
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
        *,
        shops:shop_id (id, name, image_url, category),
        services:service_id (id, name, price, duration_min)
      `)
            .eq('user_id', profile.id)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching bookings:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ bookings });
    } catch (error: any) {
        console.error('Unexpected error in GET /api/bookings:', error);
        return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
    }
}

/**
 * POST /api/bookings
 * Create a new booking
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        console.log('Session:', session?.user?.email);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized - Please login first' }, { status: 401 });
        }

        const supabase = createServerClient();
        const body = await request.json();
        console.log('Booking request body:', body);

        // Get or create user profile
        let profile;
        try {
            profile = await getOrCreateProfile(supabase, session.user.email, session.user.name || undefined);
        } catch (profileError) {
            console.error('Profile error:', profileError);
            return NextResponse.json({ error: 'Failed to get/create user profile' }, { status: 500 });
        }

        if (!profile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        console.log('User profile:', profile);

        // Create booking
        const bookingData = {
            user_id: profile.id,
            shop_id: body.shopId,
            service_id: body.serviceId,
            date: body.date,
            time: body.time,
            total_price: body.totalPrice,
            coupon_id: body.couponId || null,
            discount_amount: body.discountAmount || 0,
            status: 'confirmed', // Auto-confirmed on creation
        };
        console.log('Creating booking with data:', bookingData);

        const { data: booking, error } = await supabase
            .from('bookings')
            .insert(bookingData)
            .select()
            .single();

        if (error) {
            console.error('Error creating booking:', error);
            return NextResponse.json({ error: `Booking failed: ${error.message}` }, { status: 500 });
        }

        console.log('Booking created:', booking);
        return NextResponse.json({ booking }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error in POST /api/bookings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
