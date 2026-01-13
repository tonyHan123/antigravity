import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';
import { getOrCreateProfile } from '@/lib/profile-helper';

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/notifications/[id]
 * Mark notification as read
 */
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        // Get user profile
        const profile = await getOrCreateProfile(supabase, session.user.email, session.user.name || undefined);

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Mark as read
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .eq('user_id', profile.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating notification:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ notification: data });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/notifications/[id]
 * Delete notification
 */
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        // Get user profile
        const profile = await getOrCreateProfile(supabase, session.user.email, session.user.name || undefined);

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete notification
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id)
            .eq('user_id', profile.id);

        if (error) {
            console.error('Error deleting notification:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
