import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Shield, FileText, BarChart3, Users, Mail, IdCard, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import { deleteUsuario, getUsuarios, getUsuariosChartsData, getUsuariosStats } from '@/lib/services/usuarioService';
import { Usuario } from '@/lib/types/usuario';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import NavbarListbox from '@/components/ui/NavbarListbox';
import UsuarioModal from '@/components/modals/UsuarioModal';
import UsuariosFichaModal from '@/components/modals/UsuariosFichaModal';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import EChart from '@/components/charts/EChart';
import { usePermissions } from '@/hooks/usePermissions';

export default function Usuarios() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { canViewField } = usePermissions();
    
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('q') || '';
    const limitParam = searchParams.get('limit') || '10';
    const limit = limitParam === 'all' ? 'all' : Math.max(1, Number(limitParam) || 10);
    const sortByParam = (searchParams.get('sortBy') || 'id') as 'id' | 'nome' | 'usuario' | 'email' | 'perfil' | 'cpf' | 'funcao' | 'dataCadastro';
    const sortDirParam = (searchParams.get('sortDir') || 'desc') as 'asc' | 'desc';
    const sortingState: SortingState = sortByParam === 'id' ? [] : [{ id: sortByParam, desc: sortDirParam === 'desc' }];
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const [isFichaModalOpen, setIsFichaModalOpen] = useState(false);
    const [previewUsuarioId, setPreviewUsuarioId] = useState<number | null>(null);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [chartsPeriod, setChartsPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'range'>('daily');
    const [chartsFrom, setChartsFrom] = useState<string>('');
    const [chartsTo, setChartsTo] = useState<string>('');

    const { data, isLoading } = useQuery({
        queryKey: ['usuarios', page, search, limit, sortByParam, sortDirParam],
        queryFn: () => getUsuarios({ page, search, limit, sortBy: sortByParam, sortDir: sortDirParam }),
        placeholderData: (data) => data,
    });

    const { data: stats } = useQuery({
        queryKey: ['usuarioStats'],
        queryFn: getUsuariosStats,
    });

    const { data: chartsData, isLoading: chartsLoading, isError: chartsIsError, error: chartsError } = useQuery({
        queryKey: ['usuarios-charts-data', chartsPeriod, chartsFrom, chartsTo],
        queryFn: () =>
            getUsuariosChartsData({
                period: chartsPeriod,
                dateFrom: chartsPeriod === 'range' ? (chartsFrom || null) : null,
                dateTo: chartsPeriod === 'range' ? (chartsTo || null) : null,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUsuario,
        onSuccess: () => {
            toast.success('Usuário excluído com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['usuarios'] });
            queryClient.invalidateQueries({ queryKey: ['usuarioStats'] });
        },
        onError: (error) => {
            console.error('Error deleting usuario:', error);
            toast.error('Erro ao excluir usuário');
        },
    });

    const handleSearch = (term: string) => {
        setSearchParams(prev => {
            if (term) prev.set('q', term);
            else prev.delete('q');
            prev.set('page', '1');
            return prev;
        });
    };

    const handlePageChange = useCallback((newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', newPage.toString());
            return prev;
        });
    }, [setSearchParams]);

    const handlePageSizeChange = (newPageSize: number | 'all') => {
        setSearchParams(prev => {
            prev.set('page', '1');
            prev.set('limit', newPageSize === 'all' ? 'all' : String(newPageSize));
            return prev;
        });
    };

    const handleSortingChange = (nextSorting: SortingState) => {
        setSearchParams(prev => {
            prev.set('page', '1');

            if (!nextSorting.length) {
                prev.delete('sortBy');
                prev.delete('sortDir');
                return prev;
            }

            const s = nextSorting[0];
            const allowed = new Set(['nome', 'usuario', 'email', 'perfil', 'cpf', 'funcao', 'dataCadastro']);
            if (!allowed.has(s.id)) return prev;

            prev.set('sortBy', s.id);
            prev.set('sortDir', s.desc ? 'desc' : 'asc');
            return prev;
        });
    };

    const handleDelete = useCallback(async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
        deleteMutation.mutate(id);
    }, [deleteMutation]);

    const handleEdit = useCallback((usuario: Usuario) => {
        setSelectedUsuario(usuario);
        setSelectedRowId(usuario.IdUsuarios);
        setIsModalOpen(true);
    }, []);

    const handleFichaCadastral = useCallback((usuario: Usuario, index?: number) => {
        setIsFichaModalOpen(true);
        setPreviewUsuarioId(usuario.IdUsuarios);
        setPreviewIndex(typeof index === 'number' ? index : null);
        setSelectedRowId(usuario.IdUsuarios);
    }, []);

    const handlePrint = useCallback((id: number) => {
        window.open(`/relatorios/print/usuario/${id}`, '_blank', 'noopener,noreferrer');
    }, []);

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['usuarios'] });
        queryClient.invalidateQueries({ queryKey: ['usuarioStats'] });
        queryClient.invalidateQueries({ queryKey: ['usuarios-charts-data'] });
        setIsModalOpen(false);
    };

    const usuarios = useMemo(() => data?.data || [], [data?.data]);
    const totalPages = data?.pages || 0;
    const previewUsuario = useMemo(() => {
        if (!isFichaModalOpen) return null;
        if (!usuarios.length) return null;

        if (previewUsuarioId != null) {
            return usuarios.find((u) => u.IdUsuarios === previewUsuarioId) || null;
        }

        if (previewIndex == null) return null;
        const idx = previewIndex === -1 ? usuarios.length - 1 : Math.min(Math.max(0, previewIndex), usuarios.length - 1);
        return usuarios[idx] || null;
    }, [isFichaModalOpen, previewIndex, previewUsuarioId, usuarios]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (isModalOpen) return;
            const target = e.target as HTMLElement | null;
            const tag = target?.tagName;
            if (target?.isContentEditable) return;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            if (e.key === 'Escape' && isFichaModalOpen) {
                setIsFichaModalOpen(false);
                setPreviewUsuarioId(null);
                setPreviewIndex(null);
                return;
            }

            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            if (!usuarios.length) return;

            e.preventDefault();

            if (!isFichaModalOpen) {
                const current = selectedRowId != null ? usuarios.findIndex((u) => u.IdUsuarios === selectedRowId) : -1;
                const step = e.key === 'ArrowDown' ? 1 : -1;
                let next = current === -1 ? (step === 1 ? 0 : usuarios.length - 1) : current + step;
                next = Math.min(usuarios.length - 1, Math.max(0, next));
                setSelectedRowId(usuarios[next].IdUsuarios);
                return;
            }

            const current =
                previewUsuarioId != null
                    ? usuarios.findIndex((u) => u.IdUsuarios === previewUsuarioId)
                    : previewIndex != null
                      ? (previewIndex === -1 ? usuarios.length - 1 : previewIndex)
                      : -1;

            const step = e.key === 'ArrowDown' ? 1 : -1;
            let next = current === -1 ? (step === 1 ? 0 : usuarios.length - 1) : current + step;

            if (next < 0) {
                if (page > 1) {
                    handlePageChange(page - 1);
                    setIsFichaModalOpen(true);
                    setPreviewUsuarioId(null);
                    setPreviewIndex(-1);
                    return;
                }
                next = 0;
            }

            if (next >= usuarios.length) {
                if (totalPages && page < totalPages) {
                    handlePageChange(page + 1);
                    setIsFichaModalOpen(true);
                    setPreviewUsuarioId(null);
                    setPreviewIndex(0);
                    return;
                }
                next = usuarios.length - 1;
            }

            handleFichaCadastral(usuarios[next], next);
        };

        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [handleFichaCadastral, handlePageChange, isFichaModalOpen, isModalOpen, page, previewIndex, previewUsuarioId, selectedRowId, totalPages, usuarios]);

    const columns: ColumnDef<Usuario>[] = useMemo(() => {
        const cols: ColumnDef<Usuario>[] = [
            {
                accessorKey: 'IdUsuarios',
                header: 'ID',
                size: 90,
                meta: { align: 'center' },
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <span className="font-semibold text-gray-700 dark:text-gray-200">{row.original.IdUsuarios}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'Nome',
                header: 'Nome',
                cell: ({ row }) => <span className="font-semibold text-gray-900 dark:text-white">{row.original.Nome || '-'}</span>,
            },
            {
                accessorKey: 'Usuario',
                header: 'Usuário',
                cell: ({ row }) => <span className="font-semibold text-gray-700 dark:text-gray-200">{row.original.Usuario || '-'}</span>,
            },
            {
                accessorKey: 'Email',
                header: 'Email',
                cell: ({ row }) => <span className="font-semibold text-gray-700 dark:text-gray-200">{row.original.Email || '-'}</span>,
            },
            {
                accessorKey: 'Perfil',
                header: 'Perfil',
                cell: ({ row }) => (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                        <Shield className="w-3 h-3 mr-1" />
                        {row.original.Perfil}
                    </span>
                ),
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); const idx = usuarios.findIndex((u) => u.IdUsuarios === row.original.IdUsuarios); handleFichaCadastral(row.original, idx >= 0 ? idx : undefined); }}
                            className="h-8 w-8 grid place-items-center text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 rounded-full transition-colors shadow-sm"
                            title="Ficha"
                        >
                            <FileText size={18} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrint(row.original.IdUsuarios); }}
                            className="h-8 w-8 grid place-items-center text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 rounded-full transition-colors shadow-sm"
                            title="Imprimir"
                        >
                            <Printer size={18} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(row.original); }}
                            className="h-8 w-8 grid place-items-center text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 rounded-full transition-colors shadow-sm"
                            title="Editar"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(row.original.IdUsuarios); }}
                            className="h-8 w-8 grid place-items-center text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 rounded-full transition-colors shadow-sm"
                            title="Excluir"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ),
            },
        ];

        return cols;
    }, [handleDelete, handleEdit, handleFichaCadastral, handlePrint, usuarios]);

    const chartsYAxisMax = useMemo(() => {
        if (chartsPeriod === 'daily') return 10;
        if (chartsPeriod === 'weekly') return 50;
        if (chartsPeriod === 'monthly') return 100;
        if (chartsPeriod === 'yearly') return 1000;
        return undefined;
    }, [chartsPeriod]);

    const numberFmt = new Intl.NumberFormat('pt-BR');
    const totalUsuarios = numberFmt.format(stats?.total || 0);
    const totalPerfis = numberFmt.format(stats?.perfis || 0);
    const totalComEmail = numberFmt.format(stats?.comEmail || 0);
    const totalComCpf = numberFmt.format(stats?.comCpf || 0);

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
                <StatCard title="Usuários" value={totalUsuarios} icon={<Users className="w-6 h-6" />} color="blue" />
                <StatCard title="Perfis" value={totalPerfis} icon={<Shield className="w-6 h-6" />} color="green" />
                <StatCard title="Com Email" value={totalComEmail} icon={<Mail className="w-6 h-6" />} color="red" />
                <StatCard title="Com CPF" value={totalComCpf} icon={<IdCard className="w-6 h-6" />} color="purple" />
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 min-h-0 flex flex-col">
                    <div className="flex-1 min-h-0">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={usuarios}
                                storageKey="sindplast:usuarios:listgrid:columnSizing"
                                pageCount={data?.pages || 0}
                                page={page}
                                onPageChange={handlePageChange}
                                pageSize={limit}
                                onPageSizeChange={handlePageSizeChange}
                                pageSizeOptions={[10, 25, 50, 100, 'all']}
                                sortingState={sortingState}
                                onSortingStateChange={handleSortingChange}
                                total={data?.total || 0}
                                onRowClick={(row) => setSelectedRowId((row as any).IdUsuarios)}
                                onRowDoubleClick={(row) => {
                                    const idx = usuarios.findIndex((u) => u.IdUsuarios === (row as any).IdUsuarios);
                                    handleFichaCadastral(row as any, idx >= 0 ? idx : undefined);
                                }}
                                highlightRowId={selectedRowId}
                                highlightRowClassName="bg-[#FF6347]"
                                highlightCellClassName="text-white"
                                getRowId={(r) => (r as any).IdUsuarios}
                                searchValue={search}
                                onSearchChange={handleSearch}
                                actions={
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => { setSelectedUsuario(null); setIsModalOpen(true); }}
                                        className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 focus:ring-red-500"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        NOVO USUÁRIO
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </div>

                <div className="xl:col-span-4 min-h-0 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <BarChart3 className="w-5 h-5 text-white" />
                            <h2 className="font-black text-white uppercase tracking-wide">USUÁRIOS - DADOS ESTATÍSTICOS</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-44">
                                <NavbarListbox
                                    value={chartsPeriod}
                                    onValueChange={(v) => setChartsPeriod(v as any)}
                                    options={[
                                        { value: 'daily', label: 'DIÁRIO' },
                                        { value: 'weekly', label: 'SEMANAL' },
                                        { value: 'monthly', label: 'MENSAL' },
                                        { value: 'yearly', label: 'ANUAL' },
                                        { value: 'range', label: 'PERÍODO' },
                                    ]}
                                    placeholder="PERÍODO"
                                />
                            </div>
                            {chartsPeriod === 'range' && (
                                <div className="hidden sm:flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={chartsFrom}
                                        onChange={(e) => setChartsFrom(e.target.value)}
                                        className="h-9 rounded-lg border border-white/20 bg-white/10 px-2 text-xs font-bold uppercase tracking-wide text-white outline-none focus:ring-2 focus:ring-white/20"
                                    />
                                    <input
                                        type="date"
                                        value={chartsTo}
                                        onChange={(e) => setChartsTo(e.target.value)}
                                        className="h-9 rounded-lg border border-white/20 bg-white/10 px-2 text-xs font-bold uppercase tracking-wide text-white outline-none focus:ring-2 focus:ring-white/20"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 p-6">
                        {chartsLoading ? (
                            <div className="h-full w-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                Carregando gráficos...
                            </div>
                        ) : chartsIsError ? (
                            <div className="h-full w-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-sm text-red-600 dark:text-red-400 px-4 text-center">
                                {(chartsError as any)?.message || 'Erro ao carregar gráficos'}
                            </div>
                        ) : (
                            <div className="h-full overflow-auto pr-1">
                                <div className="grid grid-cols-1 gap-4">
                                    <MiniChartCard title="Evolução: Usuários cadastrados" delay={0}>
                                        <EChart height="190px" options={lineOption('Cadastrados', chartsData?.evolution.labels || [], chartsData?.evolution.cadastrados || [], chartsYAxisMax)} />
                                    </MiniChartCard>
                                    <MiniChartCard title="Por perfil (Top 10)" delay={0.05}>
                                        <EChart height="240px" options={barOption('Perfil', chartsData?.byPerfil || [], 220)} />
                                    </MiniChartCard>
                                    <MiniChartCard title="Por função (Top 10)" delay={0.1}>
                                        <EChart height="240px" options={barOption('Função', chartsData?.byFuncao || [], 240)} />
                                    </MiniChartCard>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <UsuarioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                usuario={selectedUsuario}
                onSave={handleSuccess}
            />

            <UsuariosFichaModal
                isOpen={isFichaModalOpen}
                onClose={() => {
                    setIsFichaModalOpen(false);
                    setPreviewUsuarioId(null);
                    setPreviewIndex(null);
                }}
                usuario={previewUsuario}
                canViewField={canViewField}
                onEdit={(u) => {
                    setIsFichaModalOpen(false);
                    setPreviewUsuarioId(null);
                    setPreviewIndex(null);
                    handleEdit(u);
                }}
                onDelete={(u) => handleDelete(u.IdUsuarios)}
                onPrint={(u) => handlePrint(u.IdUsuarios)}
            />
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
    const colorClasses: Record<string, { gradient: string; glow: string }> = {
        blue: { gradient: 'from-sky-500 via-blue-600 to-indigo-700', glow: 'shadow-blue-500/30' },
        green: { gradient: 'from-green-500 via-emerald-500 to-lime-400', glow: 'shadow-emerald-500/30' },
        red: { gradient: 'from-red-600 via-rose-600 to-orange-500', glow: 'shadow-red-500/30' },
        purple: { gradient: 'from-fuchsia-600 via-purple-600 to-indigo-600', glow: 'shadow-fuchsia-500/30' },
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className={`relative overflow-hidden rounded-2xl text-white shadow-xl ${colorClasses[color].glow} bg-gradient-to-br ${colorClasses[color].gradient}`}
            whileHover={{ scale: 1.01 }}
        >
            <div className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 grid place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm shrink-0">
                        {icon}
                    </div>
                    <p className="text-sm font-black tracking-widest uppercase text-white/90 truncate">{title}</p>
                </div>
                <p className="text-2xl font-black tracking-tight drop-shadow-sm text-right whitespace-nowrap">{value}</p>
            </div>
        </motion.div>
    );
}

function MiniChartCard({ title, children, delay }: { title: string; children: React.ReactNode; delay: number }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: 'spring', stiffness: 320, damping: 28 }}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/30 overflow-hidden"
        >
            <div className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-800 border-b border-white/10 text-xs font-black text-white uppercase tracking-wide">
                {String(title || '').toUpperCase()}
            </div>
            <div className="p-3">{children}</div>
        </motion.div>
    );
}

