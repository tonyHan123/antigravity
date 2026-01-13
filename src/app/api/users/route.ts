import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

/**
 * GET /api/users
 * Get all users (Admin only)
 */
export async function GET(request: NextRequest) {
    try {
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

        // Get query params for filtering
        const searchParams = request.nextUrl.searchParams;
        const role = searchParams.get('role');
        const search = searchParams.get('search');

        // Build query
        let query = supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (role && role !== 'all') {
            query = query.eq('role', role);
        }

        if (search) {
            query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
        }

        const { data: users, error } = await query;

        if (error) {
            console.error('Error fetching users:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

