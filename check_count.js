
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Environment variables not found');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCount() {
    const { count, error } = await supabase
        .from('Socios')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('SUPABASE_COUNT:', count);
    }
}

checkCount();
