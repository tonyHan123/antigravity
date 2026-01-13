import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/shops/[id]
 * Fetch a single shop by ID with services, coupons, and reviews
 */
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const supabase = createServerClient();

        // Fetch shop with related data
        const { data: shop, error } = await supabase
            .from('shops')
            .select(`
        *,
        services (*),
        coupons (
          *
        ),
        reviews (
          *,
          profiles:user_id (name, email)
        )
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
            }
            console.error('Error fetching shop:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ shop });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/shops/[id]
 * Update a shop (owner only)
 */
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const supabase = createServerClient();
        const body = await request.json();

        const { data: shop, error } = await supabase
            .from('shops')
            .update({
                ...body,
                updated_at: new Date().toISOString(),
            })
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
