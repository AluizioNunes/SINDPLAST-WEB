import { supabase } from '@/lib/supabase';
import { mapDependenteRow } from '@/lib/mappers/dependente';
import { Dependente } from '@/lib/types/dependente';
import { uploadPublicFile } from '@/lib/upload/uploadPublicFile';

interface GetDependentesOptions {
    page?: number;
    limit?: number | 'all';
    search?: string;
    sortBy?: 'id' | 'dependente' | 'socio' | 'empresa' | 'parentesco' | 'nascimento' | 'carteira' | 'flagOrfao';
    sortDir?: 'asc' | 'desc';
}

export async function getDependentes({
    page = 1,
    limit = 50,
    search = '',
    sortBy = 'id',
    sortDir = 'desc',
}: GetDependentesOptions = {}): Promise<{ data: Dependente[], total: number, pages: number }> {
    const applySearch = (q: any): any => {
        if (!search) return q;
        const term = `%${search}%`;
        return q.or(`Dependente.ilike.${term},Socio.ilike.${term}`);
    };

    const sortColumnByKey: Record<NonNullable<GetDependentesOptions['sortBy']>, string> = {
        id: 'IdDependente',
        dependente: 'Dependente',
        socio: 'Socio',
        empresa: 'Empresa',
        parentesco: 'Parentesco',
        nascimento: 'Nascimento',
        carteira: 'Carteira',
        flagOrfao: 'FlagOrfao',
    };

    const primarySortColumn = sortColumnByKey[sortBy] || 'IdDependente';
    const primaryAscending = sortDir === 'asc';

    if (limit === 'all') {
        const head = await applySearch(
            supabase.from('Dependentes').select('IdDependente', { count: 'exact', head: true })
        );
        if (head.error) {
            console.error('Error counting dependentes:', head.error);
            throw new Error('Failed to fetch dependentes');
        }

        const total = head.count || 0;
        const chunkSize = 1000;
        const chunks = Math.max(1, Math.ceil(total / chunkSize));
        const allRows: any[] = [];

        for (let i = 0; i < chunks; i++) {
            const from = i * chunkSize;
            const to = Math.min(total - 1, from + chunkSize - 1);

            const res = await applySearch(
                supabase.from('Dependentes').select('*')
            )
                .order(primarySortColumn, { ascending: primaryAscending })
                .order('IdDependente', { ascending: false })
                .range(from, to);

            if (res.error) {
                console.error('Error fetching dependentes chunk:', res.error);
                throw new Error('Failed to fetch dependentes');
            }

            allRows.push(...(res.data || []));
        }

        const dependentes = allRows.map((row: Record<string, unknown>) => mapDependenteRow(row));
        return { data: dependentes, total, pages: total > 0 ? 1 : 0 };
    }

    const safeLimit = Math.max(1, limit);
    const from = (page - 1) * safeLimit;
    const to = from + safeLimit - 1;

    const { data, count, error } = await applySearch(
        supabase.from('Dependentes').select('*', { count: 'exact' })
    )
        .order(primarySortColumn, { ascending: primaryAscending })
        .order('IdDependente', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching dependentes:', error);
        throw new Error('Failed to fetch dependentes');
    }

    const dependentes = (data || []).map((row: Record<string, unknown>) => mapDependenteRow(row));
    const total = count || 0;
    const pages = Math.ceil(total / safeLimit);

    return { data: dependentes, total, pages };
}

export async function getDependenteById(id: number): Promise<Dependente | null> {
    const { data, error } = await supabase
        .from('Dependentes')
        .select('*')
        .eq('IdDependente', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }

    return mapDependenteRow(data as Record<string, unknown>);
}

async function resolveEmpresaFromSocio(codSocio: number | string | null | undefined): Promise<string | undefined> {
    const id = Number(codSocio || 0);
    if (!id) return undefined;

    const { data, error } = await supabase
        .from('Socios')
        .select('CodEmpresa,RazaoSocial,NomeFantasia')
        .eq('IdSocio', id)
        .single();

    if (error) return undefined;

    const razao = String((data as any)?.RazaoSocial || '').trim();
    if (razao) return razao.toUpperCase();
    const fantasia = String((data as any)?.NomeFantasia || '').trim();
    if (fantasia) return fantasia.toUpperCase();

    const codEmpresa = String((data as any)?.CodEmpresa || '').trim();
    if (!codEmpresa) return undefined;

    const empresaRes = await supabase
        .from('Empresas')
        .select('RazaoSocial,NomeFantasia')
        .eq('CodEmpresa', codEmpresa)
        .maybeSingle();

    if (empresaRes.error || !empresaRes.data) return undefined;

    const eRazao = String((empresaRes.data as any)?.RazaoSocial || '').trim();
    if (eRazao) return eRazao.toUpperCase();
    const eFantasia = String((empresaRes.data as any)?.NomeFantasia || '').trim();
    if (eFantasia) return eFantasia.toUpperCase();
    return undefined;
}

