import { supabase } from '@/lib/supabase';
import { Funcionario } from '@/lib/types/funcionario';
import { mapFuncionarioRow } from '@/lib/mappers/funcionario';
import { uploadPublicFile } from '@/lib/upload/uploadPublicFile';

interface GetFuncionariosOptions {
    page?: number;
    limit?: number | 'all';
    search?: string;
    sortBy?: 'id' | 'nome' | 'cpf' | 'cargo' | 'depto' | 'setor' | 'empresaLocal' | 'dataAdmissao';
    sortDir?: 'asc' | 'desc';
}

export async function getFuncionarios({
    page = 1,
    limit = 50,
    search = '',
    sortBy = 'id',
    sortDir = 'desc',
}: GetFuncionariosOptions = {}): Promise<{ data: Funcionario[], total: number, pages: number }> {
    const applySearch = (q: any): any => {
        if (!search) return q;
        const term = `%${search}%`;
        return q.or(`Nome.ilike.${term},CPF.ilike.${term},Cargo.ilike.${term},Depto.ilike.${term},Setor.ilike.${term},EmpresaLocal.ilike.${term}`);
    };

    const sortColumnByKey: Record<NonNullable<GetFuncionariosOptions['sortBy']>, string> = {
        id: 'id',
        nome: 'Nome',
        cpf: 'CPF',
        cargo: 'Cargo',
        depto: 'Depto',
        setor: 'Setor',
        empresaLocal: 'EmpresaLocal',
        dataAdmissao: 'DataAdmissao',
    };

    const primarySortColumn = sortColumnByKey[sortBy] || 'id';
    const primaryAscending = sortDir === 'asc';

    if (limit === 'all') {
        const head = await applySearch(
            supabase.from('Funcionarios').select('id', { count: 'exact', head: true })
        );
        if (head.error) {
            console.error('Error counting funcionarios:', head.error);
            throw new Error('Failed to fetch funcionarios');
        }

        const total = head.count || 0;
        const chunkSize = 1000;
        const chunks = Math.max(1, Math.ceil(total / chunkSize));
        const allRows: any[] = [];

        for (let i = 0; i < chunks; i++) {
            const from = i * chunkSize;
            const to = Math.min(total - 1, from + chunkSize - 1);

            const res = await applySearch(
                supabase.from('Funcionarios').select('*')
            )
                .order(primarySortColumn, { ascending: primaryAscending })
                .order('id', { ascending: false })
                .range(from, to);

            if (res.error) {
                console.error('Error fetching funcionarios:', res.error);
                throw new Error('Failed to fetch funcionarios');
            }

            allRows.push(...(res.data || []));
        }

        const funcionarios = allRows.map((row: Record<string, unknown>) => mapFuncionarioRow(row));
        return { data: funcionarios, total, pages: total > 0 ? 1 : 0 };
    }

    const safeLimit = Math.max(1, limit);
    const from = (page - 1) * safeLimit;
    const to = from + safeLimit - 1;

    const { data, count, error } = await applySearch(
        supabase.from('Funcionarios').select('*', { count: 'exact' })
    )
        .order(primarySortColumn, { ascending: primaryAscending })
        .order('id', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching funcionarios:', error);
        throw new Error('Failed to fetch funcionarios');
    }

    const funcionarios = (data || []).map((row: Record<string, unknown>) => mapFuncionarioRow(row));
    const total = count || 0;
    const pages = Math.ceil(total / safeLimit);

    return { data: funcionarios, total, pages };
}

export async function getFuncionarioById(id: number): Promise<Funcionario | null> {
    const { data, error } = await supabase
        .from('Funcionarios')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }

    return mapFuncionarioRow(data as Record<string, unknown>);
}

export async function createFuncionario(data: Partial<Funcionario>): Promise<Funcionario> {
    const dbData = {
        Nome: data.nome,
        Salario: data.salario,
        Cargo: data.cargo || data.cbo,
        EmpresaLocal: data.empresaLocal,
        Depto: data.depto,
        Setor: data.setor,
        CPF: data.cpf,
        DataAdmissao: data.dataAdmissao,
        EmpresaId: data.empresaId
    };

    const { data: result, error } = await supabase
        .from('Funcionarios')
        .insert(dbData)
        .select()
        .single();

    if (error) {
        console.error('Error creating funcionario:', error);
        throw error;
    }
    return mapFuncionarioRow(result as Record<string, unknown>);
}

export async function updateFuncionario(id: number, data: Partial<Funcionario>): Promise<Funcionario> {
    const dbData = {
        Nome: data.nome,
        Salario: data.salario,
        Cargo: data.cargo || data.cbo,
        EmpresaLocal: data.empresaLocal,
        Depto: data.depto,
        Setor: data.setor,
        CPF: data.cpf,
        DataAdmissao: data.dataAdmissao,
        EmpresaId: data.empresaId
    };

    const { data: result, error } = await supabase
        .from('Funcionarios')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return mapFuncionarioRow(result as Record<string, unknown>);
}

export async function deleteFuncionario(id: number): Promise<void> {
    const { error } = await supabase
        .from('Funcionarios')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting funcionario:', error);
        throw new Error('Failed to delete funcionario');
    }
}

