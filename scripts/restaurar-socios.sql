-- RESTAURAR SÓCIOS DO DATASOURCE (MÉTODO SIMPLES)
-- Execute no SQL Editor do Supabase

-- 1) Limpar tabela atual
TRUNCATE TABLE "SINDPLAST"."Socios" RESTART IDENTITY;

-- 2) Inserir dados manualmente (método alternativo se pg_read_file não funcionar)
INSERT INTO "SINDPLAST"."Socios" (
    "Matricula", "Nome", "RG", "Emissor", "CPF", "Nascimento", 
    "Sexo", "CodEmpresa", "RazaoSocial", "DataCadastro", "Cadastrante"
)
VALUES 
-- Primeiros registros de exemplo - você precisará adicionar todos os 8.792 registros
('84', 'ELIDIO COSTA  DE SOUZA', NULL, NULL, NULL, '1993-04-22', NULL, NULL, NULL, NOW(), 'Sincronização Automática'),
('1686', 'ADELAIDE LIMA DE OLIVEIRA', NULL, NULL, NULL, '1959-09-22', NULL, NULL, NULL, NOW(), 'Sincronização Automática');

-- 3) Verificar resultado
SELECT COUNT(*) as total_socios FROM "SINDPLAST"."Socios";

-- 4) Se precisar inserir em lote maior, use este script Node.js:
/*
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sociosData = JSON.parse(fs.readFileSync('DataSource/Socios.json', 'utf8'));

async function insertSocios() {
  for (const socio of sociosData.Socio) {
    await supabase.from('Socios').insert({
      Matricula: String(socio.SMAT),
      Nome: socio.SNOME,
      RG: socio.SRG || null,
      Emissor: socio.SEMISSOR || null,
      CPF: socio.SCPF || null,
      Nascimento: socio.SDTNASC || null,
      Sexo: socio.SSEXO || null,
      CodEmpresa: socio.ECODIG ? String(socio.ECODIG) : null,
      RazaoSocial: socio.ENOME || null,
      DataCadastro: new Date().toISOString(),
      Cadastrante: 'Sincronização Automática'
    });
  }
  console.log('Inseridos', sociosData.Socio.length, 'sócios');
}

insertSocios().catch(console.error);
*/
