ALTER TABLE IF EXISTS "SINDPLAST"."Socios"
ADD COLUMN IF NOT EXISTS "Imagem" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'socios-images') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('socios-images', 'socios-images', true);
  END IF;
END $$;

ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

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

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