export async function uploadFuncionarioImage(funcionarioId: number, file: Blob): Promise<string> {
    const ext = (file as any).name?.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
    const path = `funcionarios/${funcionarioId}/${Date.now()}.${safeExt}`;

    return uploadPublicFile({
        bucket: 'funcionarios-images',
        path,
        file,
        contentType: (file as any).type || 'image/jpeg',
        upsert: true,
    });
}

export async function updateFuncionarioImage(id: number, imagem: string | null): Promise<void> {
    const { error } = await supabase
        .from('Funcionarios')
        .update({ Imagem: imagem })
        .eq('id', id);
    if (error) throw error;
}

export type FuncionariosChartsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'range';

export async function getFuncionariosStats(): Promise<{
    total: number;
    departamentos: number;
    setores: number;
    totalSalarios: number;
}> {
    const head = await supabase.from('Funcionarios').select('id', { count: 'exact', head: true });
    if (head.error) {
        console.error('Error counting funcionarios stats:', head.error);
        throw new Error('Failed to fetch funcionarios stats');
    }

    const total = head.count || 0;
    const chunkSize = 1000;
    const chunks = Math.max(1, Math.ceil(total / chunkSize));
    const deptoSet = new Set<string>();
    const setorSet = new Set<string>();
    let totalSalarios = 0;

    for (let i = 0; i < chunks; i++) {
        const from = i * chunkSize;
        const to = Math.min(total - 1, from + chunkSize - 1);

        const res = await supabase
            .from('Funcionarios')
            .select('Depto,Setor,Salario')
            .order('id', { ascending: false })
            .range(from, to);

        if (res.error) {
            console.error('Error fetching funcionarios stats chunk:', res.error);
            throw new Error('Failed to fetch funcionarios stats');
        }

        (res.data || []).forEach((r: any) => {
            const depto = String(r?.Depto || '').toUpperCase().trim();
            const setor = String(r?.Setor || '').toUpperCase().trim();
            if (depto) deptoSet.add(depto);
            if (setor) setorSet.add(setor);
            totalSalarios += Number(r?.Salario) || 0;
        });
    }

    return {
        total,
        departamentos: deptoSet.size,
        setores: setorSet.size,
        totalSalarios,
    };
}

export async function getFuncionariosChartsData(
    opts: { period?: FuncionariosChartsPeriod; dateFrom?: string | null; dateTo?: string | null } = {}
): Promise<{
    evolution: { labels: string[]; admitidos: number[] };
    byDepto: Array<{ name: string; value: number }>;
    bySetor: Array<{ name: string; value: number }>;
    byCargo: Array<{ name: string; value: number }>;
}> {
    const pick = 'id,DataAdmissao,Depto,Setor,Cargo';

    const head = await supabase.from('Funcionarios').select('id', { count: 'exact', head: true });
    if (head.error) {
        console.error('Error counting funcionarios charts data:', head.error);
        throw new Error('Failed to fetch funcionarios charts data');
    }

    const total = head.count || 0;
    const chunkSize = 1000;
    const chunks = Math.max(1, Math.ceil(total / chunkSize));
    const allRows: any[] = [];

    for (let i = 0; i < chunks; i++) {
        const from = i * chunkSize;
        const to = Math.min(total - 1, from + chunkSize - 1);

        const res = await supabase
            .from('Funcionarios')
            .select(pick)
            .order('id', { ascending: false })
            .range(from, to);

        if (res.error) {
            console.error('Error fetching funcionarios charts chunk:', res.error);
            throw new Error('Failed to fetch funcionarios charts data');
        }

        allRows.push(...(res.data || []));
    }

    const rows = (allRows || []) as Array<{
        id?: number | null;
        DataAdmissao?: string | null;
        Depto?: string | null;
        Setor?: string | null;
        Cargo?: string | null;
    }>;

    const period: FuncionariosChartsPeriod = opts.period || 'daily';
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

    const map = new Map<string, { admitidos: number }>();
    slots.forEach((s) => map.set(s.key, { admitidos: 0 }));
    const deptoMap = new Map<string, number>();
    const setorMap = new Map<string, number>();
    const cargoMap = new Map<string, number>();

    rows.forEach((r) => {
        const depto = (r.Depto || 'SEM DEPTO').toString().toUpperCase().trim();
        const setor = (r.Setor || 'SEM SETOR').toString().toUpperCase().trim();
        const cargo = (r.Cargo || 'SEM CARGO').toString().toUpperCase().trim();
        deptoMap.set(depto, (deptoMap.get(depto) || 0) + 1);
        setorMap.set(setor, (setorMap.get(setor) || 0) + 1);
        cargoMap.set(cargo, (cargoMap.get(cargo) || 0) + 1);

        if (!r.DataAdmissao) return;
        const d = parseDbTimestamp(r.DataAdmissao);
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
        slot.admitidos += 1;
    });

    const toSorted = (m: Map<string, number>, top?: number) =>
        Array.from(m.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, top ?? undefined);

    return {
        evolution: {
            labels: slots.map((s) => s.label),
            admitidos: slots.map((s) => map.get(s.key)?.admitidos || 0),
        },
        byDepto: toSorted(deptoMap, 10),
        bySetor: toSorted(setorMap, 10),
        byCargo: toSorted(cargoMap, 10),
    };
}
