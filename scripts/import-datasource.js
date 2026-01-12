const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase URL or Service Role Key in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'SINDPLAST' },
    auth: { persistSession: false, autoRefreshToken: false },
})

const DATA_DIR = path.resolve(__dirname, '../DataSource')
const EMPRESAS_FILE = path.join(DATA_DIR, 'Empresas.json')
const SOCIOS_FILE = path.join(DATA_DIR, 'Socios.json')
const DEPENDENTES_FILE = path.join(DATA_DIR, 'Dependentes.json')

const formatDate = (dateStr) => {
    if (!dateStr) return null
    if (typeof dateStr === 'string' && dateStr.includes('T')) return dateStr.split('T')[0]
    return dateStr
}

const readJson = (filePath) => {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw)
}

async function fetchExistingSet({ table, keyColumn, keys }) {
    const existing = new Set()
    const BATCH = 500

    for (let i = 0; i < keys.length; i += BATCH) {
        const batch = keys.slice(i, i + BATCH)
        const { data, error } = await supabase
            .from(table)
            .select(keyColumn)
            .in(keyColumn, batch)

        if (error) throw error
        for (const row of data || []) {
            existing.add(String(row[keyColumn]))
        }
    }

    return existing
}

async function migrateEmpresasIncremental() {
    console.log('📦 Import incremental: Empresas...')
    const json = readJson(EMPRESAS_FILE)
    const empresas = json?.Empresa || []

    const cods = empresas.map((e) => String(e.ECODIG))
    const existing = await fetchExistingSet({ table: 'Empresas', keyColumn: 'CodEmpresa', keys: cods })

    const toInsert = []
    for (const emp of empresas) {
        const cod = String(emp.ECODIG)
        if (existing.has(cod)) continue

        toInsert.push({
            CodEmpresa: cod,
            RazaoSocial: emp.ENOME,
            CNPJ: emp.ECGC,
            NFuncionarios: emp.ENFUNC,
            Endereco: emp.EEND,
            Bairro: emp.EBAIRRO,
            Cidade: emp.ECID,
            CEP: emp.ECEP,
            UF: emp.EESTADO,
            Telefone01: emp.EFONE1 != null ? String(emp.EFONE1) : null,
            Telefone02: emp.EFONE2 != null ? String(emp.EFONE2) : null,
            Fax: emp.EFAX != null ? String(emp.EFAX) : null,
            Observacao: emp.EOBS,
            DataContribuicao: formatDate(emp.EDTCON),
            ValorContribuicao: emp.EVALOR,
            Cadastrante: 'IMPORT DATASOURCE',
        })
    }

    if (toInsert.length === 0) {
        console.log('✅ Empresas: nada a inserir.')
        return
    }

    const CHUNK = 200
    let inserted = 0
    for (let i = 0; i < toInsert.length; i += CHUNK) {
        const chunk = toInsert.slice(i, i + CHUNK)
        const { error } = await supabase.from('Empresas').insert(chunk)
        if (error) throw error
        inserted += chunk.length
        console.log(`   +${inserted}/${toInsert.length} empresas inseridas...`)
    }

    console.log(`✅ Empresas inseridas: ${inserted}`)
}

function buildSocioMapFromJson(sociosJson) {
    // Map Matricula(SMAT) => { nome, empresaRazaoSocial, codEmpresa }
    const map = new Map()
    for (const s of sociosJson) {
        const matricula = String(s.SMAT)
        map.set(matricula, {
            nome: s.SNOME ?? null,
            empresaRazaoSocial: s.ENOME ?? null,
            codEmpresa: s.ECODIG != null ? String(s.ECODIG) : null,
        })
    }
    return map
}

