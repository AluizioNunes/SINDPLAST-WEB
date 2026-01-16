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

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))

async function headCount(table, column) {
    const { count, error } = await supabase.from(table).select(column, { head: true, count: 'exact' })
    if (error) throw error
    return count ?? 0
}

async function fetchAllColumn(table, column) {
    const out = []
    const PAGE = 1000
    let from = 0
    while (true) {
        const { data, error } = await supabase.from(table).select(column).range(from, from + PAGE - 1)
        if (error) throw error
        if (!data || data.length === 0) break
        for (const row of data) out.push(row[column])
        if (data.length < PAGE) break
        from += PAGE
    }
    return out
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
        for (const row of data || []) existing.add(String(row[keyColumn]))
    }

    return existing
}

async function validate() {
    const empresasJson = readJson(EMPRESAS_FILE)?.Empresa || []
    const sociosJson = readJson(SOCIOS_FILE)?.Socio || []
    const dependentesJson = readJson(DEPENDENTES_FILE)?.Dependente || []

    const empresaCodes = Array.from(new Set(empresasJson.map((e) => String(e.ECODIG))))
    const socioMatriculas = Array.from(new Set(sociosJson.map((s) => String(s.SMAT))))
    const socioMatriculasSet = new Set(socioMatriculas)
    const dependentePairs = dependentesJson
        .map((d) => {
            const codDependente = d['Código']
            const codSocio = d.SMAT
            if (codDependente == null || codSocio == null) return null
            return { codSocio: Number(codSocio), codDependente: Number(codDependente) }
        })
        .filter(Boolean)

    console.log('🔎 DataSource:')
    console.log(`- Empresas (JSON): ${empresaCodes.length}`)
    console.log(`- Sócios (JSON): ${socioMatriculas.length}`)
    console.log(`- Dependentes (JSON): ${dependentePairs.length}`)

    console.log('\n🔎 Supabase (counts):')
    console.log(`- Empresas: ${await headCount('Empresas', 'IdEmpresa')}`)
    console.log(`- Socios: ${await headCount('Socios', 'IdSocio')}`)
    console.log(`- Dependentes: ${await headCount('Dependentes', 'IdDependente')}`)

    console.log('\n🔗 Validando chaves principais (DataSource → Supabase):')

    const existingEmp = await fetchExistingSet({ table: 'Empresas', keyColumn: 'CodEmpresa', keys: empresaCodes })
    const missingEmp = empresaCodes.filter((c) => !existingEmp.has(String(c)))
    console.log(`- Empresas faltando no Supabase por CodEmpresa: ${missingEmp.length}`)
    if (missingEmp.length) console.log(`  Exemplo: ${missingEmp.slice(0, 10).join(', ')}`)

    const existingSoc = await fetchExistingSet({ table: 'Socios', keyColumn: 'Matricula', keys: socioMatriculas })
    const missingSoc = socioMatriculas.filter((m) => !existingSoc.has(String(m)))
    console.log(`- Sócios faltando no Supabase por Matricula: ${missingSoc.length}`)
    if (missingSoc.length) console.log(`  Exemplo: ${missingSoc.slice(0, 10).join(', ')}`)

    console.log('\n🔗 Validando relacionamento Dependentes(CodSocio) → Socios(Matricula):')
    const codSocios = Array.from(new Set(dependentePairs.map((p) => p.codSocio)))
    const existingSocByCod = await fetchExistingSet({ table: 'Socios', keyColumn: 'Matricula', keys: codSocios.map(String) })
    const missingCodSocio = codSocios.filter((c) => !existingSocByCod.has(String(c)))
    console.log(`- Dependentes com CodSocio sem Sócio correspondente: ${missingCodSocio.length}`)
    if (missingCodSocio.length) console.log(`  Exemplo: ${missingCodSocio.slice(0, 10).join(', ')}`)

    if (missingCodSocio.length) {
        const missingAlsoInJson = missingCodSocio.filter((c) => !socioMatriculasSet.has(String(c)))
        console.log(`- Destes, CodSocio que também NÃO existem no DataSource/Socios.json: ${missingAlsoInJson.length}`)

        // Detectar caso comum: Matricula armazenada com zeros à esquerda no Supabase
        const allMatriculas = await fetchAllColumn('Socios', 'Matricula')
        const normalized = new Set(
            (allMatriculas || [])
                .filter((m) => m != null)
                .map((m) => String(m).trim().replace(/^0+/, ''))
                .filter((m) => m.length > 0)
        )
        const resolvidosPorZeroPadding = missingCodSocio.filter((c) => normalized.has(String(c)))
        console.log(
            `- CodSocio "órfãos" que EXISTEM no Supabase após normalizar Matricula (remover zeros à esquerda): ${resolvidosPorZeroPadding.length}`
        )

        if (resolvidosPorZeroPadding.length) {
            console.log(`  Exemplo (resolvidos por zero padding): ${resolvidosPorZeroPadding.slice(0, 10).join(', ')}`)
        }
    }

    console.log('\n✅ Validação finalizada. Para checar mismatch de Empresa/joins, use as queries SQL recomendadas no chat.')
}

validate().catch((e) => {
    console.error('❌ Validation failed:', e)
    process.exit(1)
})