export async function createDependente(dependenteData: Partial<Dependente>): Promise<Dependente> {
    const inputEmpresa = String(dependenteData.empresa || '').trim();
    const resolvedEmpresa = inputEmpresa ? inputEmpresa.toUpperCase() : await resolveEmpresaFromSocio(dependenteData.codSocio);

    const dbData = {
        CodDependente: dependenteData.codDependente,
        CodSocio: dependenteData.codSocio,
        Socio: dependenteData.socio,
        Empresa: resolvedEmpresa,
        Dependente: dependenteData.dependente,
        Nascimento: dependenteData.nascimento,
        Parentesco: dependenteData.parentesco,
        Carteira: dependenteData.carteira,
        DataCadastro: dependenteData.dataCadastro,
        Cadastrante: (await supabase.auth.getUser()).data.user?.email || 'Sistema',
        Imagem: dependenteData.imagem,
        Status: dependenteData.status,
        FlagOrfao: dependenteData.flagOrfao,
    };

    const { data, error } = await supabase
        .from('Dependentes')
        .insert(dbData)
        .select()
        .single();

    if (error) throw error;
    return mapDependenteRow(data as Record<string, unknown>);
}

export async function getDependentesBySocioId(codSocio: number): Promise<Dependente[]> {
    const { data, error } = await supabase
        .from('Dependentes')
        .select('*')
        .eq('CodSocio', codSocio)
        .order('IdDependente', { ascending: false });

    if (error) {
        console.error('Error fetching dependentes by socio:', error);
        throw new Error('Failed to fetch dependentes');
    }

    return (data || []).map((row: Record<string, unknown>) => mapDependenteRow(row));
}

export async function deleteDependente(id: number): Promise<void> {
    const { error } = await supabase
        .from('Dependentes')
        .delete()
        .eq('IdDependente', id);

    if (error) throw error;
}

export async function updateDependente(id: number, dependenteData: Partial<Dependente>): Promise<Dependente> {
    const inputEmpresa = String(dependenteData.empresa || '').trim();
    const resolvedEmpresa = inputEmpresa ? inputEmpresa.toUpperCase() : await resolveEmpresaFromSocio(dependenteData.codSocio);

    const dbData = {
        CodDependente: dependenteData.codDependente,
        CodSocio: dependenteData.codSocio,
        Socio: dependenteData.socio,
        Empresa: resolvedEmpresa,
        Dependente: dependenteData.dependente,
        Nascimento: dependenteData.nascimento,
        Parentesco: dependenteData.parentesco,
        Carteira: dependenteData.carteira,
        Imagem: dependenteData.imagem,
        Status: dependenteData.status,
        FlagOrfao: dependenteData.flagOrfao,
    };

    const { data, error } = await supabase
        .from('Dependentes')
        .update(dbData)
        .eq('IdDependente', id)
        .select()
        .single();

    if (error) throw error;
    return mapDependenteRow(data as Record<string, unknown>);
}

