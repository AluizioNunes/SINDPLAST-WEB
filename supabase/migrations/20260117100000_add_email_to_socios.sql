ALTER TABLE IF EXISTS "SINDPLAST"."Socios"
ADD COLUMN IF NOT EXISTS "Email" VARCHAR(320);

UPDATE "SINDPLAST"."Socios"
SET "Email" = LOWER("RedeSocial")
WHERE "Email" IS NULL
  AND "RedeSocial" IS NOT NULL
  AND POSITION('@' IN "RedeSocial") > 1;

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

