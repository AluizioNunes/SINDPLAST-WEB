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
const serviceRoleKey = readEnvValue(envContent, 'SUPABASE_SERVICE_ROLE_KEY');

if (!url || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exitCode = 1;
} else {
  const email = process.argv[2] || 'sindplast@itfact.com.br';
  const newPassword = process.argv[3] || 'ITFACTsindplast';

  const supabase = createClient(url, serviceRoleKey, { db: { schema: 'SINDPLAST' } });

  const { error: updateError } = await supabase
    .from('Usuarios')
    .update({ Senha: newPassword })
    .ilike('Email', email);

  if (updateError) {
    console.error(JSON.stringify(updateError, null, 2));
    process.exitCode = 2;
  } else {
    const { data: after, error: fetchError } = await supabase
      .from('Usuarios')
      .select('IdUsuarios, Email, Usuario, Nome, Senha')
      .ilike('Email', email)
      .maybeSingle();

    if (fetchError) {
      console.error(JSON.stringify(fetchError, null, 2));
      process.exitCode = 3;
    } else if (!after) {
      console.log('User not found after update.');
      process.exitCode = 4;
    } else {
      const senha = typeof after.Senha === 'string' ? after.Senha.trim() : '';
      console.log(
        JSON.stringify(
          {
            IdUsuarios: after.IdUsuarios,
            Email: after.Email,
            Usuario: after.Usuario,
            Nome: after.Nome,
            senhaBcrypt: senha.startsWith('$2'),
            senhaLen: senha.length,
          },
          null,
          2,
        ),
      );
      if (!senha.startsWith('$2')) {
        console.error('Senha não foi criptografada (trigger ausente?).');
        process.exitCode = 5;
      }
    }
  }
}

await new Promise((r) => setTimeout(r, 250));

