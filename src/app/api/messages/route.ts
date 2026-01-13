import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

/**
 * GET /api/messages
 * Get messages for current user
 */
export async function GET(request: NextRequest) {
    try {
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

        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type') || 'received'; // 'received' or 'sent'

        let query = supabase
            .from('messages')
            .select(`
        *,
        sender:sender_id (id, name, email, role),
        receiver:receiver_id (id, name, email, role),
        shops:shop_id (id, name)
      `)
            .order('created_at', { ascending: false });

        if (type === 'received') {
            query = query.eq('receiver_id', profile.id);
        } else {
            query = query.eq('sender_id', profile.id);
        }

        const { data: messages, error } = await query;

        if (error) {
            console.error('Error fetching messages:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/messages
 * Send a new message
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();
        const body = await request.json();

        // Get sender profile
        const { data: sender } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        if (!sender) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { data: message, error } = await supabase
            .from('messages')
            .insert({
                sender_id: sender.id,
                receiver_id: body.receiverId,
                shop_id: body.shopId || null,
                subject: body.subject || null,
                content: body.content,
            })
            .select()
            .single();

        if (error) {
            console.error('Error sending message:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