async function migrateSociosIncremental() {
    console.log('👥 Import incremental: Sócios...')
    const json = readJson(SOCIOS_FILE)
    const socios = json?.Socio || []

    const matriculas = socios.map((s) => String(s.SMAT))
    const existing = await fetchExistingSet({ table: 'Socios', keyColumn: 'Matricula', keys: matriculas })

    const toInsert = []
    for (const socio of socios) {
        const matricula = String(socio.SMAT)
        if (existing.has(matricula)) continue

        toInsert.push({
            Matricula: matricula,
            Nome: socio.SNOME,
            Nascimento: formatDate(socio.SDNASC),
            Sexo: socio.SSEXO,
            Endereco: socio.SEND,
            Bairro: socio.SBAIRRO,
            CEP: socio.SCEP != null ? String(socio.SCEP) : null,
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
            CodEmpresa: socio.ECODIG != null ? String(socio.ECODIG) : null,
            RazaoSocial: socio.ENOME,
            Status: socio.SATIV ? 'ATIVO' : 'INATIVO',
            Carteira: socio.SCARTEIRA || false,
            Carta: socio.SCARTA || false,
            Ficha: socio.SFICHA || false,
            MotivoDemissao: socio.SMOTDEM,
            DataDemissao: formatDate(socio.SDATDEM),
            CTPS: socio.SCTPS,
            RG: socio.SIDENT,
            Telefone: socio.SFONE != null ? String(socio.SFONE) : null,
            Cadastrante: 'IMPORT DATASOURCE',
        })
    }

    if (toInsert.length === 0) {
        console.log('✅ Sócios: nada a inserir.')
        return
    }

    const CHUNK = 200
    let inserted = 0
    for (let i = 0; i < toInsert.length; i += CHUNK) {
        const chunk = toInsert.slice(i, i + CHUNK)
        const { error } = await supabase.from('Socios').insert(chunk)
        if (error) throw error
        inserted += chunk.length
        console.log(`   +${inserted}/${toInsert.length} sócios inseridos...`)
    }

    console.log(`✅ Sócios inseridos: ${inserted}`)
}

async function migrateDependentesIncremental() {
    console.log('👶 Import incremental: Dependentes...')
    const json = readJson(DEPENDENTES_FILE)
    const dependentes = json?.Dependente || []

    const sociosJson = readJson(SOCIOS_FILE)?.Socio || []
    const socioMap = buildSocioMapFromJson(sociosJson)

    // Para evitar query por registro, buscamos os existentes por CodSocio em batches
    const codSocios = Array.from(new Set(dependentes.map((d) => Number(d.SMAT)).filter((n) => !Number.isNaN(n))))

    const existingPairs = new Set()
    const BATCH = 200
    for (let i = 0; i < codSocios.length; i += BATCH) {
        const batch = codSocios.slice(i, i + BATCH)
        const { data, error } = await supabase
            .from('Dependentes')
            .select('CodSocio, CodDependente')
            .in('CodSocio', batch)

        if (error) throw error
        for (const row of data || []) {
            existingPairs.add(`${row.CodSocio}-${row.CodDependente}`)
        }
    }

    const toInsert = []
    for (const dep of dependentes) {
        const codDependente = dep['Código']
        const codSocio = dep.SMAT

        if (codDependente == null || codSocio == null) continue

        const key = `${codSocio}-${codDependente}`
        if (existingPairs.has(key)) continue

        const matricula = String(codSocio)
        const socioInfo = socioMap.get(matricula)

        toInsert.push({
            CodDependente: Number(codDependente),
            CodSocio: Number(codSocio),
            Socio: socioInfo?.nome ?? null,
            Empresa: socioInfo?.empresaRazaoSocial ?? null,
            Dependente: dep.DNOME,
            Nascimento: formatDate(dep.DDTNASC),
            Parentesco: dep.DTIPO,
            Carteira: dep.DCARTEIRA || false,
            DataCadastro: formatDate(dep.DDTCAD),
            Cadastrante: 'IMPORT DATASOURCE',
            Status: true,
        })
    }

    if (toInsert.length === 0) {
        console.log('✅ Dependentes: nada a inserir.')
        return
    }

    const CHUNK = 200
    let inserted = 0
    for (let i = 0; i < toInsert.length; i += CHUNK) {
        const chunk = toInsert.slice(i, i + CHUNK)
        const { error } = await supabase.from('Dependentes').insert(chunk)
        if (error) throw error
        inserted += chunk.length
        console.log(`   +${inserted}/${toInsert.length} dependentes inseridos...`)
    }

    console.log(`✅ Dependentes inseridos: ${inserted}`)
}

async function run() {
    console.log('🚀 Import incremental (DataSource) via Supabase Service Role')

    await migrateEmpresasIncremental()
    await migrateSociosIncremental()
    await migrateDependentesIncremental()

    console.log('🏁 Import concluído!')
}

run().catch((e) => {
    console.error('❌ Import failed:', e)
    process.exit(1)
})
