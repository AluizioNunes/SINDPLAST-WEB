-- Custom login + password guard for SINDPLAST.Usuarios

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DROP FUNCTION IF EXISTS "SINDPLAST".custom_login(text, text);
DROP FUNCTION IF EXISTS public.custom_login(text, text);

CREATE OR REPLACE FUNCTION "SINDPLAST".custom_login(p_email text, p_password text)
RETURNS TABLE (
  "IdUsuarios" integer,
  "Nome" text,
  "CPF" text,
  "Funcao" text,
  "Email" text,
  "Usuario" text,
  "Perfil" text,
  "Cadastrante" text,
  "DataCadastro" timestamp,
  "Senha" text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = "SINDPLAST", public
AS $$
DECLARE
  u record;
BEGIN
  SELECT *
  INTO u
  FROM "Usuarios" usr
  WHERE lower(coalesce(usr."Email", '')) = lower(coalesce(p_email, ''))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF u."Senha" IS NULL OR length(trim(u."Senha")) = 0 THEN
    RETURN;
  END IF;

  IF u."Senha" <> extensions.crypt(p_password, u."Senha"::text) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    u."IdUsuarios",
    u."Nome"::text,
    u."CPF"::text,
    u."Funcao"::text,
    u."Email"::text,
    u."Usuario"::text,
    u."Perfil"::text,
    u."Cadastrante"::text,
    u."DataCadastro"::timestamp,
    NULL::text AS "Senha";
END;
$$;

GRANT USAGE ON SCHEMA "SINDPLAST" TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION "SINDPLAST".custom_login(text, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION "SINDPLAST".hash_usuario_senha()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = "SINDPLAST", public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW."Senha" IS NULL OR length(trim(NEW."Senha")) = 0 THEN
      NEW."Senha" := OLD."Senha";
      RETURN NEW;
    END IF;
  END IF;

  IF NEW."Senha" IS NULL OR length(trim(NEW."Senha")) = 0 THEN
    RETURN NEW;
  END IF;

  IF position('$2' in NEW."Senha") = 1 THEN
    RETURN NEW;
  END IF;

  NEW."Senha" := extensions.crypt(NEW."Senha", extensions.gen_salt('bf'));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS usuarios_hash_senha ON "SINDPLAST"."Usuarios";
CREATE TRIGGER usuarios_hash_senha
BEFORE INSERT OR UPDATE OF "Senha"
ON "SINDPLAST"."Usuarios"
FOR EACH ROW
EXECUTE FUNCTION "SINDPLAST".hash_usuario_senha();

-- Emergency restore: if the ITFACT user password got cleared, restore a known password.
UPDATE "SINDPLAST"."Usuarios"
SET "Senha" = extensions.crypt('ITFACTsindplast', extensions.gen_salt('bf'))
WHERE lower(coalesce("Email", '')) = 'sindplast@itfact.com.br'
  AND ("Senha" IS NULL OR length(trim("Senha")) = 0);

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
