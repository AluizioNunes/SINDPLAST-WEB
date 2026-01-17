DO $$
DECLARE
  has_email boolean;
  has_imagem boolean;
  has_cidade boolean;
  has_uf boolean;
  has_link boolean;
  seq_name text;
  pk_name text;
  backup_name text;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'SINDPLAST'
      AND table_name = 'Socios'
      AND column_name = 'Email'
  ) INTO has_email;

  IF NOT has_email THEN
    EXECUTE 'ALTER TABLE "SINDPLAST"."Socios" ADD COLUMN "Email" VARCHAR(320)';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'SINDPLAST'
      AND table_name = 'Socios'
      AND column_name = 'Imagem'
  ) INTO has_imagem;

  IF NOT has_imagem THEN
    EXECUTE 'ALTER TABLE "SINDPLAST"."Socios" ADD COLUMN "Imagem" TEXT';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'SINDPLAST'
      AND table_name = 'Socios'
      AND column_name = 'Cidade'
  ) INTO has_cidade;

  IF NOT has_cidade THEN
    EXECUTE 'ALTER TABLE "SINDPLAST"."Socios" ADD COLUMN "Cidade" VARCHAR(500)';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'SINDPLAST'
      AND table_name = 'Socios'
      AND column_name = 'UF'
  ) INTO has_uf;

  IF NOT has_uf THEN
    EXECUTE 'ALTER TABLE "SINDPLAST"."Socios" ADD COLUMN "UF" VARCHAR(2)';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'SINDPLAST'
      AND table_name = 'Socios'
      AND column_name = 'LinkRedeSocial'
  ) INTO has_link;

  IF NOT has_link THEN
    EXECUTE 'ALTER TABLE "SINDPLAST"."Socios" ADD COLUMN "LinkRedeSocial" VARCHAR(500)';
  END IF;

  SELECT pg_get_serial_sequence('"SINDPLAST"."Socios"', 'IdSocio') INTO seq_name;
  IF seq_name IS NULL THEN
    EXECUTE 'CREATE SEQUENCE IF NOT EXISTS "SINDPLAST"."Socios_IdSocio_seq"';
    seq_name := '"SINDPLAST"."Socios_IdSocio_seq"';
  END IF;

  EXECUTE 'LOCK TABLE "SINDPLAST"."Socios" IN ACCESS EXCLUSIVE MODE';

  EXECUTE 'DROP TABLE IF EXISTS "SINDPLAST"."Socios__new"';

  pk_name := 'Socios__new_pkey_' || substr(md5(clock_timestamp()::text), 1, 12);

  EXECUTE format($sql$
    CREATE TABLE "SINDPLAST"."Socios__new" (
      "IdSocio" integer NOT NULL DEFAULT nextval(%L::regclass),
      "Nome" varchar(400),
      "RG" varchar(30),
      "Emissor" varchar(100),
      "CPF" varchar(14),
      "Nascimento" date,
      "Sexo" varchar(100),
      "Naturalidade" varchar(200),
      "NaturalidadeUF" varchar(2),
      "Nacionalidade" varchar(150),
      "EstadoCivil" varchar(200),
      "Endereco" varchar(400),
      "Complemento" varchar(500),
      "Bairro" varchar(400),
      "CEP" varchar(9),
      "Cidade" varchar(500),
      "UF" varchar(2),
      "Celular" varchar(15),
      "Email" varchar(320),
      "RedeSocial" varchar(500),
      "LinkRedeSocial" varchar(500),
      "Pai" varchar(400),
      "Mae" varchar(400),
      "DataCadastro" timestamp DEFAULT now(),
      "Cadastrante" varchar(300),
      "Status" varchar(20),
      "Matricula" varchar(50),
      "DataMensalidade" date,
      "ValorMensalidade" numeric(10, 2),
      "DataAdmissao" date,
      "CTPS" varchar(50),
      "Funcao" varchar(200),
      "CodEmpresa" varchar(10),
      "CNPJ" varchar(18),
      "RazaoSocial" varchar(500),
      "NomeFantasia" varchar(500),
      "DataDemissao" date,
      "MotivoDemissao" varchar(500),
      "Carta" boolean,
      "Carteira" boolean,
      "Ficha" boolean,
      "Observacao" text,
      "Telefone" varchar(15),
      "Imagem" text,
      CONSTRAINT %I PRIMARY KEY ("IdSocio")
    )
  $sql$, seq_name, pk_name);

  EXECUTE $sql$
    INSERT INTO "SINDPLAST"."Socios__new" (
      "IdSocio",
      "Nome",
      "RG",
      "Emissor",
      "CPF",
      "Nascimento",
      "Sexo",
      "Naturalidade",
      "NaturalidadeUF",
      "Nacionalidade",
      "EstadoCivil",
      "Endereco",
      "Complemento",
      "Bairro",
      "CEP",
      "Cidade",
      "UF",
      "Celular",
      "Email",
      "RedeSocial",
      "LinkRedeSocial",
      "Pai",
      "Mae",
      "DataCadastro",
      "Cadastrante",
      "Status",
      "Matricula",
      "DataMensalidade",
      "ValorMensalidade",
      "DataAdmissao",
      "CTPS",
      "Funcao",
      "CodEmpresa",
      "CNPJ",
      "RazaoSocial",
      "NomeFantasia",
      "DataDemissao",
      "MotivoDemissao",
      "Carta",
      "Carteira",
      "Ficha",
      "Observacao",
      "Telefone",
      "Imagem"
    )
    SELECT
      s."IdSocio",
      s."Nome",
      s."RG",
      s."Emissor",
      s."CPF",
      s."Nascimento",
      s."Sexo",
      s."Naturalidade",
      s."NaturalidadeUF",
      s."Nacionalidade",
      s."EstadoCivil",
      s."Endereco",
      s."Complemento",
      s."Bairro",
      s."CEP",
      s."Cidade",
      s."UF",
      s."Celular",
      COALESCE(
        s."Email",
        CASE
          WHEN s."RedeSocial" IS NOT NULL AND POSITION('@' IN s."RedeSocial") > 1 THEN lower(s."RedeSocial")
          ELSE NULL
        END
      ) AS "Email",
      s."RedeSocial",
      s."LinkRedeSocial",
      s."Pai",
      s."Mae",
      s."DataCadastro",
      s."Cadastrante",
      s."Status",
      s."Matricula",
      s."DataMensalidade",
      s."ValorMensalidade",
      s."DataAdmissao",
      s."CTPS",
      s."Funcao",
      s."CodEmpresa",
      s."CNPJ",
      s."RazaoSocial",
      s."NomeFantasia",
      s."DataDemissao",
      s."MotivoDemissao",
      s."Carta",
      s."Carteira",
      s."Ficha",
      s."Observacao",
      s."Telefone",
      s."Imagem"
    FROM "SINDPLAST"."Socios" s
  $sql$;

  EXECUTE 'ALTER SEQUENCE ' || seq_name || ' OWNED BY "SINDPLAST"."Socios__new"."IdSocio"';
  EXECUTE 'SELECT setval(' || quote_literal(seq_name) || ', (SELECT COALESCE(MAX("IdSocio"), 0) FROM "SINDPLAST"."Socios__new"), true)';

  backup_name := 'Socios__backup_email_reorder';
  IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'SINDPLAST'
      AND tablename = backup_name
  ) THEN
    EXECUTE format(
      'ALTER TABLE "SINDPLAST".%I RENAME TO %I',
      backup_name,
      backup_name || '_' || to_char(clock_timestamp(), 'YYYYMMDDHH24MISS')
    );
  END IF;

  EXECUTE format('ALTER TABLE "SINDPLAST"."Socios" RENAME TO %I', backup_name);
  EXECUTE 'ALTER TABLE "SINDPLAST"."Socios__new" RENAME TO "Socios"';

  EXECUTE 'ALTER SEQUENCE ' || seq_name || ' OWNED BY "SINDPLAST"."Socios"."IdSocio"';

  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_socios_matricula_v2 ON "SINDPLAST"."Socios"("Matricula")';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_socios_cpf_v2 ON "SINDPLAST"."Socios"("CPF")';

  EXECUTE 'ALTER TABLE "SINDPLAST"."Socios" ENABLE ROW LEVEL SECURITY';

  EXECUTE 'DROP POLICY IF EXISTS allow_anon_all ON "SINDPLAST"."Socios"';
  EXECUTE 'DROP POLICY IF EXISTS allow_authenticated_all ON "SINDPLAST"."Socios"';
  EXECUTE 'CREATE POLICY allow_anon_all ON "SINDPLAST"."Socios" FOR ALL TO anon USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY allow_authenticated_all ON "SINDPLAST"."Socios" FOR ALL TO authenticated USING (true) WITH CHECK (true)';

  EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "SINDPLAST"."Socios" TO anon, authenticated, service_role';
  EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE ' || seq_name || ' TO anon, authenticated, service_role';
END $$;

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

