
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function approveShop() {
    const { error } = await supabase
        .from('shops')
        .update({ status: 'approved' })
        .eq('id', 'dfee852d-8b82-4228-b1d4-f655848d5d1f');

    if (error) {
        console.error('Error updating shop:', error);
    } else {
        console.log('Shop dfee852d-8b82-4228-b1d4-f655848d5d1f approved successfully.');
    }
}

approveShop();
