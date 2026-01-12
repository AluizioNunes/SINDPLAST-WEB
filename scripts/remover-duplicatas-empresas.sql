-- SQL PARA REMOVER DUPLICATOS DA TABELA EMPRESAS
-- Execute no SQL Editor do Supabase

-- 1) Verificar duplicatas por CodEmpresa
SELECT 
    "CodEmpresa", 
    COUNT(*) as qtd_duplicatas,
    ARRAY_AGG("IdEmpresa" ORDER BY "IdEmpresa") as ids,
    ARRAY_AGG("RazaoSocial" ORDER BY "IdEmpresa") as nomes
FROM "SINDPLAST"."Empresas"
GROUP BY "CodEmpresa"
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, "CodEmpresa";

-- 2) Remover duplicatas mantendo o registro com menor IdEmpresa
DELETE FROM "SINDPLAST"."Empresas"
WHERE "IdEmpresa" NOT IN (
    SELECT MIN("IdEmpresa")
    FROM "SINDPLAST"."Empresas"
    GROUP BY "CodEmpresa"
);

-- 3) Verificar resultado após limpeza
SELECT 
    "CodEmpresa", 
    COUNT(*) as qtd_apos_limpeza
FROM "SINDPLAST"."Empresas"
GROUP BY "CodEmpresa"
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 4) Total final de empresas
SELECT COUNT(*) as total_empresas_final FROM "SINDPLAST"."Empresas";