function lineOption(name: string, labels: string[], values: number[], yMax?: number) {
    const upperName = String(name || '').toUpperCase();
    const upperLabels = (labels || []).map((l) => String(l || '').toUpperCase());
    const maxValue = Math.max(0, ...(values || []).map((v) => Number(v) || 0));
    const computedMax = typeof yMax === 'number' ? yMax : maxValue <= 10 ? 10 : maxValue <= 100 ? 100 : maxValue <= 200 ? 200 : undefined;
    const interval =
        typeof computedMax === 'number'
            ? computedMax <= 10
                ? 1
                : computedMax <= 100
                ? 20
                : computedMax <= 200
                ? 50
                : Math.ceil(computedMax / 5)
            : undefined;
    return {
        grid: { left: 10, right: 10, top: 14, bottom: 28, containLabel: true },
        legend: { show: false },
        xAxis: {
            type: 'category',
            data: upperLabels,
            axisLabel: { color: '#9CA3AF', fontSize: 10, margin: 10 },
            axisLine: { lineStyle: { color: 'rgba(156,163,175,0.25)' } },
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#9CA3AF', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(156,163,175,0.15)' } },
            min: 0,
            max: computedMax,
            interval,
        },
        tooltip: { trigger: 'axis' },
        series: [
            {
                name: upperName,
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: values,
                lineStyle: { width: 3 },
                areaStyle: { opacity: 0.2 },
                emphasis: { focus: 'series' },
            },
        ],
        color: ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#14b8a6'],
    };
}

function barOption(title: string, data: Array<{ name: string; value: number }>, labelWidth = 120) {
    const upperTitle = String(title || '').toUpperCase();
    const names = data.map((d) => String(d?.name || '').toUpperCase());
    const values = data.map((d) => d.value);
    const palette = ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#14b8a6', '#e11d48', '#6366f1', '#0ea5e9', '#84cc16'];
    return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 10, right: 10, top: 16, bottom: 28, containLabel: true },
        legend: { show: false },
        xAxis: {
            type: 'value',
            axisLabel: { color: '#9CA3AF', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(156,163,175,0.15)' } },
        },
        yAxis: {
            type: 'category',
            data: names,
            axisLabel: { color: '#9CA3AF', fontSize: 10, width: labelWidth, overflow: 'truncate' },
            axisLine: { lineStyle: { color: 'rgba(156,163,175,0.25)' } },
        },
        series: [
            {
                name: upperTitle,
                type: 'bar',
                data: values,
                barWidth: 14,
                itemStyle: {
                    borderRadius: [8, 8, 8, 8],
                    color: (params: any) => palette[(params?.dataIndex ?? 0) % palette.length],
                },
            },
        ],
        color: palette,
    };
}
