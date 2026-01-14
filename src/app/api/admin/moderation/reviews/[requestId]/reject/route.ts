import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

interface Params {
    params: Promise<{ requestId: string }>;
}

/**
 * POST /api/admin/moderation/reviews/[requestId]/reject
 * Reject deletion request -> Mark status as rejected
 */
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { requestId } = await params;
        const supabase = createServerClient();

        // Update status to rejected
        const { error } = await supabase
            .from('review_moderation_requests' as any)
            .update({ status: 'rejected' })
            .eq('id', requestId);

        if (error) {
            console.error('Error rejecting request:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
