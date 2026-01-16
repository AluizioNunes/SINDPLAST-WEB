import { supabase } from '@/lib/supabase';

export interface DashboardStats {
    counts: {
        socios: number;
        empresas: number;
        dependentes: number;
        funcionarios: number;
        usuarios: number;
    };
    financials: {
        totalMensalidades: number;
    };
}

export interface DashboardAnalyticsPayload {
    raw: {
        socios: Array<{
            Sexo?: string | null;
            Status?: string | null;
            ValorMensalidade?: number | string | null;
        }>;
    };
    charts: {
        dependentesByParentesco: Array<{ name: string; value: number }>;
        empresasByStatus: Array<{ name: string; value: number }>;
    };
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (error) throw new Error(error.message || 'Erro ao carregar dados do dashboard');
    if (!data) throw new Error('Resposta vazia do dashboard');

    const payload = data as {
        counts?: Record<string, number | string | null | undefined>;
        financials?: { totalMensalidades?: number | string | null | undefined };
    };

    return {
        counts: {
            socios: Number(payload.counts?.socios || 0),
            empresas: Number(payload.counts?.empresas || 0),
            dependentes: Number(payload.counts?.dependentes || 0),
            funcionarios: Number(payload.counts?.funcionarios || 0),
            usuarios: Number(payload.counts?.usuarios || 0),
        },
        financials: {
            totalMensalidades: Number(payload.financials?.totalMensalidades || 0),
        },
    };
}

export async function getAnalyticsData(): Promise<DashboardAnalyticsPayload> {
    const { data, error } = await supabase.rpc('get_dashboard_analytics');
    if (error) throw new Error(error.message || 'Erro ao carregar dados analíticos');
    if (!data) throw new Error('Resposta vazia do dashboard');
    return data as DashboardAnalyticsPayload;
}
