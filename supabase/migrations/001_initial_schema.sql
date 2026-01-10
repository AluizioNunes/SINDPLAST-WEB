-- Criar schema SINDPLAST
CREATE SCHEMA IF NOT EXISTS "SINDPLAST";

-- Criar tabela Empresas
CREATE TABLE IF NOT EXISTS "SINDPLAST"."Empresas" (
  "IdEmpresa" SERIAL PRIMARY KEY,
  "CodEmpresa" VARCHAR(10),
  "CNPJ" VARCHAR(18),
  "RazaoSocial" VARCHAR(500),
  "NomeFantasia" VARCHAR(500),
  "Endereco" VARCHAR(500),
  "Numero" VARCHAR(12),
  "Complemento" VARCHAR(500),
  "Bairro" VARCHAR(500),
  "CEP" VARCHAR(10),
  "Cidade" VARCHAR(500),
  "UF" VARCHAR(2),
  "Telefone01" VARCHAR(15),
  "Telefone02" VARCHAR(15),
  "Fax" VARCHAR(15),
  "Celular" VARCHAR(15),
  "WhatsApp" VARCHAR(15),
  "Instagram" VARCHAR(200),
  "Linkedin" VARCHAR(200),
  "NFuncionarios" INTEGER,
  "DataContribuicao" DATE,
  "ValorContribuicao" NUMERIC(10, 2),
  "DataCadastro" TIMESTAMP DEFAULT NOW(),
  "Cadastrante" VARCHAR(500),
  "Observacao" TEXT
);

-- Criar tabela Socios
CREATE TABLE IF NOT EXISTS "SINDPLAST"."Socios" (
  "IdSocio" SERIAL PRIMARY KEY,
  "Nome" VARCHAR(400),
  "RG" VARCHAR(30),
  "Emissor" VARCHAR(100),
  "CPF" VARCHAR(14),
  "Nascimento" DATE,
  "Sexo" VARCHAR(100),
  "Naturalidade" VARCHAR(200),
  "NaturalidadeUF" VARCHAR(2),
  "Nacionalidade" VARCHAR(150),
  "EstadoCivil" VARCHAR(200),
  "Endereco" VARCHAR(400),
  "Complemento" VARCHAR(500),
  "Bairro" VARCHAR(400),
  "CEP" VARCHAR(9),
  "Celular" VARCHAR(15),
  "RedeSocial" VARCHAR(500),
  "Pai" VARCHAR(400),
  "Mae" VARCHAR(400),
  "DataCadastro" TIMESTAMP DEFAULT NOW(),
  "Cadastrante" VARCHAR(300),
  "Status" VARCHAR(20),
  "Matricula" VARCHAR(50),
  "DataMensalidade" DATE,
  "ValorMensalidade" NUMERIC(10, 2),
  "DataAdmissao" DATE,
  "CTPS" VARCHAR(50),
  "Funcao" VARCHAR(200),
  "CodEmpresa" VARCHAR(10),
  "CNPJ" VARCHAR(18),
  "RazaoSocial" VARCHAR(500),
  "NomeFantasia" VARCHAR(500),
  "DataDemissao" DATE,
  "MotivoDemissao" VARCHAR(500),
  "Carta" BOOLEAN,
  "Carteira" BOOLEAN,
  "Ficha" BOOLEAN,
  "Observacao" TEXT,
  "Telefone" VARCHAR(15)
);

-- Criar tabela Dependentes
CREATE TABLE IF NOT EXISTS "SINDPLAST"."Dependentes" (
  "IdDependente" SERIAL PRIMARY KEY,
  "CodDependente" INTEGER,
  "CodSocio" INTEGER,
  "Socio" VARCHAR(255),
  "Dependente" VARCHAR(255),
  "Nascimento" DATE,
  "Parentesco" VARCHAR(255),
  "Carteira" BOOLEAN,
  "DataCadastro" TIMESTAMP DEFAULT NOW(),
  "Cadastrante" VARCHAR(500),
  "Imagem" VARCHAR(255),
  "Status" BOOLEAN DEFAULT TRUE
);

-- Criar tabela Usuarios
CREATE TABLE IF NOT EXISTS "SINDPLAST"."Usuarios" (
  "IdUsuarios" SERIAL PRIMARY KEY,
  "Nome" VARCHAR(300),
  "CPF" VARCHAR(14),
  "Funcao" VARCHAR(300),
  "Email" VARCHAR(400),
  "Usuario" VARCHAR(200),
  "Senha" VARCHAR(200),
  "Perfil" VARCHAR(300),
  "Cadastrante" VARCHAR(400) NOT NULL,
  "DataCadastro" TIMESTAMP DEFAULT NOW()
);

