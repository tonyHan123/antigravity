import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/admin/announcements - Get all announcements
export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient();
        const { searchParams } = new URL(request.url);
        const targetType = searchParams.get('target_type');

        let query = supabase
            .from('admin_announcements')
            .select(`
                *,
                created_by_profile:profiles!created_by(name, email)
            `)
            .order('created_at', { ascending: false });

        if (targetType) {
            query = query.eq('target_type', targetType);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching announcements:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/admin/announcements - Create announcement and send notifications
export async function POST(request: NextRequest) {
    try {
        const supabase = createServerClient();
        const body = await request.json();

        const { title, message, image_url, target_type, target_category, target_shop_id, created_by } = body;

        // Validate required fields
        if (!title || !message || !target_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create announcement
        const { data: announcement, error: announcementError } = await supabase
            .from('admin_announcements')
            .insert({
                title,
                message,
                image_url,
                target_type,
                target_category: target_type === 'category' ? target_category : null,
                target_shop_id: target_type === 'shop' ? target_shop_id : null,
                created_by
            })
            .select()
            .single();

        if (announcementError) throw announcementError;

        // 2. Get target users based on target_type
        let targetUsers: { id: string }[] = [];

        if (target_type === 'all_users') {
            const { data } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'user');
            targetUsers = data || [];
        } else if (target_type === 'all_owners') {
            const { data } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'owner');
            targetUsers = data || [];
        } else if (target_type === 'category' && target_category) {
            // Get owners of shops in this category
            const { data: shops } = await supabase
                .from('shops')
                .select('owner_id')
                .eq('category', target_category);
            targetUsers = (shops || []).map(s => ({ id: s.owner_id }));
        } else if (target_type === 'shop' && target_shop_id) {
            // Get owner of specific shop
            const { data: shop } = await supabase
                .from('shops')
                .select('owner_id')
                .eq('id', target_shop_id)
                .single();
            if (shop) targetUsers = [{ id: shop.owner_id }];
        }

        // 3. Create notifications for all target users
        if (targetUsers.length > 0) {
            const notifications = targetUsers.map(user => ({
                user_id: user.id,
                type: 'announcement',
                title,
                message,
                image_url,
                announcement_id: announcement.id,
                sender_name: 'Admin',
                is_read: false
            }));

            const { error: notifError } = await supabase
                .from('notifications')
                .insert(notifications);

            if (notifError) {
                console.error('Error creating notifications:', notifError);
            }
        }

        return NextResponse.json({
            ...announcement,
            notifications_sent: targetUsers.length
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating announcement:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
