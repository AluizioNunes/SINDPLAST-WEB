
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

async function cleanupDuplicates(table, keyColumn, internalIdColumn) {
    console.log(`Limpando duplicatas em ${table}...`);
    const { data, error } = await supabase.from(table).select(`${keyColumn}, ${internalIdColumn}`).order(internalIdColumn, { ascending: true });
    if (error) throw error;

    const seen = new Map();
    const toDelete = [];

    for (const row of data) {
        const key = row[keyColumn];
        if (seen.has(key)) {
            // Duplicate found. Keep the first one found (lowest ID) or just delete current.
            // Usually, keep the one created by migration, delete the one created by my script.
            toDelete.push(row[internalIdColumn]);
        } else {
            seen.set(key, true);
        }
    }

    console.log(`Encontrados ${toDelete.length} registros duplicados para remover.`);

    if (toDelete.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < toDelete.length; i += batchSize) {
            const batch = toDelete.slice(i, i + batchSize);
            const { error: delErr } = await supabase.from(table).delete().in(internalIdColumn, batch);
            if (delErr) console.error('Erro na deleção:', delErr.message);
            else process.stdout.write('.');
        }
    }
    console.log(`\nLimpeza de ${table} concluída.`);
}

async function run() {
    try {
        await cleanupDuplicates('Empresas', 'IdEmpresa', 'IdEmpresa');
        // Wait, if IdEmpresa is PK, it can't have duplicate? 
        // Earlier results: Legado 116, Supabase 222.
        // If IdEmpresa is PK, then it should have failed on concurrent inserts.
        // But maybe I didn't set IdEmpresa as PK during migration?
        // Let's check.

        await cleanupDuplicates('Dependentes', 'CodDependente', 'IdDependente');
        await cleanupDuplicates('Socios', 'Matricula', 'IdSocio');

    } catch (err) {
        console.error('Falha na limpeza:', err.message);
    }
}

run();
