import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';
import { getOrCreateProfile } from '@/lib/profile-helper';

/**
 * GET /api/notifications
 * Get user's notifications
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        // Get or create user profile
        const profile = await getOrCreateProfile(supabase, session.user.email, session.user.name || undefined);

        if (!profile) {
            return NextResponse.json({ notifications: [] });
        }

        // Get notifications
        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching notifications:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Count unread
        const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/notifications
 * Create a notification (for internal use / owner cancellation)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();
        const body = await request.json();

        // Validate required fields
        if (!body.userId || !body.title || !body.message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create notification
        const { data: notification, error } = await supabase
            .from('notifications')
            .insert({
                user_id: body.userId,
                type: body.type || 'booking_cancelled',
                title: body.title,
                message: body.message,
                booking_id: body.bookingId || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating notification:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ notification }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
