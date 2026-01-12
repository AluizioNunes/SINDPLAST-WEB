
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

async function check() {
    console.log('--- Inspecting Socios ---');
    const { data: sData, error: sErr } = await supabase.from('Socios').select('*').limit(1);
    if (sErr) console.log('Socios Error:', sErr.message);
    else console.log('Socios Columns:', Object.keys(sData[0]));

    console.log('--- Inspecting Dependentes ---');
    const { data: dData, error: dErr } = await supabase.from('Dependentes').select('*').limit(1);
    if (dErr) console.log('Dependentes Error:', dErr.message);
    else console.log('Dependentes Columns:', Object.keys(dData[0]));
}

check();
