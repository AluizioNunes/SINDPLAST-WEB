
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) { process.env[k] = envConfig[k]; }

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { db: { schema: 'SINDPLAST' } }
);

async function sample() {
    console.log('--- Empresas Sample (Top 5) ---');
    const { data: e } = await supabase.from('Empresas').select('*').limit(5);
    console.log(JSON.stringify(e, null, 2));

    console.log('--- Dependentes Sample (Top 5) ---');
    const { data: d } = await supabase.from('Dependentes').select('*').limit(5);
    console.log(JSON.stringify(d, null, 2));
}

sample();
