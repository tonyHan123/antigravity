import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/shops/[id]
 * Update shop status, commission rate (Admin only)
 */
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        // Check if admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('email', session.user.email)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        // Admin can update these fields
        if (body.status !== undefined) updateData.status = body.status;
        if (body.commissionRate !== undefined) updateData.commission_rate = body.commissionRate;

        const { data: shop, error } = await supabase
            .from('shops')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating shop:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ shop });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
