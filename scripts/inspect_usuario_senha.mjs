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

const projectRoot = process.cwd();
const envPath = path.join(projectRoot, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const url = readEnvValue(envContent, 'VITE_SUPABASE_URL');
const anonKey = readEnvValue(envContent, 'VITE_SUPABASE_ANON_KEY');

if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exitCode = 1;
} else {
  const email = process.argv[2] || 'sindplast@itfact.com.br';
  const supabase = createClient(url, anonKey, { db: { schema: 'SINDPLAST' } });

  const { data, error } = await supabase
    .from('Usuarios')
    .select('IdUsuarios, Email, Usuario, Nome, Senha')
    .ilike('Email', email)
    .maybeSingle();

  if (error) {
    console.error(JSON.stringify(error, null, 2));
    process.exitCode = 2;
  } else if (!data) {
    console.log('User not found.');
    process.exitCode = 3;
  } else {
    const senha = typeof data.Senha === 'string' ? data.Senha : '';
    const trimmed = senha.trim();
    console.log(
      JSON.stringify(
        {
          IdUsuarios: data.IdUsuarios,
          Email: data.Email,
          Usuario: data.Usuario,
          Nome: data.Nome,
          senhaVazia: trimmed.length === 0,
          senhaBcrypt: trimmed.startsWith('$2'),
          senhaLen: trimmed.length,
        },
        null,
        2,
      ),
    );
  }
}

await new Promise((r) => setTimeout(r, 250));

