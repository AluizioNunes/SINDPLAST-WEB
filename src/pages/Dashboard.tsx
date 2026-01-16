import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Building2, UserCircle, Briefcase, DollarSign, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import EChart from '@/components/charts/EChart';
import { getDashboardStats, getAnalyticsData, DashboardStats, DashboardAnalyticsPayload } from '@/lib/services/dashboardService';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'visao-geral' | 'dados-analiticos'>('visao-geral');
  const [filterSexo, setFilterSexo] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Fetch Main Stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  // Fetch Analytics (Lazy)
  const { data: analyticsPayload, isLoading: analyticsLoading, error: analyticsError } = useQuery<DashboardAnalyticsPayload>({
    queryKey: ['dashboardAnalytics'],
    queryFn: getAnalyticsData,
    enabled: activeTab === 'dados-analiticos',
  });

  // Process Analytics Data on Client
  const analyticsData = React.useMemo(() => {
    if (!analyticsPayload) return null;
    let filteredSocios = analyticsPayload.raw.socios;

    if (filterSexo) {
      filteredSocios = filteredSocios.filter(s => (s.Sexo || 'Não Informado') === filterSexo);
    }
    if (filterStatus) {
      filteredSocios = filteredSocios.filter(s => (s.Status || 'Indefinido') === filterStatus);
    }

    const sociosBySexoMap = new Map<string, number>();
    const sociosByStatusMap = new Map<string, number>();
    let totalMensalidades = 0;

    filteredSocios.forEach(s => {
      const sexo = s.Sexo || 'Não Informado';
      sociosBySexoMap.set(sexo, (sociosBySexoMap.get(sexo) || 0) + 1);

      const status = s.Status || 'Indefinido';
      sociosByStatusMap.set(status, (sociosByStatusMap.get(status) || 0) + 1);

      if (s.ValorMensalidade && (status === 'ATIVO' || status === 'Ativo')) {
        totalMensalidades += Number(s.ValorMensalidade) || 0;
      }
    });

    const formatChartData = (map: Map<string, number>) =>
      Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    return {
      counts: {
        ...stats?.counts,
        socios: filteredSocios.length,
      },
      charts: {
        sociosBySexo: formatChartData(sociosBySexoMap),
        sociosByStatus: formatChartData(sociosByStatusMap),
        dependentesByParentesco: analyticsPayload.charts.dependentesByParentesco,
        empresasByStatus: analyticsPayload.charts.empresasByStatus,
      },
      financials: {
        totalMensalidades,
      },
    };
  }, [analyticsPayload, filterSexo, filterStatus, stats]);

  // Chart Click Handlers
  const onSexoChartClick = (params: any) => {
    setFilterSexo(prev => (prev === params.name ? null : params.name));
  };

  const onStatusChartClick = (params: any) => {
    setFilterStatus(prev => (prev === params.name ? null : params.name));
  };

  // Options
  const pieOption = (title: string, data: { name: string; value: number }[], selectedValue: string | null) => ({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { top: '5%', left: 'center' },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
          opacity: selectedValue ? (dataItem: any) => (dataItem.name === selectedValue ? 1 : 0.3) : 1,
        },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: '20', fontWeight: 'bold' } },
        data: data.map(d => ({
          ...d,
          itemStyle: selectedValue && d.name !== selectedValue ? { opacity: 0.3 } : {},
        })),
      },
    ],
  });

  const barOption = (title: string, data: { name: string; value: number }[], selectedValue: string | null) => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [{ type: 'category', data: data.map(d => d.name), axisTick: { alignWithLabel: true } }],
    yAxis: [{ type: 'value' }],
    series: [
      {
        name: title,
        type: 'bar',
        barWidth: '60%',
        data: data.map(d => ({
          value: d.value,
          itemStyle: selectedValue && d.name !== selectedValue ? { opacity: 0.3 } : {},
        })),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: (params: any) => {
            const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
            return colors[params.dataIndex % colors.length];
          },
        },
      },
    ],
  });

  const horizontalBarOption = (title: string, data: { name: string; value: number }[]) => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: data.map(d => d.name) },
    series: [
      {
        name: title,
        type: 'bar',
        data: data.map(d => d.value),
        itemStyle: { borderRadius: [0, 4, 4, 0], color: '#f59e0b' },
      },
    ],
  });

  if (statsLoading) {
    return <div className="p-6 text-gray-500">Carregando dashboard...</div>;
  }

  if (statsError) {
    return <div className="p-6 text-red-500">Erro ao carregar dashboard: {(statsError as Error).message}</div>;
  }

  const counts = analyticsData ? analyticsData.counts : stats?.counts;
  const totalMensalidades = analyticsData ? analyticsData.financials.totalMensalidades : stats?.financials.totalMensalidades;
  const activeFiltersCount = [filterSexo, filterStatus].filter(Boolean).length;
  const numberFmt = new Intl.NumberFormat('pt-BR');
  const currencyFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
          <div className="inline-flex w-full sm:w-auto items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 p-1 shadow-sm">
            <TabButton active={activeTab === 'visao-geral'} onClick={() => setActiveTab('visao-geral')}>
              Visão Geral
            </TabButton>
            <TabButton active={activeTab === 'dados-analiticos'} onClick={() => setActiveTab('dados-analiticos')}>
              Dados Analíticos do Sistema
            </TabButton>
          </div>

          <div className="flex-1" />

          <AnimatePresence>
            {activeTab === 'dados-analiticos' && activeFiltersCount > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 flex-wrap justify-end"
              >
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Filtros ativos:</span>
                <div className="flex gap-2 flex-wrap">
                  {filterSexo && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-sm font-medium">
                      Sexo: {filterSexo}
                      <button onClick={() => setFilterSexo(null)} className="hover:text-purple-900"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {filterStatus && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-sm font-medium">
                      Status: {filterStatus}
                      <button onClick={() => setFilterStatus(null)} className="hover:text-green-900"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => { setFilterSexo(null); setFilterStatus(null); }} className="text-xs">
                    Limpar todos
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total de Sócios" value={numberFmt.format(counts?.socios || 0)} icon={<Users className="w-6 h-6" />} color="purple" delay={0} />
        <StatCard title="Empresas" value={numberFmt.format(counts?.empresas || 0)} icon={<Building2 className="w-6 h-6" />} color="teal" delay={0.1} />
        <StatCard title="Dependentes" value={numberFmt.format(counts?.dependentes || 0)} icon={<UserCircle className="w-6 h-6" />} color="amber" delay={0.2} />
        <StatCard title="Funcionários" value={numberFmt.format(counts?.funcionarios || 0)} icon={<Briefcase className="w-6 h-6" />} color="blue" delay={0.3} />
        <StatCard
          title="Mensalidades (Ativos)"
          value={currencyFmt.format(totalMensalidades || 0)}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          delay={0.4}
        />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dados-analiticos' && (
          <motion.div
            key="dados-analiticos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="space-y-6"
          >
            {analyticsLoading && <div className="glass-card p-6 text-sm text-gray-600 dark:text-gray-300">Carregando dados analíticos...</div>}
            {!analyticsLoading && analyticsError && <div className="glass-card p-6 text-sm text-red-600 dark:text-red-400">Erro: {(analyticsError as Error).message}</div>}
            
            {!analyticsLoading && !analyticsError && analyticsData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Sócios por Sexo" delay={0}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Clique nas fatias para filtrar</p>
                  <EChart options={pieOption('Sócios por Sexo', analyticsData.charts.sociosBySexo, filterSexo)} onEvents={{ click: onSexoChartClick }} />
                </ChartCard>
                <ChartCard title="Sócios por Status" delay={0.05}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Clique nas barras para filtrar</p>
                  <EChart options={barOption('Sócios por Status', analyticsData.charts.sociosByStatus, filterStatus)} onEvents={{ click: onStatusChartClick }} />
                </ChartCard>
                <ChartCard title="Dependentes por Parentesco" delay={0.1}>
                  <EChart options={horizontalBarOption('Dependentes', analyticsData.charts.dependentesByParentesco)} />
                </ChartCard>
                <ChartCard title="Empresas por UF" delay={0.15}>
                  <EChart options={pieOption('Empresas', analyticsData.charts.empresasByStatus, null)} />
                </ChartCard>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon, color, delay }: any) {
  const colorClasses: Record<string, { gradient: string; glow: string }> = {
    purple: { gradient: 'from-fuchsia-600 via-purple-600 to-indigo-600', glow: 'shadow-fuchsia-500/30' },
    teal: { gradient: 'from-emerald-500 via-teal-500 to-cyan-500', glow: 'shadow-emerald-500/30' },
    amber: { gradient: 'from-amber-400 via-orange-500 to-rose-500', glow: 'shadow-orange-500/30' },
    blue: { gradient: 'from-sky-500 via-blue-600 to-indigo-700', glow: 'shadow-blue-500/30' },
    green: { gradient: 'from-green-500 via-emerald-500 to-lime-400', glow: 'shadow-emerald-500/30' },
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-xl ${colorClasses[color].glow} bg-gradient-to-br ${colorClasses[color].gradient} cursor-default`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="absolute -top-14 -right-14 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-black/10 blur-2xl" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-white/85">{title}</p>
          <motion.p
            key={String(value)}
            initial={{ opacity: 0.5, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 text-3xl font-black tracking-tight drop-shadow-sm"
          >
            {value}
          </motion.p>
        </div>
        <div className="p-3 rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function ChartCard({ title, children, delay }: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}

function TabButton({ active, onClick, children }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg text-gray-700 dark:text-gray-200"
    >
      {active && (
        <motion.div
          layoutId="dashboard-tab-indicator"
          className="absolute inset-0 rounded-lg bg-gray-900/5 dark:bg-white/10"
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
