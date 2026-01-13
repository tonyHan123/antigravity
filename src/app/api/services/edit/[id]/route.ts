import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/services/edit/[id]
 * Update a service
 */
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();
        const body = await request.json();

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        // Verify ownership through service -> shop -> owner
        const { data: service } = await supabase
            .from('services')
            .select('shop_id, shops!inner(owner_id)')
            .eq('id', id)
            .single();

        if (!service || (service.shops as { owner_id: string }).owner_id !== profile?.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const updateData: Record<string, unknown> = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.durationMin !== undefined) updateData.duration_min = body.durationMin;
        if (body.price !== undefined) updateData.price = body.price;

        const { data: updated, error } = await supabase
            .from('services')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating service:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ service: updated });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/services/edit/[id]
 * Delete a service
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
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        // Verify ownership
        const { data: service } = await supabase
            .from('services')
            .select('shop_id, shops!inner(owner_id)')
            .eq('id', id)
            .single();

        if (!service || (service.shops as { owner_id: string }).owner_id !== profile?.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting service:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
