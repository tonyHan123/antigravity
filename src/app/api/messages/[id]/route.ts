import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/messages/[id]
 * Mark message as read
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
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Only receiver can mark as read
        const { data: message, error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', id)
            .eq('receiver_id', profile.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating message:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
