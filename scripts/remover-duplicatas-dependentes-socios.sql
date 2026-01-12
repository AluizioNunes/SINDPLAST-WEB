-- SQL PARA VERIFICAR E REMOVER DUPLICATOS DE DEPENDENTES E SÓCIOS
-- Execute no SQL Editor do Supabase

-- ======================================
-- 1) VERIFICAR DUPLICATOS DE DEPENDENTES
-- ======================================

-- Verificar duplicatas por (CodSocio, CodDependente)
SELECT 
    "CodSocio",
    "CodDependente", 
    COUNT(*) as qtd_duplicatas,
    ARRAY_AGG("IdDependente" ORDER BY "IdDependente") as ids
FROM "SINDPLAST"."Dependentes"
GROUP BY "CodSocio", "CodDependente"
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, "CodSocio", "CodDependente";

-- Verificar duplicatas apenas por CodDependente
SELECT 
    "CodDependente", 
    COUNT(*) as qtd_duplicatas,
    ARRAY_AGG("IdDependente" ORDER BY "IdDependente") as ids
FROM "SINDPLAST"."Dependentes"
GROUP BY "CodDependente"
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, "CodDependente";

-- ======================================
-- 2) REMOVER DUPLICATOS DE DEPENDENTES
-- ======================================

-- Remover duplicatas mantendo o registro com menor IdDependente
DELETE FROM "SINDPLAST"."Dependentes"
WHERE "IdDependente" NOT IN (
    SELECT MIN("IdDependente")
    FROM "SINDPLAST"."Dependentes"
    GROUP BY "CodSocio", "CodDependente"
);

-- Verificar resultado após limpeza
SELECT 
    "CodSocio",
    "CodDependente", 
    COUNT(*) as qtd_apos_limpeza
FROM "SINDPLAST"."Dependentes"
GROUP BY "CodSocio", "CodDependente"
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, "CodSocio", "CodDependente";

-- Total final de dependentes
SELECT COUNT(*) as total_dependentes_final FROM "SINDPLAST"."Dependentes";

-- ======================================
-- 3) VERIFICAR DUPLICATOS DE SÓCIOS
-- ======================================

-- Verificar duplicatas por Matricula
SELECT 
    "Matricula",
    COUNT(*) as qtd_duplicatas,
    ARRAY_AGG("IdSocio" ORDER BY "IdSocio") as ids,
    ARRAY_AGG("Nome" ORDER BY "IdSocio") as nomes
FROM "SINDPLAST"."Socios"
GROUP BY "Matricula"
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, "Matricula";

-- Verificar duplicatas por CPF
SELECT 
    "CPF",
    COUNT(*) as qtd_duplicatas,
    ARRAY_AGG("IdSocio" ORDER BY "IdSocio") as ids,
    ARRAY_AGG("Nome" ORDER BY "IdSocio") as nomes
FROM "SINDPLAST"."Socios"
WHERE "CPF" IS NOT NULL AND "CPF" != ''
GROUP BY "CPF"
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, "CPF";

-- ======================================
-- 4) REMOVER DUPLICATOS DE SÓCIOS
-- ======================================

-- Remover duplicatas por Matricula (mantém o mais antigo)
DELETE FROM "SINDPLAST"."Socios"
WHERE "IdSocio" NOT IN (
    SELECT MIN("IdSocio")
    FROM "SINDPLAST"."Socios"
    GROUP BY "Matricula"
);

-- Remover duplicatas por CPF (se ainda existirem)
DELETE FROM "SINDPLAST"."Socios"
WHERE "IdSocio" NOT IN (
    SELECT MIN("IdSocio")
    FROM "SINDPLAST"."Socios"
    WHERE "CPF" IS NOT NULL AND "CPF" != ''
    GROUP BY "CPF"
);

-- Verificar resultado após limpeza
SELECT 
    "Matricula",
    COUNT(*) as qtd_apos_limpeza_matricula
FROM "SINDPLAST"."Socios"
GROUP BY "Matricula"
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, "Matricula";

SELECT 
    "CPF",
    COUNT(*) as qtd_apos_limpeza_cpf
FROM "SINDPLAST"."Socios"
WHERE "CPF" IS NOT NULL AND "CPF" != ''
GROUP BY "CPF"
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, "CPF";

-- Total final de sócios
SELECT COUNT(*) as total_socios_final FROM "SINDPLAST"."Socios";

-- ======================================
-- 5) RESUMO FINAL
-- ======================================

SELECT 
    'Dependentes' as tabela,
    COUNT(*) as total_registros
FROM "SINDPLAST"."Dependentes"
UNION ALL
SELECT 
    'Socios' as tabela,
    COUNT(*) as total_registros
FROM "SINDPLAST"."Socios"
UNION ALL
SELECT 
    'Empresas' as tabela,
    COUNT(*) as total_registros
FROM "SINDPLAST"."Empresas";
