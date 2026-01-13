
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient();
        const FIXED_OWNER_ID = '22222222-2222-2222-2222-222222222222';
        const SHOP_ID = 'dfee852d-8b82-4228-b1d4-f655848d5d1f';

        // 1. Upsert Profile with FIXED ID
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: FIXED_OWNER_ID,
                email: 'owner@shop1.com',
                role: 'owner',
                name: 'Jenny Owner'
            })
            .select()
            .single();

        if (profileError) {
            return NextResponse.json({ error: 'Failed to fix profile: ' + profileError.message });
        }

        // 2. Fix Shop Ownership
        const { data: shop, error: shopError } = await supabase
            .from('shops')
            .update({ owner_id: FIXED_OWNER_ID })
            .eq('id', SHOP_ID)
            .select()
            .single();

        if (shopError) {
            return NextResponse.json({ error: 'Failed to fix shop: ' + shopError.message });
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully aligned Owner ID and Shop Ownership',
            profileId: profile.id,
            shopOwnerId: shop.owner_id,
            match: profile.id === shop.owner_id
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
