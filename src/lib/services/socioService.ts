import { supabase } from '@/lib/supabase';
import { mapSocioRow } from '@/lib/mappers/socio';
import { Socio } from '@/lib/types/socio';
import { uploadPublicFile } from '@/lib/upload/uploadPublicFile';

interface GetSociosOptions {
    page?: number;
    limit?: number | 'all';
    search?: string;
    sortBy?: 'matricula' | 'nome' | 'status' | 'id';
    sortDir?: 'asc' | 'desc';
}

export async function getSocios({
    page = 1,
    limit = 50,
    search = '',
    sortBy = 'id',
    sortDir = 'desc',
}: GetSociosOptions = {}): Promise<{ data: Socio[], total: number, pages: number }> {
    const applySearch = (q: any): any => {
        if (!search) return q;
        const term = `*${search}*`;
        return q.or(`Nome.ilike.${term},CPF.ilike.${term},Matricula.ilike.${term}`);
    };

    const sortColumnMap: Record<NonNullable<GetSociosOptions['sortBy']>, string> = {
        id: 'IdSocio',
        matricula: 'Matricula',
        nome: 'Nome',
        status: 'Status',
    };
    const primarySortColumn = sortColumnMap[sortBy] || 'IdSocio';
    const primaryAscending = sortDir === 'asc';

    if (limit === 'all') {
        const { count, error: countError } = await applySearch(
            supabase.from('Socios').select('*', { count: 'exact', head: true })
        );
        if (countError) {
            console.error('Error counting socios:', countError);
            throw new Error('Failed to fetch socios');
        }

        const total = count || 0;
        const chunkSize = 1000;
        const chunks = Math.ceil(total / chunkSize);
        const allRows: Record<string, unknown>[] = [];

        for (let i = 0; i < chunks; i++) {
            const from = i * chunkSize;
            const to = Math.min(total - 1, from + chunkSize - 1);

            const { data, error } = await applySearch(supabase.from('Socios').select('*'))
                .order(primarySortColumn, { ascending: primaryAscending })
                .order('IdSocio', { ascending: false })
                .range(from, to);

            if (error) {
                console.error('Error fetching socios:', error);
                throw new Error('Failed to fetch socios');
            }

            allRows.push(...((data as any) || []));
        }

        const socios = allRows.map((row) => mapSocioRow(row));
        return { data: socios, total, pages: total > 0 ? 1 : 0 };
    }

    const safeLimit = Math.max(1, limit);
    const from = (page - 1) * safeLimit;
    const to = from + safeLimit - 1;

    const { data, count, error } = await applySearch(
        supabase.from('Socios').select('*', { count: 'exact' })
    )
        .order(primarySortColumn, { ascending: primaryAscending })
        .order('IdSocio', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching socios:', error);
        throw new Error('Failed to fetch socios');
    }

    const socios = (data || []).map((row: Record<string, unknown>) => mapSocioRow(row));
    const total = count || 0;
    const pages = Math.ceil(total / safeLimit);

    return { data: socios, total, pages };
}

