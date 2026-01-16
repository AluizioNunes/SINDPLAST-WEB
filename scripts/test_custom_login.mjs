import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function readEnvValue(content, key) {
  const line = content
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith(`${key}=`));
  if (!line) return null;
  return line.slice(key.length + 1).trim();
}

async function main() {
  const projectRoot = process.cwd();
  const envPath = path.join(projectRoot, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');

  const url = readEnvValue(envContent, 'VITE_SUPABASE_URL');
  const anonKey = readEnvValue(envContent, 'VITE_SUPABASE_ANON_KEY');

  if (!url || !anonKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exitCode = 1;
    return;
  }

  const identifier = process.argv[2] || 'sindplast@itfact.com.br';
  const password = process.argv[3] || 'ITFACTsindplast';

  const supabase = createClient(url, anonKey, { db: { schema: 'SINDPLAST' } });

  const { data, error } = await supabase.schema('SINDPLAST').rpc('custom_login', {
    p_email: identifier,
    p_password: password,
  });

  if (error) {
    console.error(JSON.stringify(error, null, 2));
    process.exitCode = 2;
    return;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    console.log('No user returned (invalid credentials or missing password).');
    process.exitCode = 3;
    return;
  }

  console.log(
    JSON.stringify(
      {
        IdUsuarios: row.IdUsuarios,
        Nome: row.Nome,
        Usuario: row.Usuario,
        Email: row.Email,
      },
      null,
      2,
    ),
  );
}

try {
  await main();
  await new Promise((r) => setTimeout(r, 250));
} catch (e) {
  console.error(e);
  process.exitCode = 1;
  await new Promise((r) => setTimeout(r, 250));
}
