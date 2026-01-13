
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
    // There isn't a direct way to query information_schema via JS client easily without rpc
    // But we can just try to select 'images' from shops and see if it errors
    const { data, error } = await supabase
        .from('shops')
        .select('images')
        .limit(1);

    if (error) {
        console.error('Error selecting images:', error.message);
    } else {
        console.log('Images column exists. Data example:', data);
    }
}

checkColumns();
