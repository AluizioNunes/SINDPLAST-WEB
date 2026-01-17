import { supabase } from '@/lib/supabase';
import { mapEmpresaRow } from '@/lib/mappers/empresa';
import { Empresa } from '@/lib/types/empresa';
import { uploadPublicFile } from '@/lib/upload/uploadPublicFile';

interface GetEmpresasOptions {
    page?: number;
    limit?: number | 'all';
    search?: string;
    sortBy?: 'id' | 'codEmpresa' | 'razaoSocial' | 'nomeFantasia' | 'cnpj' | 'cidade' | 'uf' | 'nFuncionarios';
    sortDir?: 'asc' | 'desc';
}

export async function getEmpresas({
    page = 1,
    limit = 50,
    search = '',
    sortBy = 'id',
    sortDir = 'desc',
}: GetEmpresasOptions = {}): Promise<{ data: Empresa[], total: number, pages: number }> {
    const applySearch = (q: any): any => {
        if (!search) return q;
        const term = `%${search}%`;
        return q.or(`RazaoSocial.ilike.${term},NomeFantasia.ilike.${term},CNPJ.ilike.${term}`);
    };

    const sortColumnByKey: Record<NonNullable<GetEmpresasOptions['sortBy']>, string> = {
        id: 'IdEmpresa',
        codEmpresa: 'CodEmpresa',
        razaoSocial: 'RazaoSocial',
        nomeFantasia: 'NomeFantasia',
        cnpj: 'CNPJ',
        cidade: 'Cidade',
        uf: 'UF',
        nFuncionarios: 'NFuncionarios',
    };

    const primarySortColumn = sortColumnByKey[sortBy] || 'IdEmpresa';
    const primaryAscending = sortDir === 'asc';

    if (limit === 'all') {
        const head = await applySearch(
            supabase.from('Empresas').select('IdEmpresa', { count: 'exact', head: true })
        );
        if (head.error) {
            console.error('Error counting empresas:', head.error);
            throw new Error('Failed to fetch empresas');
        }

        const total = head.count || 0;
        const chunkSize = 1000;
        const chunks = Math.max(1, Math.ceil(total / chunkSize));
        const allRows: any[] = [];

        for (let i = 0; i < chunks; i++) {
            const from = i * chunkSize;
            const to = Math.min(total - 1, from + chunkSize - 1);

            const res = await applySearch(
                supabase.from('Empresas').select('*')
            )
                .order(primarySortColumn, { ascending: primaryAscending })
                .order('IdEmpresa', { ascending: false })
                .range(from, to);

            if (res.error) {
                console.error('Error fetching empresas chunk:', res.error);
                throw new Error('Failed to fetch empresas');
            }

            allRows.push(...(res.data || []));
        }

        const empresas = allRows.map((row: Record<string, unknown>) => mapEmpresaRow(row));
        return { data: empresas, total, pages: total > 0 ? 1 : 0 };
    }

    const safeLimit = Math.max(1, limit);
    const from = (page - 1) * safeLimit;
    const to = from + safeLimit - 1;

    const { data, count, error } = await applySearch(
        supabase.from('Empresas').select('*', { count: 'exact' })
    )
        .order(primarySortColumn, { ascending: primaryAscending })
        .order('IdEmpresa', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching empresas:', error);
        throw new Error('Failed to fetch empresas');
    }

    const empresas = (data || []).map((row: Record<string, unknown>) => mapEmpresaRow(row));
    const total = count || 0;
    const pages = Math.ceil(total / safeLimit);

    return { data: empresas, total, pages };
}

export async function getEmpresaById(id: number): Promise<Empresa | null> {
    const { data, error } = await supabase
        .from('Empresas')
        .select('*')
        .eq('IdEmpresa', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }

    return mapEmpresaRow(data as Record<string, unknown>);
}

export async function createEmpresa(empresaData: Partial<Empresa>): Promise<Empresa> {
    const dbData = {
        CodEmpresa: empresaData.codEmpresa,
        CNPJ: empresaData.cnpj,
        RazaoSocial: empresaData.razaoSocial,
        NomeFantasia: empresaData.nomeFantasia,
        Endereco: empresaData.endereco,
        Numero: empresaData.numero,
        Complemento: empresaData.complemento,
        Bairro: empresaData.bairro,
        CEP: empresaData.cep,
        Cidade: empresaData.cidade,
        UF: empresaData.uf,
        Telefone01: empresaData.telefone01,
        Telefone02: empresaData.telefone02,
        Fax: empresaData.fax,
        Celular: empresaData.celular,
        WhatsApp: empresaData.whatsapp,
        Instagram: empresaData.instagram,
        Linkedin: empresaData.linkedin,
        NFuncionarios: empresaData.nFuncionarios,
        DataContribuicao: empresaData.dataContribuicao,
        ValorContribuicao: empresaData.valorContribuicao,
        Cadastrante: (await supabase.auth.getUser()).data.user?.email || 'Sistema',
        Observacao: empresaData.observacao,
    };

    const { data, error } = await supabase
        .from('Empresas')
        .insert(dbData)
        .select()
        .single();

    if (error) throw error;
    return mapEmpresaRow(data as Record<string, unknown>);
}

