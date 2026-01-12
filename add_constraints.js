
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) { process.env[k] = envConfig[k]; }

// Use SERVICE ROLE key to have enough permissions
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function apply() {
    // We can't use rpc('execute_sql') if it doesn't exist.
    // But wait! If I can't run SQL, I'll use the manual check-and-upsert approach in sync_data.js.
    // Let's try one more time with a trick: create a temporary function.

    const sql = `
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_matricula') THEN
        ALTER TABLE "SINDPLAST"."Socios" ADD CONSTRAINT unique_matricula UNIQUE ("Matricula");
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_coddependente') THEN
        ALTER TABLE "SINDPLAST"."Dependentes" ADD CONSTRAINT unique_coddependente UNIQUE ("CodDependente");
      END IF;
    END $$;
  `;

    console.log('Tentando aplicar SQL via RPC...');
    const { error } = await supabase.rpc('execute_sql', { query: sql });
    if (error) {
        console.log('Falha ao aplicar SQL via RPC:', error.message);
        console.log('Mudando para estratégia de Upsert manual (verificar antes de inserir).');
    } else {
        console.log('UNIQUE constraints aplicadas com sucesso!');
    }
}

apply();
