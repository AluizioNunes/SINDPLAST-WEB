ALTER TABLE IF EXISTS "SINDPLAST"."Socios"
ADD COLUMN IF NOT EXISTS "Imagem" TEXT;

DO $$
BEGIN
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'socios-images') THEN
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('socios-images', 'socios-images', true);
    END IF;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Sem permissão para criar bucket socios-images via SQL. Crie no painel do Supabase (Storage).';
  END;

  BEGIN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Sem permissão para alterar storage.objects. Configure policies no painel do Supabase (Storage > Policies).';
      RETURN;
  END;

  BEGIN
    DROP POLICY IF EXISTS "socios-images public select" ON storage.objects;
    DROP POLICY IF EXISTS "socios-images public insert" ON storage.objects;
    DROP POLICY IF EXISTS "socios-images public update" ON storage.objects;
    DROP POLICY IF EXISTS "socios-images public delete" ON storage.objects;

    CREATE POLICY "socios-images public select"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'socios-images');

    CREATE POLICY "socios-images public insert"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'socios-images');

    CREATE POLICY "socios-images public update"
    ON storage.objects FOR UPDATE
    TO anon, authenticated
    USING (bucket_id = 'socios-images')
    WITH CHECK (bucket_id = 'socios-images');

    CREATE POLICY "socios-images public delete"
    ON storage.objects FOR DELETE
    TO anon, authenticated
    USING (bucket_id = 'socios-images');
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Sem permissão para criar policies em storage.objects. Configure no painel do Supabase (Storage > Policies).';
  END;
END $$;

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
