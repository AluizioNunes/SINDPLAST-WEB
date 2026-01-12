
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

async function debug() {
    const { data: s } = await supabase.from('Socios').select('Matricula').limit(5);
    const { data: e } = await supabase.from('Empresas').select('IdEmpresa').limit(5);
    const { data: d } = await supabase.from('Dependentes').select('CodDependente').limit(5);

    console.log('Socios Matricula Type:', typeof s[0].Matricula, s[0].Matricula);
    console.log('Empresas IdEmpresa Type:', typeof e[0].IdEmpresa, e[0].IdEmpresa);
    console.log('Dependentes CodDependente Type:', typeof d[0].CodDependente, d[0].CodDependente);
}

debug();
