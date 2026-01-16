GRANT USAGE ON SCHEMA "SINDPLAST" TO anon;
GRANT SELECT ON TABLE "SINDPLAST"."Perfil" TO anon;

ALTER TABLE "SINDPLAST"."Perfil" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'SINDPLAST'
      AND tablename = 'Perfil'
      AND policyname = 'allow_anon_select'
  ) THEN
    EXECUTE 'CREATE POLICY allow_anon_select ON "SINDPLAST"."Perfil" FOR SELECT TO anon USING (true)';
  END IF;
END $$;
