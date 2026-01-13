
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Demo Users Configuration
const DEMO_USERS = [
    { email: 'user@example.com', role: 'user', name: 'Demo User', id: '11111111-1111-1111-1111-111111111111' },
    { email: 'owner@shop1.com', role: 'owner', name: 'Jenny Owner', id: '22222222-2222-2222-2222-222222222222' },
    { email: 'admin@example.com', role: 'admin', name: 'Super Admin', id: '33333333-3333-3333-3333-333333333333' }
];

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient();
        const results = [];

        for (const u of DEMO_USERS) {
            // Check existing
            let { data: existing } = await supabase.from('profiles').select('*').eq('email', u.email).single();

            if (!existing) {
                // Create
                const { data: created, error } = await supabase.from('profiles').insert({
                    id: u.id, // Try to specific ID, might fail if ID taken by non-email match, but randomUUID fallback handled if needed
                    email: u.email,
                    role: u.role,
                    name: u.name
                }).select().single();

                if (error) {
                    // Fallback to random ID if collision (though unlikely for empty DB)
                    // Or maybe ID is taken by another email?
                    results.push({ email: u.email, status: 'error', error: error.message });
                } else {
                    results.push({ email: u.email, status: 'created', role: u.role });
                }
            } else {
                // Update role just in case
                if (existing.role !== u.role) {
                    await supabase.from('profiles').update({ role: u.role }).eq('id', existing.id);
                    results.push({ email: u.email, status: 'updated_role', from: existing.role, to: u.role });
                } else {
                    results.push({ email: u.email, status: 'exists_ok' });
                }
            }
        }

        // Also ensure owner@shop1.com owns the specific shop
        // Re-using logic from fix-owner
        const shopId = 'dfee852d-8b82-4228-b1d4-f655848d5d1f';
        const { data: shop } = await supabase.from('shops').select('id, owner_id').eq('id', shopId).single();
        const ownerProfile = await supabase.from('profiles').select('id').eq('email', 'owner@shop1.com').single();

        let shopStatus = 'ok';
        if (shop && ownerProfile.data && shop.owner_id !== ownerProfile.data.id) {
            await supabase.from('shops').update({ owner_id: ownerProfile.data.id }).eq('id', shopId);
            shopStatus = 'fixed_ownership';
        }

        return NextResponse.json({ users: results, shopStatus });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
