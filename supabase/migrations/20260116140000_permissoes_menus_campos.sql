CREATE TABLE IF NOT EXISTS "SINDPLAST"."PermissoesMenus" (
  "IdPermissaoMenu" SERIAL PRIMARY KEY,
  "IdPerfil" INTEGER NOT NULL REFERENCES "SINDPLAST"."Perfil"("IdPerfil") ON DELETE CASCADE,
  "MenuId" TEXT NOT NULL,
  "Acesso" BOOLEAN NOT NULL DEFAULT FALSE,
  "DataCadastro" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "SINDPLAST"."PermissoesCampos" (
  "IdPermissaoCampo" SERIAL PRIMARY KEY,
  "IdPerfil" INTEGER NOT NULL REFERENCES "SINDPLAST"."Perfil"("IdPerfil") ON DELETE CASCADE,
  "TelaId" TEXT NOT NULL,
  "CampoId" TEXT NOT NULL,
  "Visualizar" BOOLEAN NOT NULL DEFAULT FALSE,
  "Editar" BOOLEAN NOT NULL DEFAULT FALSE,
  "DataCadastro" TIMESTAMP DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'SINDPLAST'
      AND t.relname = 'PermissoesMenus'
      AND c.conname = 'PermissoesMenus_IdPerfil_MenuId_key'
  ) THEN
    EXECUTE 'ALTER TABLE "SINDPLAST"."PermissoesMenus" ADD CONSTRAINT "PermissoesMenus_IdPerfil_MenuId_key" UNIQUE ("IdPerfil", "MenuId")';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'SINDPLAST'
      AND t.relname = 'PermissoesCampos'
      AND c.conname = 'PermissoesCampos_IdPerfil_TelaId_CampoId_key'
  ) THEN
    EXECUTE 'ALTER TABLE "SINDPLAST"."PermissoesCampos" ADD CONSTRAINT "PermissoesCampos_IdPerfil_TelaId_CampoId_key" UNIQUE ("IdPerfil", "TelaId", "CampoId")';
  END IF;
END $$;

ALTER TABLE "SINDPLAST"."PermissoesMenus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SINDPLAST"."PermissoesCampos" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'SINDPLAST'
      AND tablename = 'PermissoesMenus'
      AND policyname = 'allow_anon_all'
  ) THEN
    EXECUTE 'CREATE POLICY allow_anon_all ON "SINDPLAST"."PermissoesMenus" FOR ALL TO anon USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'SINDPLAST'
      AND tablename = 'PermissoesMenus'
      AND policyname = 'allow_authenticated_all'
  ) THEN
    EXECUTE 'CREATE POLICY allow_authenticated_all ON "SINDPLAST"."PermissoesMenus" FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'SINDPLAST'
      AND tablename = 'PermissoesCampos'
      AND policyname = 'allow_anon_all'
  ) THEN
    EXECUTE 'CREATE POLICY allow_anon_all ON "SINDPLAST"."PermissoesCampos" FOR ALL TO anon USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'SINDPLAST'
      AND tablename = 'PermissoesCampos'
      AND policyname = 'allow_authenticated_all'
  ) THEN
    EXECUTE 'CREATE POLICY allow_authenticated_all ON "SINDPLAST"."PermissoesCampos" FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

GRANT USAGE ON SCHEMA "SINDPLAST" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "SINDPLAST"."PermissoesMenus" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "SINDPLAST"."PermissoesCampos" TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE "SINDPLAST"."PermissoesMenus_IdPermissaoMenu_seq" TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE "SINDPLAST"."PermissoesCampos_IdPermissaoCampo_seq" TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

