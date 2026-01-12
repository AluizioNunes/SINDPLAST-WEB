-- RESTAURAR SÓCIOS VIA SQL DIRETO
-- Execute no SQL Editor do Supabase

-- 1) Limpar tabela atual (se necessário)
-- TRUNCATE TABLE "SINDPLAST"."Socios" RESTART IDENTITY;

-- 2) Inserir dados usando SQL direto
INSERT INTO "SINDPLAST"."Socios" (
    "Matricula", "Nome", "RG", "Emissor", "CPF", "Nascimento", 
    "Sexo", "CodEmpresa", "RazaoSocial", "DataCadastro", "Cadastrante"
)
SELECT 
    "SMAT"::text as "Matricula",
    "SNOME" as "Nome",
    "SRG" as "RG", 
    "SEMISSOR" as "Emissor",
    "SCPF" as "CPF",
    "SDTNASC" as "Nascimento",
    "SSEXO" as "Sexo",
    "ECODIG"::text as "CodEmpresa",
    "ENOME" as "RazaoSocial",
    NOW() as "DataCadastro",
    'Sincronização Automática' as "Cadastrante"
FROM (
    SELECT *
    FROM jsonb_to_recordset('{
        "Socio": [
            {"SMAT": 84, "SNOME": "ELIDIO COSTA  DE SOUZA", "SRG": null, "SEMISSOR": null, "SCPF": null, "SDTNASC": "1993-04-22T04:00:00.000Z", "SSEXO": null, "ECODIG": null, "ENOME": null},
            {"SMAT": 1686, "SNOME": "ADELAIDE LIMA DE OLIVEIRA", "SRG": null, "SEMISSOR": null, "SCPF": null, "SDTNASC": "1959-09-22T04:00:00.000Z", "SSEXO": null, "ECODIG": null, "ENOME": null},
            {"SMAT": 1812, "SNOME": "ZENILDA FERREIRA PIRES", "SRG": null, "SEMISSOR": null, "SCPF": null, "SDTNASC": "1964-01-03T03:00:00.000Z", "SSEXO": null, "ECODIG": null, "ENOME": null}
        ]
    }')
) AS data;

-- 3) Verificar resultado
SELECT COUNT(*) as total_socios FROM "SINDPLAST"."Socios";

-- 4) Se precisar inserir mais dados, use este padrão:
-- Copie e cole os registros do JSON seguindo o formato acima