export async function getSocioById(id: number): Promise<Socio | null> {
    const { data, error } = await supabase
        .from('Socios')
        .select('*')
        .eq('IdSocio', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return mapSocioRow(data as Record<string, unknown>);
}

export async function createSocio(socioData: Partial<Socio>): Promise<Socio> {
    // Mapeamento inverso poderia ser necessário aqui se os campos do banco diferem muito dos tipos
    // Assumindo que o Supabase aceita as chaves como estão ou precisamos de um mapper reverso.
    // O código original fazia um insert manual campo a campo. Vamos simplificar, mas manter a segurança.
    
    const dbData = {
        Nome: socioData.nome,
        CPF: socioData.cpf,
        RG: socioData.rg,
        // ... mapear todos os campos necessários
        Status: socioData.status,
        Cadastrante: (await supabase.auth.getUser()).data.user?.email || 'Sistema',
        Imagem: socioData.imagem,
        // Adicionar outros campos conforme necessário, baseando-se no original POST
        Emissor: socioData.emissor,
        Nascimento: socioData.nascimento,
        Sexo: socioData.sexo,
        Naturalidade: socioData.naturalidade,
        NaturalidadeUF: socioData.naturalidadeUF,
        Nacionalidade: socioData.nacionalidade,
        EstadoCivil: socioData.estadoCivil,
        Endereco: socioData.endereco,
        Complemento: socioData.complemento,
        Bairro: socioData.bairro,
        CEP: socioData.cep,
        Cidade: socioData.cidade,
        UF: socioData.uf,
        Celular: socioData.celular,
        Email: socioData.email,
        RedeSocial: socioData.redeSocial,
        LinkRedeSocial: socioData.linkRedeSocial,
        Pai: socioData.pai,
        Mae: socioData.mae,
        Matricula: socioData.matricula,
        DataMensalidade: socioData.dataMensalidade,
        ValorMensalidade: socioData.valorMensalidade,
        DataAdmissao: socioData.dataAdmissao,
        CTPS: socioData.ctps,
        Funcao: socioData.funcao,
        CodEmpresa: socioData.codEmpresa,
        CNPJ: socioData.cnpj,
        RazaoSocial: socioData.razaoSocial,
        NomeFantasia: socioData.nomeFantasia,
        DataDemissao: socioData.dataDemissao,
        MotivoDemissao: socioData.motivoDemissao,
        Carta: socioData.carta,
        Carteira: socioData.carteira,
        Ficha: socioData.ficha,
        Observacao: socioData.observacao,
        Telefone: socioData.telefone
    };

    const { data, error } = await supabase
        .from('Socios')
        .insert(dbData)
        .select()
        .single();

    if (error) throw error;
    return mapSocioRow(data as Record<string, unknown>);
}

export async function uploadSocioImage(socioId: number, file: Blob): Promise<string> {
    const ext = (file as any).name?.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
    const path = `socios/${socioId}/${Date.now()}.${safeExt}`;

    return uploadPublicFile({
        bucket: 'socios-images',
        path,
        file,
        contentType: (file as any).type || 'image/jpeg',
        upsert: true,
    });
}

export async function updateSocioImage(id: number, imagem: string | null): Promise<void> {
    const { error } = await supabase
        .from('Socios')
        .update({ Imagem: imagem })
        .eq('IdSocio', id);
    if (error) throw error;
}

export type SociosChartsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'range';

export async function getSociosChartsData(opts: { period?: SociosChartsPeriod; dateFrom?: string | null; dateTo?: string | null } = {}): Promise<{
    evolution: { labels: string[]; cadastrados: number[]; ativos: number[]; inativos: number[] };
    bySexo: Array<{ name: string; value: number }>;
    bySetor: Array<{ name: string; value: number }>;
    byEmpresa: Array<{ name: string; value: number }>;
}> {
    const pick = 'IdSocio,DataCadastro,Status,Sexo,Setor,NomeFantasia,RazaoSocial';

    const head = await supabase.from('Socios').select('IdSocio', { count: 'exact', head: true });
    if (head.error) {
        console.error('Error counting socios charts data:', head.error);
        throw new Error('Failed to fetch socios charts data');
    }

    const total = head.count || 0;
    const chunkSize = 1000;
    const chunks = Math.max(1, Math.ceil(total / chunkSize));
    const allRows: any[] = [];

    for (let i = 0; i < chunks; i++) {
        const from = i * chunkSize;
        const to = Math.min(total - 1, from + chunkSize - 1);

        const res = await supabase
            .from('Socios')
            .select(pick)
            .order('IdSocio', { ascending: false })
            .range(from, to);

        if (res.error) {
            const fallback = await supabase
                .from('Socios')
                .select('*')
                .order('IdSocio', { ascending: false })
                .range(from, to);

            if (fallback.error) {
                console.error('Error fetching socios charts data:', fallback.error);
                throw new Error('Failed to fetch socios charts data');
            }

            allRows.push(...(fallback.data || []));
            continue;
        }

        allRows.push(...(res.data || []));
    }

    const rows = (allRows || []) as Array<{
        IdSocio?: number | null;
        DataCadastro?: string | null;
        Status?: string | null;
        Sexo?: string | null;
        Setor?: string | null;
        NomeFantasia?: string | null;
        RazaoSocial?: string | null;
    }>;

    const period: SociosChartsPeriod = opts.period || 'daily';
    const now = new Date();

    const pad2 = (n: number) => String(n).padStart(2, '0');
    const dateKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    const monthKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
    const clampStartOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const clampEndOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    const parseDbTimestamp = (value: string) => {
        const raw = String(value || '').trim();
        if (!raw) return null;
        const dateOnlyBr = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
        if (dateOnlyBr) {
            const dd = Number(dateOnlyBr[1]);
            const mm = Number(dateOnlyBr[2]);
            const yyyy = Number(dateOnlyBr[3]);
            const d = new Date(yyyy, mm - 1, dd, 0, 0, 0, 0);
            return Number.isNaN(d.getTime()) ? null : d;
        }

        const needsUtc =
            /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(raw) &&
            !/[zZ]|[+-]\d{2}:\d{2}$/.test(raw);

        const direct = new Date(needsUtc ? raw.replace(' ', 'T') + 'Z' : raw);
        if (!Number.isNaN(direct.getTime())) return direct;
        const normalized = raw.replace(' ', 'T');
        const d2 = new Date(needsUtc ? normalized + 'Z' : normalized);
        if (!Number.isNaN(d2.getTime())) return d2;
        return null;
    };
    const startOfWeek = (d: Date) => {
        const day = d.getDay(); // 0..6 (Sun..Sat)
        const diff = (day + 6) % 7; // Monday=0
        return new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff, 0, 0, 0, 0);
    };

    const slots: Array<{ key: string; label: string }> = [];
    let bucket: 'day' | 'week' | 'month' | 'year' = 'day';
    let windowStart: Date | null = null;
    let windowEnd: Date | null = null;

    if (period === 'daily') {
        bucket = 'day';
        const end = clampEndOfDay(now);
        const start = clampStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13));
        windowStart = start;
        windowEnd = end;
        for (let i = 13; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            slots.push({ key: dateKey(d), label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) });
        }
    } else if (period === 'weekly') {
        bucket = 'week';
        const end = clampEndOfDay(now);
        const start = startOfWeek(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7 * 11));
        windowStart = start;
        windowEnd = end;
        for (let i = 11; i >= 0; i--) {
            const d = startOfWeek(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7 * i));
            slots.push({ key: dateKey(d), label: `SEM ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` });
        }
    } else if (period === 'monthly') {
        bucket = 'month';
        const end = clampEndOfDay(now);
        const start = new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0, 0);
        windowStart = start;
        windowEnd = end;
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            slots.push({
                key: monthKey(d),
                label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            });
        }
    } else if (period === 'yearly') {
        bucket = 'year';
        const end = clampEndOfDay(now);
        const start = new Date(now.getFullYear() - 4, 0, 1, 0, 0, 0, 0);
        windowStart = start;
        windowEnd = end;
        for (let i = 4; i >= 0; i--) {
            const y = now.getFullYear() - i;
            slots.push({ key: String(y), label: String(y) });
        }
    } else {
        const from = opts.dateFrom ? new Date(opts.dateFrom) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        const to = opts.dateTo ? new Date(opts.dateTo) : now;
        const start = clampStartOfDay(from);
        const end = clampEndOfDay(to);
        windowStart = start;
        windowEnd = end;

        const diffDays = Math.max(0, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
        if (diffDays <= 45) bucket = 'day';
        else if (diffDays <= 180) bucket = 'week';
        else bucket = 'month';

        if (bucket === 'day') {
            for (let t = start.getTime(); t <= end.getTime(); t += 24 * 60 * 60 * 1000) {
                const d = new Date(t);
                slots.push({ key: dateKey(d), label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) });
            }
        } else if (bucket === 'week') {
            const startW = startOfWeek(start);
            for (let t = startW.getTime(); t <= end.getTime(); t += 7 * 24 * 60 * 60 * 1000) {
                const d = new Date(t);
                slots.push({ key: dateKey(d), label: `SEM ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` });
            }
        } else {
            const startM = new Date(start.getFullYear(), start.getMonth(), 1, 0, 0, 0, 0);
            const endM = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 0);
            for (let d = new Date(startM); d <= endM; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
                slots.push({
                    key: monthKey(d),
                    label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
                });
            }
        }
    }

    const map = new Map<string, { cadastrados: number; ativos: number; inativos: number }>();
    slots.forEach((s) => map.set(s.key, { cadastrados: 0, ativos: 0, inativos: 0 }));

    const sexoMap = new Map<string, number>();
    const setorMap = new Map<string, number>();
    const empresaMap = new Map<string, number>();

    rows.forEach((r) => {
        const status = (r.Status || 'INDEFINIDO').toString().toUpperCase().trim();
        const sexo = (r.Sexo || 'NÃO INFORMADO').toString().toUpperCase().trim();
        const setor = (r.Setor || 'SEM SETOR').toString().toUpperCase().trim();
        const empresa = (r.NomeFantasia || r.RazaoSocial || 'SEM EMPRESA').toString().toUpperCase().trim();

        sexoMap.set(sexo, (sexoMap.get(sexo) || 0) + 1);
        setorMap.set(setor, (setorMap.get(setor) || 0) + 1);
        empresaMap.set(empresa, (empresaMap.get(empresa) || 0) + 1);

        if (!r.DataCadastro) return;
        const d = parseDbTimestamp(r.DataCadastro);
        if (!d) return;
        if (windowStart && d < windowStart) return;
        if (windowEnd && d > windowEnd) return;

        let key = '';
        if (bucket === 'day') key = dateKey(d);
        else if (bucket === 'week') key = dateKey(startOfWeek(d));
        else if (bucket === 'month') key = monthKey(d);
        else key = String(d.getFullYear());
        const slot = map.get(key);
        if (!slot) return;
        slot.cadastrados += 1;
        if (status === 'ATIVO') slot.ativos += 1;
        if (status === 'INATIVO') slot.inativos += 1;
    });

    const toSorted = (m: Map<string, number>, top?: number) =>
        Array.from(m.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, top ?? undefined);

    return {
        evolution: {
            labels: slots.map((s) => s.label),
            cadastrados: slots.map((s) => map.get(s.key)?.cadastrados || 0),
            ativos: slots.map((s) => map.get(s.key)?.ativos || 0),
            inativos: slots.map((s) => map.get(s.key)?.inativos || 0),
        },
        bySexo: toSorted(sexoMap),
        bySetor: toSorted(setorMap, 10),
        byEmpresa: toSorted(empresaMap, 10),
    };
}