export async function updateEmpresa(id: number, empresaData: Partial<Empresa>): Promise<Empresa> {
    const dbData = {
        CodEmpresa: empresaData.codEmpresa,
        CNPJ: empresaData.cnpj,
        RazaoSocial: empresaData.razaoSocial,
        NomeFantasia: empresaData.nomeFantasia,
        Endereco: empresaData.endereco,
        Numero: empresaData.numero,
        Complemento: empresaData.complemento,
        Bairro: empresaData.bairro,
        CEP: empresaData.cep,
        Cidade: empresaData.cidade,
        UF: empresaData.uf,
        Telefone01: empresaData.telefone01,
        Telefone02: empresaData.telefone02,
        Fax: empresaData.fax,
        Celular: empresaData.celular,
        WhatsApp: empresaData.whatsapp,
        Instagram: empresaData.instagram,
        Linkedin: empresaData.linkedin,
        NFuncionarios: empresaData.nFuncionarios,
        DataContribuicao: empresaData.dataContribuicao,
        ValorContribuicao: empresaData.valorContribuicao,
        Observacao: empresaData.observacao,
    };

    const { data, error } = await supabase
        .from('Empresas')
        .update(dbData)
        .eq('IdEmpresa', id)
        .select()
        .single();

    if (error) throw error;
    return mapEmpresaRow(data as Record<string, unknown>);
}

export async function deleteEmpresa(id: number): Promise<void> {
    const { error } = await supabase
        .from('Empresas')
        .delete()
        .eq('IdEmpresa', id);

    if (error) throw error;
}

export type EmpresasChartsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'range';

export async function getEmpresasStats(): Promise<{
    total: number;
    ufs: number;
    totalFuncionarios: number;
    totalContribuicao: number;
}> {
    const head = await supabase.from('Empresas').select('IdEmpresa', { count: 'exact', head: true });
    if (head.error) {
        console.error('Error counting empresas stats:', head.error);
        throw new Error('Failed to fetch empresas stats');
    }

    const total = head.count || 0;
    const chunkSize = 1000;
    const chunks = Math.max(1, Math.ceil(total / chunkSize));
    let totalFuncionarios = 0;
    let totalContribuicao = 0;
    const ufSet = new Set<string>();

    for (let i = 0; i < chunks; i++) {
        const from = i * chunkSize;
        const to = Math.min(total - 1, from + chunkSize - 1);

        const res = await supabase
            .from('Empresas')
            .select('UF,NFuncionarios,ValorContribuicao')
            .order('IdEmpresa', { ascending: false })
            .range(from, to);

        if (res.error) {
            console.error('Error fetching empresas stats chunk:', res.error);
            throw new Error('Failed to fetch empresas stats');
        }

        (res.data || []).forEach((r: any) => {
            const uf = String(r?.UF || '').toUpperCase().trim();
            if (uf) ufSet.add(uf);
            totalFuncionarios += Number(r?.NFuncionarios) || 0;
            totalContribuicao += Number(r?.ValorContribuicao) || 0;
        });
    }

    return {
        total,
        ufs: ufSet.size,
        totalFuncionarios,
        totalContribuicao,
    };
}

