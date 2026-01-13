import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';
import { getOrCreateProfile } from '@/lib/profile-helper';

interface Params {
    params: Promise<{ shopId: string }>;
}

/**
 * POST /api/wishlists/[shopId]
 * Add shop to wishlist
 */
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { shopId } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        // Get or create user profile
        const profile = await getOrCreateProfile(supabase, session.user.email, session.user.name || undefined);

        if (!profile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        // Add to wishlist
        const { data, error } = await supabase
            .from('wishlists')
            .insert({
                user_id: profile.id,
                shop_id: shopId,
            })
            .select()
            .single();

        if (error) {
            // Handle duplicate
            if (error.code === '23505') {
                return NextResponse.json({ message: 'Already in wishlist' }, { status: 200 });
            }
            console.error('Error adding to wishlist:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ wishlist: data }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/wishlists/[shopId]
 * Remove shop from wishlist
 */
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { shopId } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        // Get or create user profile
        const profile = await getOrCreateProfile(supabase, session.user.email, session.user.name || undefined);

        if (!profile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        // Remove from wishlist
        const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', profile.id)
            .eq('shop_id', shopId);

        if (error) {
            console.error('Error removing from wishlist:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
