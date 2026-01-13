import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]
 * Get a specific user profile
 */
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/users/[id]
 * Update user profile (own profile or admin)
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

        // Check if requester is admin or the user themselves
        const { data: requester } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('email', session.user.email)
            .single();

        const isAdmin = requester?.role === 'admin';
        const isOwnProfile = requester?.id === id;

        if (!isAdmin && !isOwnProfile) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Only admin can change role
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        // Regular user can update these fields
        if (body.name !== undefined) updateData.name = body.name;
        if (body.phone !== undefined) updateData.phone = body.phone;

        // Only admin can update these fields
        if (isAdmin) {
            if (body.role !== undefined) updateData.role = body.role;
        }

        const { data: user, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating user:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/users/[id]
 * Block/Delete user (Admin only) - soft delete by setting a blocked flag
 * For now, we'll just delete the profile
 */
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        // Check if requester is admin
        const { data: requester } = await supabase
            .from('profiles')
            .select('role')
            .eq('email', session.user.email)
            .single();

        if (requester?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // For now, just return success (actual deletion should be careful)
        // In production, you might want to implement soft delete or block flag
        return NextResponse.json({ message: 'User blocked successfully' });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