export async function backfillDependentesEmpresaFromSocio(opts: { batchSize?: number } = {}): Promise<{ scanned: number; updated: number }> {
    const batchSize = Math.max(1, Math.min(1000, Number(opts.batchSize || 250)));

    const [nullRes, emptyRes] = await Promise.all([
        supabase
            .from('Dependentes')
            .select('IdDependente,CodSocio')
            .is('Empresa', null)
            .order('IdDependente', { ascending: true })
            .limit(batchSize),
        supabase
            .from('Dependentes')
            .select('IdDependente,CodSocio')
            .eq('Empresa', '')
            .order('IdDependente', { ascending: true })
            .limit(batchSize),
    ]);

    if (nullRes.error) throw new Error(nullRes.error.message || 'Erro ao buscar dependentes sem empresa');
    if (emptyRes.error) throw new Error(emptyRes.error.message || 'Erro ao buscar dependentes sem empresa');

    const combined = [...(nullRes.data || []), ...(emptyRes.data || [])] as Array<{ IdDependente: number; CodSocio: number | null }>;
    const byId = new Map<number, { IdDependente: number; CodSocio: number | null }>();
    combined.forEach((r) => byId.set(Number(r.IdDependente), r));
    const rows = Array.from(byId.values()).slice(0, batchSize);

    if (!rows.length) return { scanned: 0, updated: 0 };

    const socioIds = Array.from(
        new Set(
            rows
                .map((r) => Number(r.CodSocio || 0))
                .filter((n) => Number.isFinite(n) && n > 0)
        )
    );

    const socioMap = new Map<number, string>();
    const socioEmpresaCodeMap = new Map<number, string>();
    if (socioIds.length) {
        const { data, error } = await supabase
            .from('Socios')
            .select('IdSocio,CodEmpresa,RazaoSocial,NomeFantasia')
            .in('IdSocio', socioIds);

        if (error) throw new Error(error.message || 'Erro ao buscar sócios para backfill');

        (data || []).forEach((s: any) => {
            const id = Number(s?.IdSocio || 0);
            if (!id) return;
            const razao = String(s?.RazaoSocial || '').trim();
            const fantasia = String(s?.NomeFantasia || '').trim();
            const empresa = (razao || fantasia).toUpperCase();
            if (empresa) {
                socioMap.set(id, empresa);
                return;
            }
            const codEmpresa = String(s?.CodEmpresa || '').trim();
            if (codEmpresa) socioEmpresaCodeMap.set(id, codEmpresa);
        });
    }

    const missingSocioIds = Array.from(socioEmpresaCodeMap.keys()).filter((id) => !socioMap.has(id));
    if (missingSocioIds.length) {
        const codEmpresas = Array.from(new Set(missingSocioIds.map((id) => socioEmpresaCodeMap.get(id) || '').filter(Boolean)));
        if (codEmpresas.length) {
            const { data, error } = await supabase
                .from('Empresas')
                .select('CodEmpresa,RazaoSocial,NomeFantasia')
                .in('CodEmpresa', codEmpresas);

            if (error) throw new Error(error.message || 'Erro ao buscar empresas para backfill');

            const empresaByCod = new Map<string, string>();
            (data || []).forEach((e: any) => {
                const cod = String(e?.CodEmpresa || '').trim();
                if (!cod) return;
                const razao = String(e?.RazaoSocial || '').trim();
                const fantasia = String(e?.NomeFantasia || '').trim();
                const empresa = (razao || fantasia).toUpperCase();
                if (empresa) empresaByCod.set(cod, empresa);
            });

            missingSocioIds.forEach((id) => {
                const cod = socioEmpresaCodeMap.get(id) || '';
                const empresa = empresaByCod.get(cod);
                if (empresa) socioMap.set(id, empresa);
            });
        }
    }

    const updates = rows
        .map((r) => {
            const socioId = Number(r.CodSocio || 0);
            const empresa = socioMap.get(socioId) || '';
            if (!empresa) return null;
            return { id: Number(r.IdDependente), empresa };
        })
        .filter(Boolean) as Array<{ id: number; empresa: string }>;

    let updated = 0;
    const step = 10;
    for (let i = 0; i < updates.length; i += step) {
        const slice = updates.slice(i, i + step);
        const results = await Promise.all(
            slice.map((u) =>
                supabase
                    .from('Dependentes')
                    .update({ Empresa: u.empresa })
                    .eq('IdDependente', u.id)
            )
        );
        const errors = results.map((r) => r.error).filter(Boolean) as Array<{ message?: string | null; code?: string | null }>;
        if (errors.length) {
            const first = errors[0];
            const code = first?.code ? ` (${first.code})` : '';
            const msg = first?.message || 'Sem permissão para atualizar dependentes';
            throw new Error(`${msg}${code}`);
        }

        updated += results.length;
    }

    return { scanned: rows.length, updated };
}

export type DependentesChartsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'range';

