
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';
import { getOrCreateProfile } from '@/lib/profile-helper';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');

    if (!shopId) {
        return NextResponse.json({ error: 'Shop ID required' }, { status: 400 });
    }

    try {
        const supabase = createServerClient();
        const { data: coupons, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('shop_id', shopId);

        if (error) throw error;
        return NextResponse.json(coupons);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const supabase = createServerClient();

        // Verify shop ownership
        let { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        if (!profile) {
            console.log(`Profile missing for ${session.user.email}, creating via UPSERT...`);

            // Use consistent ID for demo owner
            const newId = session.user.email === 'owner@shop1.com'
                ? '22222222-2222-2222-2222-222222222222'
                : crypto.randomUUID();

            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .upsert({
                    id: newId,
                    email: session.user.email,
                    role: 'owner',
                    name: session.user.name || 'New User'
                })
                .select()
                .single();

            if (createError) {
                return NextResponse.json({ error: 'Profile error: ' + createError.message }, { status: 500 });
            }
            profile = newProfile;
        }

        const { data: shop } = await supabase
            .from('shops')
            .select('id, owner_id')
            .eq('id', body.shopId) // Ensure frontend sends shopId
            .single();

        if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

        if (shop.owner_id !== profile.id) {
            return NextResponse.json({ error: 'Ownership mismatch' }, { status: 403 });
        }

        const { data: coupon, error } = await supabase
            .from('coupons')
            .insert({
                shop_id: body.shopId,
                code: body.code,
                discount_type: body.discountType,
                discount_value: body.discountValue,
                min_purchase: body.minPurchase,
                valid_until: body.validUntil,
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(coupon);

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/coupons?id=...&shopId=...
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const couponId = searchParams.get('id');
        const shopId = searchParams.get('shopId');

        if (!couponId || !shopId) {
            return NextResponse.json({ error: 'Coupon ID and Shop ID required' }, { status: 400 });
        }

        const supabase = createServerClient();

        // 1. Get/Create Profile (Handles self-healing for demo owner)
        const profile = await getOrCreateProfile(supabase, session.user.email, session.user.name || undefined);

        if (!profile) return NextResponse.json({ error: 'Profile not found or could not be created' }, { status: 404 });

        // 2. Verify Shop Ownership
        const { data: shop } = await supabase
            .from('shops')
            .select('id, owner_id')
            .eq('id', shopId)
            .single();

        if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        if (shop.owner_id !== profile.id) {
            return NextResponse.json({ error: 'Ownership mismatch' }, { status: 403 });
        }

        // 3. Delete Coupon
        const { error } = await supabase
            .from('coupons')
            .delete()
            .eq('id', couponId)
            .eq('shop_id', shopId); // Extra safety

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
