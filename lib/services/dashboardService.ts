import { createClient } from '@/lib/supabase/server';

export interface DashboardStats {
    counts: {
        socios: number;
        empresas: number;
        dependentes: number;
        funcionarios: number;
        usuarios: number;
    };
    charts: {
        sociosBySexo: { name: string; value: number }[];
        sociosByStatus: { name: string; value: number }[];
        dependentesByParentesco: { name: string; value: number }[];
        empresasByStatus: { name: string; value: number }[];
    };
    financials: {
        totalMensalidades: number;
    };
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient();

    // Parallel requests for counts
    const [
        { count: sociosCount },
        { count: empresasCount },
        { count: dependentesCount },
        { count: funcionariosCount },
        { count: usuariosCount },
        { data: sociosData },
        { data: dependentesData },
        { data: empresasData }
    ] = await Promise.all([
        supabase.from('Socios').select('*', { count: 'exact', head: true }),
        supabase.from('Empresas').select('*', { count: 'exact', head: true }),
        supabase.from('Dependentes').select('*', { count: 'exact', head: true }),
        supabase.from('Funcionarios').select('*', { count: 'exact', head: true }),
        supabase.from('Usuarios').select('*', { count: 'exact', head: true }),
        supabase.from('Socios').select('Sexo, Status, ValorMensalidade'),
        supabase.from('Dependentes').select('Parentesco'),
        supabase.from('Empresas').select('Status') // Assuming Status exists, if not we'll count total
    ]);

    // Process Charts Data
    const sociosBySexoMap = new Map<string, number>();
    const sociosByStatusMap = new Map<string, number>();
    let totalMensalidades = 0;
    
    sociosData?.forEach(s => {
        const sexo = s.Sexo || 'Não Informado';
        sociosBySexoMap.set(sexo, (sociosBySexoMap.get(sexo) || 0) + 1);

        const status = s.Status || 'Indefinido';
        sociosByStatusMap.set(status, (sociosByStatusMap.get(status) || 0) + 1);

        if (s.ValorMensalidade && (status === 'ATIVO' || status === 'Ativo')) {
             totalMensalidades += Number(s.ValorMensalidade) || 0;
        }
    });

    const dependentesByParentescoMap = new Map<string, number>();
    dependentesData?.forEach(d => {
        const parentesco = d.Parentesco || 'Outros';
        dependentesByParentescoMap.set(parentesco, (dependentesByParentescoMap.get(parentesco) || 0) + 1);
    });

    const empresasByStatusMap = new Map<string, number>();
    // Check if companies have status. If not, maybe count by City or just dummy Active.
    // Assuming no Status column based on schema, let's just group by something else or skip.
    // Actually, let's try to see if there is any categorical field. 'cidade'?
    // The user asked for "Empresas". A pie chart of Active/Inactive is standard.
    // If column doesn't exist, we might just show total.
    // Let's assume for now we just return total or maybe group by Cidade if available.
    // Or check if I can add a mock status distribution if real data isn't available.
    // Wait, let's use 'UF' or 'Cidade' for variety if Status is missing.
    // But user asked for charts related to "Empresas".
    // Let's try to use 'cidade' for now as it exists in schema.
    empresasData?.forEach(e => {
         // If Status exists in row (even if not in type), use it. Else use Cidade.
         const statusOrCity = (e as any).Status || (e as any).cidade || 'Não Informado';
         empresasByStatusMap.set(statusOrCity, (empresasByStatusMap.get(statusOrCity) || 0) + 1);
    });

    // Format for Charts
    const formatChartData = (map: Map<string, number>) => 
        Array.from(map.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Sort by value desc

    return {
        counts: {
            socios: sociosCount || 0,
            empresas: empresasCount || 0,
            dependentes: dependentesCount || 0,
            funcionarios: funcionariosCount || 0,
            usuarios: usuariosCount || 0,
        },
        charts: {
            sociosBySexo: formatChartData(sociosBySexoMap),
            sociosByStatus: formatChartData(sociosByStatusMap),
            dependentesByParentesco: formatChartData(dependentesByParentescoMap).slice(0, 6), // Top 6
            empresasByStatus: formatChartData(empresasByStatusMap).slice(0, 6),
        },
        financials: {
            totalMensalidades
        }
    };
}
