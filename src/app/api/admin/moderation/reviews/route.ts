import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/moderation/reviews
 * List all pending moderation requests
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        // 1. Fetch requests with related reviews and shops (FKs exist for these)
        // Do NOT join requester (profiles) because we removed that FK
        const { data: requests, error } = await supabase
            .from('review_moderation_requests' as any)
            .select(`
                *,
                reviews (
                    id, rating, content, created_at,
                    profiles:user_id (name, email)
                ),
                shops (
                    id, name
                )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching moderation requests:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 2. Extract unique requester IDs
        const requesterIds = Array.from(new Set(requests.map((r: any) => r.requester_id)));

        // 3. Fetch profiles manually if there are any
        let profilesMap: Record<string, { email: string }> = {};
        if (requesterIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, email')
                .in('id', requesterIds);

            if (profiles) {
                profiles.forEach(p => {
                    profilesMap[p.id] = { email: p.email };
                });
            }
        }

        // 4. Attach requester info to requests
        const enrichedRequests = requests.map((r: any) => ({
            ...r,
            requester: profilesMap[r.requester_id] || { email: 'Unknown' }
        }));

        return NextResponse.json({ requests: enrichedRequests });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
