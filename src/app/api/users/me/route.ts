import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

/**
 * GET /api/users/me
 * Get current user's profile
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();

        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', session.user.email)
            .single();

        if (error) {
            // User might not have a profile yet
            if (error.code === 'PGRST116') {
                return NextResponse.json({
                    user: null,
                    needsProfile: true
                });
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
 * POST /api/users/me
 * Create or update current user's profile
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServerClient();
        const body = await request.json();

        // Try to upsert profile
        const { data: user, error } = await supabase
            .from('profiles')
            .upsert({
                email: session.user.email,
                name: body.name || session.user.name,
                phone: body.phone || null,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'email'
            })
            .select()
            .single();

        if (error) {
            console.error('Error upserting profile:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