-- Criar tabela Perfil
CREATE TABLE IF NOT EXISTS "SINDPLAST"."Perfil" (
  "IdPerfil" SERIAL PRIMARY KEY,
  "Perfil" VARCHAR(50) UNIQUE NOT NULL,
  "Descricao" VARCHAR(255),
  "DataCadastro" TIMESTAMP DEFAULT NOW(),
  "Cadastrante" VARCHAR(100)
);

-- Criar tabela Permissoes
CREATE TABLE IF NOT EXISTS "SINDPLAST"."Permissoes" (
  "IdPermissao" SERIAL PRIMARY KEY,
  "Nome" VARCHAR(50) UNIQUE NOT NULL,
  "Descricao" VARCHAR(255),
  "Tela" VARCHAR(100),
  "DataCadastro" TIMESTAMP DEFAULT NOW(),
  "Cadastrante" VARCHAR(100)
);

-- Criar tabela PerfilPermissao
CREATE TABLE IF NOT EXISTS "SINDPLAST"."PerfilPermissao" (
  "IdPerfil" INTEGER REFERENCES "SINDPLAST"."Perfil"("IdPerfil") ON DELETE CASCADE,
  "IdPermissao" INTEGER REFERENCES "SINDPLAST"."Permissoes"("IdPermissao") ON DELETE CASCADE,
  PRIMARY KEY ("IdPerfil", "IdPermissao")
);

-- Criar tabela Funcionarios
CREATE TABLE IF NOT EXISTS "SINDPLAST"."Funcionarios" (
  "id" SERIAL PRIMARY KEY,
  "nome" VARCHAR(100) NOT NULL,
  "cpf" VARCHAR(14) UNIQUE NOT NULL,
  "cargo" VARCHAR(50),
  "data_admissao" DATE,
  "salario" NUMERIC(10, 2),
  "empresa_id" INTEGER REFERENCES "SINDPLAST"."Empresas"("IdEmpresa")
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_socios_matricula ON "SINDPLAST"."Socios"("Matricula");
CREATE INDEX IF NOT EXISTS idx_socios_cpf ON "SINDPLAST"."Socios"("CPF");
CREATE INDEX IF NOT EXISTS idx_dependentes_codsocio ON "SINDPLAST"."Dependentes"("CodSocio");
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON "SINDPLAST"."Empresas"("CNPJ");
CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON "SINDPLAST"."Usuarios"("Usuario");

-- Inserir usuário Admin padrão (senha: Sindplast)
-- Nota: A senha será gerenciada pelo Supabase Auth
INSERT INTO "SINDPLAST"."Usuarios" ("Nome", "Usuario", "Email", "Perfil", "Cadastrante")
VALUES ('Administrador', 'Admin', 'admin@sindplast.local', 'Administrador', 'Sistema')
ON CONFLICT DO NOTHING;

-- Inserir perfil padrão
INSERT INTO "SINDPLAST"."Perfil" ("Perfil", "Descricao", "Cadastrante")
VALUES ('Administrador', 'Perfil com acesso total ao sistema', 'Sistema')
ON CONFLICT ("Perfil") DO NOTHING;

-- Habilitar Row Level Security (RLS)
ALTER TABLE "SINDPLAST"."Empresas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SINDPLAST"."Socios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SINDPLAST"."Dependentes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SINDPLAST"."Usuarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SINDPLAST"."Perfil" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SINDPLAST"."Permissoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SINDPLAST"."PerfilPermissao" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SINDPLAST"."Funcionarios" ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (permitir acesso autenticado)
CREATE POLICY "Allow authenticated access" ON "SINDPLAST"."Empresas"
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access" ON "SINDPLAST"."Socios"
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access" ON "SINDPLAST"."Dependentes"
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access" ON "SINDPLAST"."Usuarios"
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access" ON "SINDPLAST"."Perfil"
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access" ON "SINDPLAST"."Permissoes"
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access" ON "SINDPLAST"."PerfilPermissao"
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access" ON "SINDPLAST"."Funcionarios"
  FOR ALL USING (auth.role() = 'authenticated');
