
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) { process.env[k] = envConfig[k]; }

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { db: { schema: 'SINDPLAST' } }
);

async function syncSocios() {
    console.log('--- Sincronizando Sócios ---');
    const data = JSON.parse(fs.readFileSync('d:/PROJETOS/Sindplast WEB/DataSource/Socios.json', 'utf8')).Socio;
    console.log(`Carregados ${data.length} sócios do arquivo.`);

    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize).map(s => ({
            Matricula: s.SMAT?.toString(),
            Nome: s.SNOME,
            Sexo: s.SSEXO,
            Status: s.SATIV ? 'ATIVO' : 'INATIVO',
            Nascimento: s.SDNASC,
            Pai: s.SPAI,
            Mae: s.SMAE,
            EstadoCivil: s.SESTCIVIL,
            Endereco: s.SEND,
            Bairro: s.SBAIRRO,
            CEP: s.SCEP,
            Telefone: s.SFONE?.toString(),
            Celular: s.SFONE?.toString(),
            RG: s.SIDENT,
            DataMensalidade: s.SDATMEN,
            ValorMensalidade: s.SVALORME,
            DataAdmissao: s.SDTADMS,
            CTPS: s.SCTPS,
            Funcao: s.SFUNCAO,
            Observacao: s.SOBS,
            CodEmpresa: s.ECODIG,
            Cadastrante: 'Sincronização Automática',
            DataCadastro: new Date().toISOString()
        }));

        const { error } = await supabase.from('Socios').upsert(batch, { onConflict: 'Matricula' });
        if (error) console.error(`Erro no lote ${i}:`, error.message);
        else process.stdout.write('.');
    }
    console.log('\nSócios concluídos.');
}

async function syncEmpresas() {
    console.log('--- Sincronizando Empresas ---');
    const data = JSON.parse(fs.readFileSync('d:/PROJETOS/Sindplast WEB/DataSource/Empresas.json', 'utf8')).Empresa;
    console.log(`Carregadas ${data.length} empresas.`);

    const batch = data.map(e => ({
        IdEmpresa: e.ECODIG, // assuming ECODIG is the primary key and maps to IdEmpresa
        RazaoSocial: e.ENOME,
        CNPJ: e.ECGC,
        NFuncionarios: e.ENFUNC,
        Telefone01: e.EFONE1?.toString(),
        Telefone02: e.EFONE2?.toString(),
        Fax: e.EFAX?.toString(),
        Endereco: e.EEND,
        Bairro: e.EBAIRRO,
        Cidade: e.ECID,
        CEP: e.ECEP,
        UF: e.EESTADO,
        Observacao: e.EOBS,
        DataContribuicao: e.EDTCON,
        ValorContribuicao: e.EVALOR,
        Cadastrante: 'Sincronização Automática'
    }));

    const { error } = await supabase.from('Empresas').upsert(batch, { onConflict: 'IdEmpresa' });
    if (error) console.error('Erro ao sincronizar empresas:', error.message);
    console.log('Empresas concluídas.');
}

async function syncDependentes() {
    console.log('--- Sincronizando Dependentes ---');
    const data = JSON.parse(fs.readFileSync('d:/PROJETOS/Sindplast WEB/DataSource/Dependentes.json', 'utf8')).Dependente;
    console.log(`Carregados ${data.length} dependentes.`);

    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize).map(d => ({
            CodDependente: d.Código?.toString(),
            CodSocio: d.SMAT, // In DataSource, SMAT is the socio reference
            Dependente: d.DNOME,
            Nascimento: d.DDTNASC,
            Parentesco: d.DTIPO?.toUpperCase(),
            Carteira: d.DCARTEIRA,
            Status: true,
            Cadastrante: 'Sincronização Automática',
            DataCadastro: d.DDTCAD || new Date().toISOString()
        }));

        const { error } = await supabase.from('Dependentes').upsert(batch, { onConflict: 'CodDependente' });
        if (error) console.error(`Erro no lote de dependentes ${i}:`, error.message);
        else process.stdout.write('.');
    }
    console.log('\nDependentes concluídos.');
}

async function main() {
    try {
        await syncEmpresas();
        await syncSocios();
        await syncDependentes();
        console.log('🎯 Sincronização finalizada com sucesso!');
    } catch (err) {
        console.error('Falha crítica na sincronização:', err.message);
    }
}

main();
