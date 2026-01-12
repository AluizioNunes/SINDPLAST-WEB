-- Migration to create new tables for Sindplast WEB

-- Table: Funcoes
CREATE TABLE "Funcoes" (
    "id" SERIAL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "cbo" TEXT,
    "data_cadastro" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "status" BOOLEAN DEFAULT TRUE
);

-- Table: Ativos
CREATE TABLE "Ativos" (
    "id" SERIAL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "tipo" TEXT, -- e.g., 'Equipamento', 'Móvel', 'Imóvel'
    "valor" NUMERIC(10, 2),
    "data_aquisicao" DATE,
    "status" TEXT DEFAULT 'ATIVO',
    "observacao" TEXT
);

-- Table: CentroCustos
CREATE TABLE "CentroCustos" (
    "id" SERIAL PRIMARY KEY,
    "codigo" TEXT NOT NULL UNIQUE,
    "descricao" TEXT NOT NULL,
    "status" BOOLEAN DEFAULT TRUE
);

-- Table: ContasPagar
CREATE TABLE "ContasPagar" (
    "id" SERIAL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "valor" NUMERIC(10, 2) NOT NULL,
    "vencimento" DATE NOT NULL,
    "data_pagamento" DATE,
    "status" TEXT DEFAULT 'PENDENTE', -- 'PENDENTE', 'PAGO', 'CANCELADO'
    "fornecedor" TEXT,
    "centro_custo_id" INTEGER REFERENCES "CentroCustos"("id"),
    "observacao" TEXT
);

-- Table: ContasReceber
CREATE TABLE "ContasReceber" (
    "id" SERIAL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "valor" NUMERIC(10, 2) NOT NULL,
    "vencimento" DATE NOT NULL,
    "data_recebimento" DATE,
    "status" TEXT DEFAULT 'PENDENTE', -- 'PENDENTE', 'RECEBIDO', 'CANCELADO'
    "cliente" TEXT, -- Pode ser um Sócio ou Empresa, mas deixaremos texto livre ou ID futuramente
    "centro_custo_id" INTEGER REFERENCES "CentroCustos"("id"),
    "observacao" TEXT
);

-- RLS Policies (Assuming basic authenticated access for now)
ALTER TABLE "Funcoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ativos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CentroCustos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContasPagar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContasReceber" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON "Funcoes" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON "Ativos" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON "CentroCustos" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON "ContasPagar" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON "ContasReceber" FOR ALL USING (auth.role() = 'authenticated');
