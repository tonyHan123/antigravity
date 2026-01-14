import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

/**
 * GET /api/unread-counts
 * Returns unread message, notification, and new review counts for the current user
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        // Get user profile with last_reviews_seen_at
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, role, last_reviews_seen_at')
            .eq('email', session.user.email)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 1. Unread Messages count
        const { count: unreadMessages, error: msgError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', profile.id)
            .eq('is_read', false);

        if (msgError) throw msgError;

        // 2. Unread Notifications count (for non-admin users)
        let unreadNotifications = 0;
        if (profile.role !== 'admin') {
            const { count: notifCount, error: notifError } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id)
                .eq('is_read', false);

            if (notifError) throw notifError;
            unreadNotifications = notifCount || 0;
        }

        // 3. New Reviews count (for owners only)
        let newReviews = 0;
        if (profile.role === 'owner') {
            // Get shops owned by this user
            const { data: shops } = await supabase
                .from('shops')
                .select('id')
                .eq('owner_id', profile.id);

            if (shops && shops.length > 0) {
                const shopIds = shops.map(s => s.id);
                const lastSeen = profile.last_reviews_seen_at || new Date(0).toISOString();

                // Count reviews created after last seen
                const { count: reviewCount, error: reviewError } = await supabase
                    .from('reviews')
                    .select('*', { count: 'exact', head: true })
                    .in('shop_id', shopIds)
                    .gt('created_at', lastSeen);

                if (!reviewError) {
                    newReviews = reviewCount || 0;
                }
            }
        }

        return NextResponse.json({
            unreadMessages: unreadMessages || 0,
            unreadNotifications,
            newReviews,
            totalUnread: (unreadMessages || 0) + unreadNotifications
        });

    } catch (error: any) {
        console.error('Error fetching unread counts:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