export async function getSocioStats() {
    const [totalRes, ativosRes, masculinosRes, femininosRes] = await Promise.all([
        supabase.from('Socios').select('*', { count: 'exact', head: true }),
        supabase.from('Socios').select('*', { count: 'exact', head: true }).ilike('Status', 'ATIVO*'),
        supabase.from('Socios').select('*', { count: 'exact', head: true }).or('Sexo.ilike.M*,Sexo.eq.M'),
        supabase.from('Socios').select('*', { count: 'exact', head: true }).or('Sexo.ilike.F*,Sexo.eq.F'),
    ]);

    if (totalRes.error) throw new Error(totalRes.error.message || 'Erro ao buscar total de sócios');
    if (ativosRes.error) throw new Error(ativosRes.error.message || 'Erro ao buscar sócios ativos');
    if (masculinosRes.error) throw new Error(masculinosRes.error.message || 'Erro ao buscar sócios masculinos');
    if (femininosRes.error) throw new Error(femininosRes.error.message || 'Erro ao buscar sócios femininos');

    const total = totalRes.count || 0;
    const ativos = ativosRes.count || 0;
    const inativos = Math.max(0, total - ativos);

    return {
        total,
        ativos,
        inativos,
        masculinos: masculinosRes.count || 0,
        femininos: femininosRes.count || 0,
    };
}

