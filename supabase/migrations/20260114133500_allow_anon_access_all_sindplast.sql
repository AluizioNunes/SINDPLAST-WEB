GRANT USAGE ON SCHEMA "SINDPLAST" TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "SINDPLAST" TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "SINDPLAST" TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA "SINDPLAST"
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA "SINDPLAST"
GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'SINDPLAST'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'SINDPLAST', r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS allow_anon_all ON %I.%I', 'SINDPLAST', r.tablename);
    EXECUTE format('CREATE POLICY allow_anon_all ON %I.%I FOR ALL TO anon USING (true) WITH CHECK (true)', 'SINDPLAST', r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS allow_authenticated_all ON %I.%I', 'SINDPLAST', r.tablename);
    EXECUTE format('CREATE POLICY allow_authenticated_all ON %I.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', 'SINDPLAST', r.tablename);
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
