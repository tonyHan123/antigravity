
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkShops() {
    const { data, error } = await supabase
        .from('shops')
        .select('id, name, category, status, region');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Shops in DB:', JSON.stringify(data, null, 2));
    }
}

checkShops();
