-- VERIFICAR REGISTROS EXTRAS (CORRIGIDO)
-- Execute no SQL Editor do Supabase

-- 1) Verificar registros inseridos recentemente (data exata)
SELECT 
    "IdSocio",
    "Matricula", 
    "Nome", 
    "DataCadastro" 
FROM "SINDPLAST"."Socios" 
WHERE "DataCadastro" >= '2026-01-11T00:00:00Z'
ORDER BY "IdSocio" DESC;

-- 2) Verificar duplicatas por Matricula
SELECT 
    "Matricula",
    COUNT(*) as qtd_duplicatas,
    ARRAY_AGG("IdSocio" ORDER BY "IdSocio") as ids,
    ARRAY_AGG("Nome" ORDER BY "IdSocio") as nomes
FROM "SINDPLAST"."Socios"
GROUP BY "Matricula"
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, "Matricula";

-- 3) Remover duplicatas mantendo o mais antigo (se necessário)
-- DELETE FROM "SINDPLAST"."Socios"
-- WHERE "IdSocio" NOT IN (
--     SELECT MIN("IdSocio")
--     FROM "SINDPLAST"."Socios"
--     GROUP BY "Matricula"
-- );

-- 4) Verificar resultado final
SELECT COUNT(*) as total_final FROM "SINDPLAST"."Socios";
