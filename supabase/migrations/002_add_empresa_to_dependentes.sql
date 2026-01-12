ALTER TABLE IF EXISTS "SINDPLAST"."Dependentes"
ADD COLUMN IF NOT EXISTS "Empresa" VARCHAR(500);

UPDATE "SINDPLAST"."Dependentes" d
SET "Empresa" = s."RazaoSocial"
FROM "SINDPLAST"."Socios" s
WHERE s."Matricula" = d."CodSocio"::text
  AND d."Empresa" IS NULL;

CREATE INDEX IF NOT EXISTS idx_dependentes_empresa
ON "SINDPLAST"."Dependentes"("Empresa");
