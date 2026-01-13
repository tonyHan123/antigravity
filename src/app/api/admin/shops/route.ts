import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

/**
 * GET /api/admin/shops
 * List all shops (Admin only)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const supabase = createServerClient();
        const { data: shops, error } = await supabase
            .from('shops')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ shops });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/admin/shops
 * Create a new shop
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const supabase = createServerClient();

        // 1. Create Shop
        const { data: shop, error } = await supabase
            .from('shops')
            .insert({
                name: body.name, // JSONB
                category: body.category,
                region: body.region, // JSONB
                address: body.address, // JSONB
                description: body.description, // JSONB
                contact_phone: body.contact_phone,
                business_number: body.business_number,
                representative_name: body.representative_name,
                business_license_url: body.business_license_url,
                bank_name: body.bank_name,
                bank_account: body.bank_account,
                bank_holder: body.bank_holder,
                image_url: body.image_url,
                owner_id: body.owner_id || session.user.id, // Assign to admin if not specified, or invite?
                // For MVP, we might create a placeholder owner or just leave it for later assignment
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ shop }, { status: 201 });
    } catch (error: any) {
        console.error('Create shop error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
