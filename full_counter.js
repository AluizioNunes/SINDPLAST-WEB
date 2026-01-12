
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { db: { schema: 'SINDPLAST' } }
);

function countInJson(filePath, regex) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const matches = content.match(regex);
        return matches ? matches.length : 0;
    } catch (e) {
        return 'Error: ' + e.message;
    }
}

async function getSupabaseCount(table) {
    const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
    return error ? 'Error: ' + error.message : count;
}

async function run() {
    const results = {
        Socios: {
            dataSource: countInJson('d:/PROJETOS/Sindplast WEB/DataSource/Socios.json', /"SMAT"\s*:/g),
            legado: countInJson('d:/PROJETOS/Sindplast WEB/SISTEMA LEGADO/Backend/Data/Socios.json', /"SMAT"\s*:/g),
            supabase: await getSupabaseCount('Socios')
        },
        Empresas: {
            dataSource: countInJson('d:/PROJETOS/Sindplast WEB/DataSource/Empresas.json', /"ECODIG"\s*:/g),
            legado: countInJson('d:/PROJETOS/Sindplast WEB/SISTEMA LEGADO/Backend/Data/Empresas.json', /"ECODIG"\s*:/g),
            supabase: await getSupabaseCount('Empresas')
        },
        Dependentes: {
            dataSource: countInJson('d:/PROJETOS/Sindplast WEB/DataSource/Dependentes.json', /"Código"\s*:/g),
            legado: countInJson('d:/PROJETOS/Sindplast WEB/SISTEMA LEGADO/Backend/Data/DependentesFinal.json', /"CodDependente"\s*:/g),
            supabase: await getSupabaseCount('Dependentes')
        }
    };

    console.log('RESULTS_START');
    console.log(JSON.stringify(results, null, 2));
    console.log('RESULTS_END');
}

run();
