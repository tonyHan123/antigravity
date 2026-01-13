
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOwner() {
    console.log('--- Checking Owner Data ---');

    // 1. Get Profile for owner@shop1.com
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'owner@shop1.com')
        .single();

    if (profileError) {
        console.error('Profile Error:', profileError);
    } else {
        console.log('Profile found:', profile);
    }

    // 2. Get Shop
    const shopId = 'dfee852d-8b82-4228-b1d4-f655848d5d1f';
    const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();

    if (shopError) {
        console.error('Shop Error:', shopError);
    } else {
        console.log('Shop found:', shop);
        if (profile && shop) {
            console.log('Match?', profile.id === shop.owner_id);
            if (profile.id !== shop.owner_id) {
                console.log(`MISMATCH: Profile ID (${profile.id}) != Shop Owner ID (${shop.owner_id})`);

                // Fix it
                console.log('Fixing owner_id...');
                const { error: updateError } = await supabase
                    .from('shops')
                    .update({ owner_id: profile.id })
                    .eq('id', shopId);

                if (updateError) console.error('Update failed:', updateError);
                else console.log('Update success! owner_id synced.');
            }
        }
    }
}

checkOwner();
