
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) { process.env[k] = envConfig[k]; }

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
    const sql = `
    SELECT
        tc.table_name, 
        kcu.column_name, 
        tc.constraint_type
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'SINDPLAST' 
      AND tc.table_name IN ('Socios', 'Dependentes', 'Empresas');
  `;

    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
    if (error) {
        // If RPC not available, try a direct query via a temporary function if possible, 
        // or just assume IdSocio and IdDependente are PKs.
        console.log('RPC Error (execute_sql might not exist):', error.message);
    } else {
        console.log('CONSTRAINTS:', JSON.stringify(data, null, 2));
    }
}

inspect();
