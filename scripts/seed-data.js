
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'SINDPLAST' }
});

// Paths to JSON files
// __dirname is now .../Sindplast WEB/scripts
// We need to go up to .../Sindplast WEB (..) then to SISTEMA LEGADO/Backend/Data
const DATA_DIR = path.resolve(__dirname, '../SISTEMA LEGADO/Backend/Data');
const EMPRESAS_FILE = path.join(DATA_DIR, 'Empresas.json');
const SOCIOS_FILE = path.join(DATA_DIR, 'Socios.json');
const DEPENDENTES_FILE = path.join(DATA_DIR, 'DependentesFinal.json');

// Helper to format dates
const formatDate = (dateStr) => {
    if (!dateStr) return null;
    // Handle "1993-04-22T04:00:00.000Z" -> "1993-04-22"
    if (dateStr.includes('T')) {
        return dateStr.split('T')[0];
    }
    return dateStr;
};

// Helper to read JSON
const readJson = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return null;
    }
};

async function migrateEmpresas() {
    console.log('📦 Migrando Empresas...');
    const data = readJson(EMPRESAS_FILE);
    if (!data || !data.Empresa) return;

    const empresas = data.Empresa;
    let count = 0;
    let errors = 0;

    for (const emp of empresas) {
        const { error } = await supabase.from('Empresas').insert({
            CodEmpresa: String(emp.ECODIG),
            RazaoSocial: emp.ENOME,
            CNPJ: emp.ECGC, // Assuming ECGC is CNPJ, formatting might be needed if strict
            NFuncionarios: emp.ENFUNC,
            Endereco: emp.EEND,
            Bairro: emp.EBAIRRO,
            Cidade: emp.ECID, // ECID includes "/AM" usually
            CEP: emp.ECEP,
            Observacao: emp.EOBS,
            DataCadastro: formatDate(emp.EDTCON),
            ValorContribuicao: emp.EVALOR,
            // Mapping other fields if available or necessary
        });

        if (error) {
            console.error(`❌ Erro ao inserir empresa ${emp.ENOME}:`, error.message);
            errors++;
        } else {
            count++;
        }
    }
    console.log(`✅ Empresas migradas: ${count}. Erros: ${errors}`);
}

async function migrateSocios() {
    console.log('👥 Migrando Sócios...');
    const data = readJson(SOCIOS_FILE);
    if (!data || !data.Socio) return;

    const socios = data.Socio;
    let count = 0;
    let errors = 0;

    // Process in batches to avoid overwhelming the server
    const BATCH_SIZE = 50;
    for (let i = 0; i < socios.length; i += BATCH_SIZE) {
        const batch = socios.slice(i, i + BATCH_SIZE);

        // We insert one by one inside the loop to handle errors individually, 
        // or we could construct a bulk insert if we trust the data.
        // Given the potential for data issues, individual or smaller batches are safer.

        const promises = batch.map(socio => {
            return supabase.from('Socios').insert({
                Matricula: String(socio.SMAT),
                Nome: socio.SNOME,
                Nascimento: formatDate(socio.SDNASC),
                Sexo: socio.SSEXO,
                Endereco: socio.SEND,
                Bairro: socio.SBAIRRO,
                CEP: socio.SCEP,
                Pai: socio.SPAI,
                Mae: socio.SMAE,
                EstadoCivil: socio.SESTCIVIL,
                Naturalidade: socio.SNATURAL,
                DataCadastro: formatDate(socio.SDTC),
                ValorMensalidade: socio.SVALORME,
                DataMensalidade: formatDate(socio.SDATMEN),
                DataAdmissao: formatDate(socio.SDTADMS),
                Funcao: socio.SFUNCAO,
                Observacao: socio.SOBS,
                CodEmpresa: String(socio.ECODIG), // Link to Empresa
                RazaoSocial: socio.ENOME, // Denormalized name
                Status: socio.SATIV ? 'ATIVO' : 'INATIVO',
                Carteira: socio.SCARTEIRA || false,
                Carta: socio.SCARTA || false,
                Ficha: socio.SFICHA || false,
                MotivoDemissao: socio.SMOTDEM,
                DataDemissao: formatDate(socio.SDATDEM),
                CTPS: socio.SCTPS,
                RG: socio.SIDENT,
                Telefone: socio.SFONE,
                Cadastrante: 'SISTEMA DE MIGRAÇÃO'
            }).then(({ error }) => {
                if (error) {
                    // console.error(`❌ Erro sócio ${socio.SNOME}:`, error.message);
                    return 1; // error count
                }
                return 0;
            });
        });

        const results = await Promise.all(promises);
        const batchErrors = results.reduce((a, b) => a + b, 0);
        errors += batchErrors;
        count += (batch.length - batchErrors);

        if (i % 500 === 0) console.log(`   Processado ${i} sócios...`);
    }

    console.log(`✅ Sócios migrados: ${count}. Erros: ${errors}`);
}
async function migrateDependentes() {
    console.log('👶 Migrando Dependentes...');
    // Note: Using DependentesFinal.json as it seems to be the pre-processed version
    const data = readJson(DEPENDENTES_FILE);
    if (!data || !data.Dependentes) return;

    const dependentes = data.Dependentes;
    let count = 0;
    let errors = 0;

    const BATCH_SIZE = 50;
    for (let i = 0; i < dependentes.length; i += BATCH_SIZE) {
        const batch = dependentes.slice(i, i + BATCH_SIZE);

        const promises = batch.map(dep => {
            return supabase.from('Dependentes').insert({
                CodDependente: dep.CodDependente,
                CodSocio: dep.CodSocio, // Links to Socios.Matricula (int)
                Socio: dep.Socio,
                Dependente: dep.Dependente,
                Nascimento: formatDate(dep.Nascimento),
                Parentesco: dep.Parentesco,
                Carteira: dep.Carteira,
                DataCadastro: formatDate(dep.DataCadastro),
                Cadastrante: 'SISTEMA DE MIGRAÇÃO',
                Status: true
            }).then(({ error }) => {
                if (error) {
                    // console.error(`❌ Erro dependente ${dep.Dependente}:`, error.message);
                    return 1;
                }
                return 0;
            });
        });

        const results = await Promise.all(promises);
        const batchErrors = results.reduce((a, b) => a + b, 0);
        errors += batchErrors;
        count += (batch.length - batchErrors);

        if (i % 500 === 0) console.log(`   Processado ${i} dependentes...`);
    }

    console.log(`✅ Dependentes migrados: ${count}. Erros: ${errors}`);
}

async function run() {
    console.log('🚀 Iniciando Migração via Supabase Client...');

    // Clean tables first? Maybe risky if user already has data. 
    // But given the errors, they probably have incomplete data.
    // For now, we append. Duplicate keys might fail, which is dealt with by 'errors'.

    await migrateEmpresas();
    await migrateSocios();
    await migrateDependentes();

    console.log('🏁 Migração Concluída!');
}

run();
