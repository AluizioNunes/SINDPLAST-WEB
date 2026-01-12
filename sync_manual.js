
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) { process.env[k] = envConfig[k]; }

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { db: { schema: 'SINDPLAST' } }
);

async function getExistingKeys(table, column) {
    console.log(`Buscando chaves existentes em ${table}...`);
    let allKeys = new Set();
    let from = 0;
    let to = 999;
    let done = false;

    while (!done) {
        const { data, error } = await supabase.from(table).select(column).range(from, to);
        if (error) throw error;
        if (data.length === 0) done = true;
        else {
            data.forEach(item => allKeys.add(item[column]));
            from += 1000;
            to += 1000;
        }
    }
    console.log(`Total de chaves encontradas: ${allKeys.size}`);
    return allKeys;
}

async function syncSocios() {
    console.log('\n--- Sincronizando Sócios (Manual) ---');
    const fileData = JSON.parse(fs.readFileSync('d:/PROJETOS/Sindplast WEB/DataSource/Socios.json', 'utf8')).Socio;
    const existingMatriculas = await getExistingKeys('Socios', 'Matricula');

    let inserted = 0, updated = 0;
    const batchSize = 50;

    for (let i = 0; i < fileData.length; i += batchSize) {
        const batch = fileData.slice(i, i + batchSize);
        for (const s of batch) {
            const matricula = s.SMAT?.toString();
            const payload = {
                Matricula: matricula,
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
                Cadastrante: 'Sincronização Automática'
            };

            if (existingMatriculas.has(matricula)) {
                const { error } = await supabase.from('Socios').update(payload).eq('Matricula', matricula);
                if (error) console.error(`Erro ao atualizar sócio ${matricula}:`, error.message);
                else updated++;
            } else {
                const { error } = await supabase.from('Socios').insert(payload);
                if (error) console.error(`Erro ao inserir sócio ${matricula}:`, error.message);
                else inserted++;
            }
        }
        process.stdout.write('.');
    }
    console.log(`\nSócios: ${inserted} inseridos, ${updated} atualizados.`);
}

async function syncEmpresas() {
    console.log('\n--- Sincronizando Empresas (Manual) ---');
    const fileData = JSON.parse(fs.readFileSync('d:/PROJETOS/Sindplast WEB/DataSource/Empresas.json', 'utf8')).Empresa;
    const existingIds = await getExistingKeys('Empresas', 'IdEmpresa');

    let inserted = 0, updated = 0;
    for (const e of fileData) {
        const payload = {
            IdEmpresa: e.ECODIG,
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
        };

        if (existingIds.has(e.ECODIG)) {
            const { error } = await supabase.from('Empresas').update(payload).eq('IdEmpresa', e.ECODIG);
            if (error) console.error(`Erro ao atualizar empresa ${e.ECODIG}:`, error.message);
            else updated++;
        } else {
            const { error } = await supabase.from('Empresas').insert(payload);
            if (error) console.error(`Erro ao inserir empresa ${e.ECODIG}:`, error.message);
            else inserted++;
        }
    }
    console.log(`Empresas: ${inserted} inseridas, ${updated} atualizadas.`);
}

async function syncDependentes() {
    console.log('\n--- Sincronizando Dependentes (Manual) ---');
    const fileData = JSON.parse(fs.readFileSync('d:/PROJETOS/Sindplast WEB/DataSource/Dependentes.json', 'utf8')).Dependente;
    const existingKeys = await getExistingKeys('Dependentes', 'CodDependente');

    let inserted = 0, updated = 0;
    const batchSize = 50;

    for (let i = 0; i < fileData.length; i += batchSize) {
        const batch = fileData.slice(i, i + batchSize);
        for (const d of batch) {
            const codDep = d.Código?.toString();
            const payload = {
                CodDependente: codDep,
                CodSocio: d.SMAT,
                Dependente: d.DNOME,
                Nascimento: d.DDTNASC,
                Parentesco: d.DTIPO?.toUpperCase(),
                Carteira: d.DCARTEIRA,
                Status: true,
                Cadastrante: 'Sincronização Automática'
            };

            if (existingKeys.has(codDep)) {
                const { error } = await supabase.from('Dependentes').update(payload).eq('CodDependente', codDep);
                if (error) console.error(`Erro ao atualizar dependente ${codDep}:`, error.message);
                else updated++;
            } else {
                const { error } = await supabase.from('Dependentes').insert(payload);
                if (error) console.error(`Erro ao inserir dependente ${codDep}:`, error.message);
                else inserted++;
            }
        }
        process.stdout.write('.');
    }
    console.log(`\nDependentes: ${inserted} inseridos, ${updated} atualizados.`);
}

async function main() {
    try {
        await syncEmpresas();
        await syncSocios();
        await syncDependentes();
        console.log('\n🌟 Sincronização manual concluída!');
    } catch (err) {
        console.error('Falha crítica:', err.message);
    }
}

main();