export async function socioCpfExists(cpf: string, excludeId?: number): Promise<boolean> {
    const rawDigits = String(cpf || '').replace(/\D/g, '').slice(0, 11);
    if (rawDigits.length !== 11) return false;
    const formatted = `${rawDigits.slice(0, 3)}.${rawDigits.slice(3, 6)}.${rawDigits.slice(6, 9)}-${rawDigits.slice(9, 11)}`;

    const base = supabase.from('Socios').select('IdSocio').limit(1);
    const q1 = excludeId ? base.eq('CPF', formatted).neq('IdSocio', excludeId) : base.eq('CPF', formatted);
    const { data: d1, error: e1 } = await q1;
    if (e1) throw e1;
    if (Array.isArray(d1) && d1.length > 0) return true;

    const q2 = excludeId ? base.eq('CPF', rawDigits).neq('IdSocio', excludeId) : base.eq('CPF', rawDigits);
    const { data: d2, error: e2 } = await q2;
    if (e2) throw e2;
    return Array.isArray(d2) && d2.length > 0;
}

export async function deleteSocio(id: number): Promise<void> {
    const { error } = await supabase
        .from('Socios')
        .delete()
        .eq('IdSocio', id);

    if (error) throw error;
}

export async function updateSocio(id: number, socioData: Partial<Socio>): Promise<Socio> {
    const dbData = {
        Nome: socioData.nome,
        CPF: socioData.cpf,
        RG: socioData.rg,
        Imagem: socioData.imagem,
        Status: socioData.status,
        Emissor: socioData.emissor,
        Nascimento: socioData.nascimento,
        Sexo: socioData.sexo,
        Naturalidade: socioData.naturalidade,
        NaturalidadeUF: socioData.naturalidadeUF,
        Nacionalidade: socioData.nacionalidade,
        EstadoCivil: socioData.estadoCivil,
        Endereco: socioData.endereco,
        Complemento: socioData.complemento,
        Bairro: socioData.bairro,
        CEP: socioData.cep,
        Cidade: socioData.cidade,
        UF: socioData.uf,
        Celular: socioData.celular,
        Email: socioData.email,
        RedeSocial: socioData.redeSocial,
        LinkRedeSocial: socioData.linkRedeSocial,
        Pai: socioData.pai,
        Mae: socioData.mae,
        Matricula: socioData.matricula,
        DataMensalidade: socioData.dataMensalidade,
        ValorMensalidade: socioData.valorMensalidade,
        DataAdmissao: socioData.dataAdmissao,
        CTPS: socioData.ctps,
        Funcao: socioData.funcao,
        CodEmpresa: socioData.codEmpresa,
        CNPJ: socioData.cnpj,
        RazaoSocial: socioData.razaoSocial,
        NomeFantasia: socioData.nomeFantasia,
        DataDemissao: socioData.dataDemissao,
        MotivoDemissao: socioData.motivoDemissao,
        Carta: socioData.carta,
        Carteira: socioData.carteira,
        Ficha: socioData.ficha,
        Observacao: socioData.observacao,
        Telefone: socioData.telefone
    };

    const { data, error } = await supabase
        .from('Socios')
        .update(dbData)
        .eq('IdSocio', id)
        .select()
        .single();

    if (error) throw error;
    return mapSocioRow(data as Record<string, unknown>);
}
