
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/auth';
import { getOrCreateProfile } from '@/lib/profile-helper';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ shopId: string }> }
) {
    try {
        const params = await props.params;
        const { shopId } = params;
        const supabase = createServerClient();
        const { data: services, error } = await supabase
            .from('services')
            .select('*')
            .eq('shop_id', shopId);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(services);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ shopId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const params = await props.params;
        const { shopId } = params;
        const body = await request.json();
        const { name, durationMin, price } = body;

        const supabase = createServerClient();

        // Verify shop ownership
        // We use 'let' so we can recover if profile is missing
        let { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        if (!profile) {
            console.log(`Profile missing for ${session.user.email}, creating via UPSERT...`);

            // Use consistent ID for demo owner to match seeded shop data
            const newId = session.user.email === 'owner@shop1.com'
                ? '22222222-2222-2222-2222-222222222222'
                : crypto.randomUUID();

            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .upsert({
                    id: newId,
                    email: session.user.email,
                    role: 'owner', // Default to owner/business
                    name: session.user.name || 'New User'
                })
                .select()
                .single();

            if (createError) {
                console.error('Failed to upsert profile:', createError);
                return NextResponse.json({
                    error: `Failed to create profile: ${createError.message}`
                }, { status: 500 });
            }
            profile = newProfile;
        }

        const { data: shop } = await supabase
            .from('shops')
            .select('id, owner_id')
            .eq('id', shopId)
            .single();

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        }

        if (shop.owner_id !== profile.id) {
            console.error('--- DEBUG: Ownership Mismatch ---');
            console.error(`Session Email: ${session.user.email}`);
            console.error(`Profile ID: ${profile.id}`);
            console.error(`Shop ID: ${shopId}`);
            console.error(`Shop Owner ID: ${shop.owner_id}`);
            console.error('---------------------------------');
            return NextResponse.json({
                error: `Ownership mismatch. ShopOwner: ${shop.owner_id}, You: ${profile.id}`
            }, { status: 403 });
        }

        const { data: service, error } = await supabase
            .from('services')
            .insert({
                shop_id: shopId,
                name,
                duration_min: durationMin,
                price
            })
            .select()
            .single();

        if (error) {
            console.error('Service insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(service);

    } catch (e: any) {
        console.error('API Error:', e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/services/[shopId]?serviceId=...
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ shopId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const params = await props.params;
        const { shopId } = params;
        const { searchParams } = new URL(request.url);
        const serviceId = searchParams.get('serviceId');

        if (!serviceId) {
            return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
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

        // 3. Delete Service
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', serviceId)
            .eq('shop_id', shopId); // Extra safety

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
