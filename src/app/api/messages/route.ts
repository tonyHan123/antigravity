import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

import { v5 as uuidv5 } from 'uuid';

// Helper to generate conversation_id matching DB logic
// Uses uuid_generate_v5(uuid_nil(), sorted_ids)
function generateConversationId(user1: string, user2: string): string {
    const sorted = [user1, user2].sort();
    const NIL_UUID = '00000000-0000-0000-0000-000000000000';
    return uuidv5(`${sorted[0]}-${sorted[1]}`, NIL_UUID);
}

/**
 * GET /api/messages
 * Get conversations or messages for current user
 * Query params:
 *   - view: 'conversations' (list) or 'messages' (specific conversation)
 *   - conversationId: required when view=messages
 *   - shopId: filter by shop
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
            .select('id, role')
            .eq('email', session.user.email)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const searchParams = request.nextUrl.searchParams;
        const view = searchParams.get('view') || 'conversations';
        const conversationId = searchParams.get('conversationId');
        const shopId = searchParams.get('shopId');

        if (view === 'conversations') {
            // Get unique conversations
            const { data: messages, error } = await supabase
                .from('messages')
                .select(`
                    conversation_id,
                    shop_id,
                    content,
                    created_at,
                    is_read,
                    sender_id,
                    receiver_id,
                    sender:profiles!sender_id(id, name, email, role),
                    receiver:profiles!receiver_id(id, name, email, role),
                    shop:shops!shop_id(id, name)
                `)
                .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Group by conversation_id
            const conversationsMap = new Map();
            for (const msg of messages || []) {
                if (!conversationsMap.has(msg.conversation_id)) {
                    const otherUser = msg.sender_id === profile.id ? msg.receiver : msg.sender;
                    const unreadCount = (messages || []).filter(
                        m => m.conversation_id === msg.conversation_id &&
                            m.receiver_id === profile.id &&
                            !m.is_read
                    ).length;

                    conversationsMap.set(msg.conversation_id, {
                        conversation_id: msg.conversation_id,
                        other_user: otherUser,
                        shop: msg.shop,
                        last_message: msg.content,
                        last_message_at: msg.created_at,
                        unread_count: unreadCount
                    });
                }
            }

            return NextResponse.json({ conversations: Array.from(conversationsMap.values()) });
        } else {
            // Get messages for specific conversation
            if (!conversationId) {
                return NextResponse.json({ error: 'conversationId required' }, { status: 400 });
            }

            const { data: messages, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:profiles!sender_id(id, name, email, role),
                    receiver:profiles!receiver_id(id, name, email, role)
                `)
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Mark messages as read
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('conversation_id', conversationId)
                .eq('receiver_id', profile.id);

            return NextResponse.json({ messages });
        }
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
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

        const { receiverId, shopId, content, imageUrl } = body;

        if (!receiverId || !content) {
            return NextResponse.json({ error: 'receiverId and content required' }, { status: 400 });
        }

        const conversationId = generateConversationId(sender.id, receiverId);

        const { data: message, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: sender.id,
                receiver_id: receiverId,
                shop_id: shopId || null,
                content,
                image_url: imageUrl || null
            })
            .select(`
                *,
                sender:profiles!sender_id(id, name, email, role),
                receiver:profiles!receiver_id(id, name, email, role)
            `)
            .single();

        if (error) {
            console.error('Error sending message:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message }, { status: 201 });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
