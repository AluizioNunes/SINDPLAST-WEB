-- Migration to recreate tables in SINDPLAST schema with PascalCase columns
-- matching the pattern of Socios table.

-- Create tables in SINDPLAST schema
CREATE TABLE IF NOT EXISTS "SINDPLAST"."Funcoes" (
    "IdFuncao" SERIAL PRIMARY KEY,
    "Descricao" TEXT NOT NULL,
    "CBO" TEXT,
    "DataCadastro" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "Status" BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "SINDPLAST"."Ativos" (
    "IdAtivo" SERIAL PRIMARY KEY,
    "Descricao" TEXT NOT NULL,
    "Tipo" TEXT,
    "Valor" NUMERIC(10, 2),
    "DataAquisicao" DATE,
    "Status" TEXT DEFAULT 'ATIVO',
    "Observacao" TEXT
);

CREATE TABLE IF NOT EXISTS "SINDPLAST"."CentroCustos" (
    "IdCentroCusto" SERIAL PRIMARY KEY,
    "Codigo" TEXT NOT NULL,
    "Descricao" TEXT NOT NULL,
    "Status" BOOLEAN DEFAULT TRUE,
    CONSTRAINT "CentroCustos_Codigo_key" UNIQUE ("Codigo")
);

CREATE TABLE IF NOT EXISTS "SINDPLAST"."ContasPagar" (
    "IdContaPagar" SERIAL PRIMARY KEY,
    "Descricao" TEXT NOT NULL,
    "Valor" NUMERIC(10, 2) NOT NULL,
    "Vencimento" DATE NOT NULL,
    "DataPagamento" DATE,
    "Status" TEXT DEFAULT 'PENDENTE',
    "Fornecedor" TEXT,
    "CentroCustoId" INTEGER REFERENCES "SINDPLAST"."CentroCustos"("IdCentroCusto"),
    "Observacao" TEXT
);

CREATE TABLE IF NOT EXISTS "SINDPLAST"."ContasReceber" (
    "IdContaReceber" SERIAL PRIMARY KEY,
    "Descricao" TEXT NOT NULL,
    "Valor" NUMERIC(10, 2) NOT NULL,
    "Vencimento" DATE NOT NULL,
    "DataRecebimento" DATE,
    "Status" TEXT DEFAULT 'PENDENTE',
    "Cliente" TEXT,
    "CentroCustoId" INTEGER REFERENCES "SINDPLAST"."CentroCustos"("IdCentroCusto"),
    "Observacao" TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_funcoes_descricao ON "SINDPLAST"."Funcoes"("Descricao");
CREATE INDEX IF NOT EXISTS idx_ativos_descricao ON "SINDPLAST"."Ativos"("Descricao");
CREATE INDEX IF NOT EXISTS idx_centrocustos_codigo ON "SINDPLAST"."CentroCustos"("Codigo");
CREATE INDEX IF NOT EXISTS idx_centrocustos_descricao ON "SINDPLAST"."CentroCustos"("Descricao");
CREATE INDEX IF NOT EXISTS idx_contaspagar_vencimento ON "SINDPLAST"."ContasPagar"("Vencimento");
CREATE INDEX IF NOT EXISTS idx_contasreceber_vencimento ON "SINDPLAST"."ContasReceber"("Vencimento");