export async function getEmpresasChartsData(
    opts: { period?: EmpresasChartsPeriod; dateFrom?: string | null; dateTo?: string | null } = {}
): Promise<{
    evolution: { labels: string[]; cadastradas: number[]; contribuintes: number[]; funcionarios: number[] };
    byUf: Array<{ name: string; value: number }>;
    byCidade: Array<{ name: string; value: number }>;
}> {
    const pick = 'IdEmpresa,DataCadastro,UF,Cidade,NFuncionarios,ValorContribuicao';

    const head = await supabase.from('Empresas').select('IdEmpresa', { count: 'exact', head: true });
    if (head.error) {
        console.error('Error counting empresas charts data:', head.error);
        throw new Error('Failed to fetch empresas charts data');
    }

    const total = head.count || 0;
    const chunkSize = 1000;
    const chunks = Math.max(1, Math.ceil(total / chunkSize));
    const allRows: any[] = [];

    for (let i = 0; i < chunks; i++) {
        const from = i * chunkSize;
        const to = Math.min(total - 1, from + chunkSize - 1);

        const res = await supabase
            .from('Empresas')
            .select(pick)
            .order('IdEmpresa', { ascending: false })
            .range(from, to);

        if (res.error) {
            console.error('Error fetching empresas charts chunk:', res.error);
            throw new Error('Failed to fetch empresas charts data');
        }

        allRows.push(...(res.data || []));
    }

    const rows = (allRows || []) as Array<{
        IdEmpresa?: number | null;
        DataCadastro?: string | null;
        UF?: string | null;
        Cidade?: string | null;
        NFuncionarios?: number | null;
        ValorContribuicao?: number | null;
    }>;

    const period: EmpresasChartsPeriod = opts.period || 'daily';
    const now = new Date();

    const pad2 = (n: number) => String(n).padStart(2, '0');
    const dateKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    const monthKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
    const clampStartOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const clampEndOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    const startOfWeek = (d: Date) => {
        const day = d.getDay();
        const diff = (day + 6) % 7;
        const res = new Date(d);
        res.setDate(d.getDate() - diff);
        return clampStartOfDay(res);
    };

    const parseDbTimestamp = (value: string | null | undefined): Date | null => {
        if (!value) return null;
        const s = String(value).trim();
        if (!s) return null;
        const d = new Date(s);
        if (!Number.isNaN(d.getTime())) return d;
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
        if (m) {
            const year = Number(m[1]);
            const month = Number(m[2]) - 1;
            const day = Number(m[3]);
            const hh = Number(m[4]);
            const mm = Number(m[5]);
            const ss = Number(m[6] || 0);
            const d2 = new Date(year, month, day, hh, mm, ss);
            return Number.isNaN(d2.getTime()) ? null : d2;
        }
        return null;
    };

    let windowStart: Date | null = null;
    let windowEnd: Date | null = null;
    let bucket: 'day' | 'week' | 'month' | 'year' = 'day';

    if (period === 'range') {
        windowStart = opts.dateFrom ? clampStartOfDay(new Date(opts.dateFrom)) : null;
        windowEnd = opts.dateTo ? clampEndOfDay(new Date(opts.dateTo)) : null;
        bucket = 'day';
    } else if (period === 'daily') {
        windowStart = clampStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13));
        windowEnd = clampEndOfDay(now);
        bucket = 'day';
    } else if (period === 'weekly') {
        windowStart = clampStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7 * 11));
        windowEnd = clampEndOfDay(now);
        bucket = 'week';
    } else if (period === 'monthly') {
        windowStart = clampStartOfDay(new Date(now.getFullYear(), now.getMonth() - 11, 1));
        windowEnd = clampEndOfDay(now);
        bucket = 'month';
    } else {
        windowStart = clampStartOfDay(new Date(now.getFullYear() - 7, 0, 1));
        windowEnd = clampEndOfDay(now);
        bucket = 'year';
    }

    const start = windowStart || clampStartOfDay(now);
    const end = windowEnd || clampEndOfDay(now);

    const slots: Array<{ key: string; label: string }> = [];
    if (bucket === 'year') {
        for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
            slots.push({ key: String(y), label: String(y) });
        }
    } else if (bucket === 'day') {
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

    const map = new Map<string, { cadastradas: number; contribuintes: number; funcionarios: number }>();
    slots.forEach((s) => map.set(s.key, { cadastradas: 0, contribuintes: 0, funcionarios: 0 }));

    const ufMap = new Map<string, number>();
    const cidadeMap = new Map<string, number>();

    rows.forEach((r) => {
        const uf = (r.UF || 'SEM UF').toString().toUpperCase().trim();
        const cidade = (r.Cidade || 'SEM CIDADE').toString().toUpperCase().trim();
        ufMap.set(uf, (ufMap.get(uf) || 0) + 1);
        cidadeMap.set(cidade, (cidadeMap.get(cidade) || 0) + 1);

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

        slot.cadastradas += 1;
        if ((Number(r.ValorContribuicao) || 0) > 0) slot.contribuintes += 1;
        slot.funcionarios += Number(r.NFuncionarios) || 0;
    });

    const toSorted = (m: Map<string, number>, top?: number) =>
        Array.from(m.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, top ?? undefined);

    return {
        evolution: {
            labels: slots.map((s) => s.label),
            cadastradas: slots.map((s) => map.get(s.key)?.cadastradas || 0),
            contribuintes: slots.map((s) => map.get(s.key)?.contribuintes || 0),
            funcionarios: slots.map((s) => map.get(s.key)?.funcionarios || 0),
        },
        byUf: toSorted(ufMap, 10),
        byCidade: toSorted(cidadeMap, 10),
    };
}

export async function uploadEmpresaImage(empresaId: number, file: Blob): Promise<string> {
    const ext = (file as any).name?.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
    const path = `empresas/${empresaId}/${Date.now()}.${safeExt}`;

    return uploadPublicFile({
        bucket: 'empresas-images',
        path,
        file,
        contentType: (file as any).type || 'image/jpeg',
        upsert: true,
    });
}

export async function updateEmpresaImage(id: number, imagem: string | null): Promise<void> {
    const { error } = await supabase
        .from('Empresas')
        .update({ Imagem: imagem })
        .eq('IdEmpresa', id);
    if (error) throw error;
}
