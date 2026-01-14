import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

interface Params {
    params: Promise<{ requestId: string }>;
}

/**
 * POST /api/admin/moderation/reviews/[requestId]/approve
 * Approve deletion request -> Delete the review
 */
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { requestId } = await params;
        const supabase = createServerClient();

        // 1. Get the review_id from the request
        const { data: modRequest, error: fetchError } = await supabase
            .from('review_moderation_requests' as any)
            .select('review_id')
            .eq('id', requestId)
            .single();

        if (fetchError || !modRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        // 2. Delete the review
        // ON DELETE CASCADE ensures request is also deleted
        const { error: deleteError } = await supabase
            .from('reviews')
            .delete()
            .eq('id', modRequest.review_id);

        if (deleteError) {
            console.error('Error deleting review:', deleteError);
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
