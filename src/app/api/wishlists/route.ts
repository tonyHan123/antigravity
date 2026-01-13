import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';
import { getOrCreateProfile } from '@/lib/profile-helper';

/**
 * GET /api/wishlists
 * Get user's wishlist
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
            return NextResponse.json({ shopIds: [], wishlists: [] });
        }

        // Get wishlist with shop details
        const { data: wishlists, error } = await supabase
            .from('wishlists')
            .select(`
        *,
        shops:shop_id (
          id, name, category, region, image_url, rating, review_count
        )
      `)
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching wishlists:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Extract shop IDs for easier frontend usage
        const shopIds = wishlists?.map(w => w.shop_id) || [];

        return NextResponse.json({ wishlists, shopIds });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