export async function getDependentesStats(): Promise<{
    total: number;
    orfaos: number;
    semEmpresa: number;
    comCarteira: number;
}> {
    const [totalRes, orfaosRes, semEmpresaNullRes, semEmpresaEmptyRes, carteiraRes] = await Promise.all([
        supabase.from('Dependentes').select('IdDependente', { count: 'exact', head: true }),
        supabase.from('Dependentes').select('IdDependente', { count: 'exact', head: true }).eq('FlagOrfao', true),
        supabase.from('Dependentes').select('IdDependente', { count: 'exact', head: true }).is('Empresa', null),
        supabase.from('Dependentes').select('IdDependente', { count: 'exact', head: true }).eq('Empresa', ''),
        supabase.from('Dependentes').select('IdDependente', { count: 'exact', head: true }).eq('Carteira', true),
    ]);

    if (totalRes.error) throw new Error(totalRes.error.message || 'Erro ao buscar total de dependentes');
    if (orfaosRes.error) throw new Error(orfaosRes.error.message || 'Erro ao buscar dependentes órfãos');
    if (semEmpresaNullRes.error) throw new Error(semEmpresaNullRes.error.message || 'Erro ao buscar dependentes sem empresa');
    if (semEmpresaEmptyRes.error) throw new Error(semEmpresaEmptyRes.error.message || 'Erro ao buscar dependentes sem empresa');
    if (carteiraRes.error) throw new Error(carteiraRes.error.message || 'Erro ao buscar dependentes com carteira');

    return {
        total: totalRes.count || 0,
        orfaos: orfaosRes.count || 0,
        semEmpresa: (semEmpresaNullRes.count || 0) + (semEmpresaEmptyRes.count || 0),
        comCarteira: carteiraRes.count || 0,
    };
}

export async function getDependentesChartsData(
    opts: { period?: DependentesChartsPeriod; dateFrom?: string | null; dateTo?: string | null } = {}
): Promise<{
    evolution: { labels: string[]; cadastrados: number[]; orfaos: number[]; carteiras: number[] };
    byParentesco: Array<{ name: string; value: number }>;
    byEmpresa: Array<{ name: string; value: number }>;
}> {
    const pick = 'IdDependente,DataCadastro,Parentesco,Empresa,FlagOrfao,Carteira';

    const head = await supabase.from('Dependentes').select('IdDependente', { count: 'exact', head: true });
    if (head.error) {
        console.error('Error counting dependentes charts data:', head.error);
        throw new Error('Failed to fetch dependentes charts data');
    }

    const total = head.count || 0;
    const chunkSize = 1000;
    const chunks = Math.max(1, Math.ceil(total / chunkSize));
    const allRows: any[] = [];

    for (let i = 0; i < chunks; i++) {
        const from = i * chunkSize;
        const to = Math.min(total - 1, from + chunkSize - 1);

        const res = await supabase
            .from('Dependentes')
            .select(pick)
            .order('IdDependente', { ascending: false })
            .range(from, to);

        if (res.error) {
            console.error('Error fetching dependentes charts chunk:', res.error);
            throw new Error('Failed to fetch dependentes charts data');
        }

        allRows.push(...(res.data || []));
    }

    const rows = (allRows || []) as Array<{
        IdDependente?: number | null;
        DataCadastro?: string | null;
        Parentesco?: string | null;
        Empresa?: string | null;
        FlagOrfao?: boolean | null;
        Carteira?: boolean | null;
    }>;

    const period: DependentesChartsPeriod = opts.period || 'daily';
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

    const map = new Map<string, { cadastrados: number; orfaos: number; carteiras: number }>();
    slots.forEach((s) => map.set(s.key, { cadastrados: 0, orfaos: 0, carteiras: 0 }));

    const parentescoMap = new Map<string, number>();
    const empresaMap = new Map<string, number>();

    rows.forEach((r) => {
        const parentesco = (r.Parentesco || 'NÃO INFORMADO').toString().toUpperCase().trim();
        const empresa = (r.Empresa || 'SEM EMPRESA').toString().toUpperCase().trim();
        parentescoMap.set(parentesco, (parentescoMap.get(parentesco) || 0) + 1);
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
        if (r.FlagOrfao) slot.orfaos += 1;
        if (r.Carteira) slot.carteiras += 1;
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
            orfaos: slots.map((s) => map.get(s.key)?.orfaos || 0),
            carteiras: slots.map((s) => map.get(s.key)?.carteiras || 0),
        },
        byParentesco: toSorted(parentescoMap, 10),
        byEmpresa: toSorted(empresaMap, 10),
    };
}

export async function uploadDependenteImage(dependenteId: number, file: Blob): Promise<string> {
    const ext = (file as any).name?.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
    const path = `dependentes/${dependenteId}/${Date.now()}.${safeExt}`;

    return uploadPublicFile({
        bucket: 'dependentes-images',
        path,
        file,
        contentType: (file as any).type || 'image/jpeg',
        upsert: true,
    });
}

export async function updateDependenteImage(id: number, imagem: string | null): Promise<void> {
    const { error } = await supabase
        .from('Dependentes')
        .update({ Imagem: imagem })
        .eq('IdDependente', id);
    if (error) throw error;
}
