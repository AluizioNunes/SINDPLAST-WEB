import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, UserCircle, Users, UserX, Building2, BadgeCheck, FileText, Printer, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import { backfillDependentesEmpresaFromSocio, deleteDependente, getDependentes, getDependentesChartsData, getDependentesStats } from '@/lib/services/dependenteService';
import { Dependente } from '@/lib/types/dependente';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import DependenteModal from '@/components/modals/DependenteModal';
import DependentesFichaModal from '@/components/modals/DependentesFichaModal';
import NavbarListbox from '@/components/ui/NavbarListbox';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import EChart from '@/components/charts/EChart';
import { usePermissions } from '@/hooks/usePermissions';

export default function Dependentes() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { canViewField } = usePermissions();
    
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('q') || '';
    const limitParam = searchParams.get('limit') || '10';
    const limit = limitParam === 'all' ? 'all' : Math.max(1, Number(limitParam) || 10);
    const sortByParam = (searchParams.get('sortBy') || 'id') as
        | 'id'
        | 'dependente'
        | 'socio'
        | 'empresa'
        | 'parentesco'
        | 'nascimento'
        | 'carteira'
        | 'flagOrfao';
    const sortDirParam = (searchParams.get('sortDir') || 'desc') as 'asc' | 'desc';
    const sortingState: SortingState = sortByParam === 'id' ? [] : [{ id: sortByParam, desc: sortDirParam === 'desc' }];
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDependente, setSelectedDependente] = useState<Dependente | null>(null);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const [isFichaModalOpen, setIsFichaModalOpen] = useState(false);
    const [previewDependenteId, setPreviewDependenteId] = useState<number | null>(null);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [filtro, setFiltro] = useState<'todos' | 'orfaos' | 'sem_empresa'>('todos');
    const [chartsPeriod, setChartsPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'range'>('daily');
    const [chartsFrom, setChartsFrom] = useState<string>('');
    const [chartsTo, setChartsTo] = useState<string>('');

    const { data, isLoading } = useQuery({
        queryKey: ['dependentes', page, search, limit, sortByParam, sortDirParam],
        queryFn: () => getDependentes({ page, search, limit, sortBy: sortByParam, sortDir: sortDirParam }),
        placeholderData: (data) => data,
    });

    const { data: stats } = useQuery({
        queryKey: ['dependenteStats'],
        queryFn: getDependentesStats,
    });

    const { data: chartsData, isLoading: chartsLoading, isError: chartsIsError, error: chartsError } = useQuery({
        queryKey: ['dependentes-charts-data', chartsPeriod, chartsFrom, chartsTo],
        queryFn: () =>
            getDependentesChartsData({
                period: chartsPeriod,
                dateFrom: chartsPeriod === 'range' ? (chartsFrom || null) : null,
                dateTo: chartsPeriod === 'range' ? (chartsTo || null) : null,
            }),
    });

    const filteredDependentes = useMemo(() => {
        const list = data?.data || [];
        if (filtro === 'orfaos') return list.filter(d => d.flagOrfao || !d.codSocio);
        if (filtro === 'sem_empresa') return list.filter(d => !d.empresa || String(d.empresa).trim().length === 0);
        return list;
    }, [data?.data, filtro]);

    const deleteMutation = useMutation({
        mutationFn: deleteDependente,
        onSuccess: () => {
            toast.success('Dependente excluído com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['dependentes'] });
            queryClient.invalidateQueries({ queryKey: ['dependenteStats'] });
        },
        onError: (error) => {
            console.error('Error deleting dependente:', error);
            toast.error('Erro ao excluir dependente');
        },
    });

    const backfillMutation = useMutation({
        mutationFn: () => backfillDependentesEmpresaFromSocio({ batchSize: 300 }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dependentes'] });
            queryClient.invalidateQueries({ queryKey: ['dependenteStats'] });
            queryClient.invalidateQueries({ queryKey: ['dependentes-charts-data'] });
        },
    });

    const handleBackfillEmpresas = useCallback(async () => {
        if (backfillMutation.isPending) return;
        try {
            toast.loading('Corrigindo empresas dos dependentes...', { id: 'deps-backfill' });
            let totalUpdated = 0;
            let rounds = 0;

            while (rounds < 200) {
                rounds += 1;
                const res = await backfillMutation.mutateAsync();
                totalUpdated += res.updated;
                if (res.scanned === 0) break;
                if (res.updated === 0) break;
            }

            if (totalUpdated === 0) {
                toast.error('Nenhum registro foi atualizado. Provável falta de permissão (RLS) no Supabase.', { id: 'deps-backfill' });
                return;
            }

            toast.success(`Correção concluída. Registros atualizados: ${totalUpdated}`, { id: 'deps-backfill' });
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Erro ao corrigir empresas';
            toast.error(msg, { id: 'deps-backfill' });
        }
    }, [backfillMutation]);

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
            const allowed = new Set(['dependente', 'socio', 'empresa', 'parentesco', 'nascimento', 'carteira', 'flagOrfao']);
            if (!allowed.has(s.id)) return prev;

            prev.set('sortBy', s.id);
            prev.set('sortDir', s.desc ? 'desc' : 'asc');
            return prev;
        });
    };

    const handleDelete = useCallback(async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este dependente?')) return;
        deleteMutation.mutate(id);
    }, [deleteMutation]);

    const handleEdit = useCallback((dependente: Dependente) => {
        setSelectedDependente(dependente);
        setSelectedRowId(dependente.id);
        setIsModalOpen(true);
    }, []);

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['dependentes'] });
        queryClient.invalidateQueries({ queryKey: ['dependenteStats'] });
        queryClient.invalidateQueries({ queryKey: ['dependentes-charts-data'] });
        setIsModalOpen(false);
    };

    const handleFichaCadastral = useCallback((dependente: Dependente, index?: number) => {
        setIsFichaModalOpen(true);
        setPreviewDependenteId(dependente.id);
        setPreviewIndex(typeof index === 'number' ? index : null);
        setSelectedRowId(dependente.id);
    }, []);

    const handlePrint = useCallback((id: number) => {
        window.open(`/relatorios/print/dependente/${id}`, '_blank', 'noopener,noreferrer');
    }, []);

    const dependentes = useMemo(() => filteredDependentes, [filteredDependentes]);
    const totalPages = data?.pages || 0;
    const previewDependente = useMemo(() => {
        if (!isFichaModalOpen) return null;
        if (!dependentes.length) return null;

        if (previewDependenteId != null) {
            return dependentes.find((d) => d.id === previewDependenteId) || null;
        }

        if (previewIndex == null) return null;
        const idx = previewIndex === -1 ? dependentes.length - 1 : Math.min(Math.max(0, previewIndex), dependentes.length - 1);
        return dependentes[idx] || null;
    }, [dependentes, isFichaModalOpen, previewDependenteId, previewIndex]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (isModalOpen) return;
            const target = e.target as HTMLElement | null;
            const tag = target?.tagName;
            if (target?.isContentEditable) return;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            if (e.key === 'Escape' && isFichaModalOpen) {
                setIsFichaModalOpen(false);
                setPreviewDependenteId(null);
                setPreviewIndex(null);
                return;
            }

            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            if (!dependentes.length) return;

            e.preventDefault();

            if (!isFichaModalOpen) {
                const current = selectedRowId != null ? dependentes.findIndex((s) => s.id === selectedRowId) : -1;
                const step = e.key === 'ArrowDown' ? 1 : -1;
                let next = current === -1 ? (step === 1 ? 0 : dependentes.length - 1) : current + step;
                next = Math.min(dependentes.length - 1, Math.max(0, next));
                setSelectedRowId(dependentes[next].id);
                return;
            }

            const current =
                previewDependenteId != null
                    ? dependentes.findIndex((s) => s.id === previewDependenteId)
                    : previewIndex != null
                      ? (previewIndex === -1 ? dependentes.length - 1 : previewIndex)
                      : -1;

            const step = e.key === 'ArrowDown' ? 1 : -1;
            let next = current === -1 ? (step === 1 ? 0 : dependentes.length - 1) : current + step;

            if (next < 0) {
                if (page > 1) {
                    handlePageChange(page - 1);
                    setIsFichaModalOpen(true);
                    setPreviewDependenteId(null);
                    setPreviewIndex(-1);
                    return;
                }
                next = 0;
            }

            if (next >= dependentes.length) {
                if (page < totalPages) {
                    handlePageChange(page + 1);
                    setIsFichaModalOpen(true);
                    setPreviewDependenteId(null);
                    setPreviewIndex(0);
                    return;
                }
                next = dependentes.length - 1;
            }

            setPreviewDependenteId(dependentes[next].id);
            setPreviewIndex(null);
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [
        dependentes,
        handlePageChange,
        isFichaModalOpen,
        isModalOpen,
        page,
        previewDependenteId,
        previewIndex,
        selectedRowId,
        totalPages,
    ]);

    const columns = useMemo((): ColumnDef<Dependente>[] => {
        const cols: ColumnDef<Dependente>[] = [];

        cols.push({
            id: 'foto',
            header: 'Foto',
            cell: ({ row }) => {
                const dep = row.original;
                const src = dep.imagem ? (String(dep.imagem).includes('://') ? String(dep.imagem) : `/images/dependentes/${dep.imagem}`) : '';
                return dep.imagem ? (
                    <div className="relative w-10 h-10">
                        <img
                            src={src}
                            alt={dep.dependente || 'Foto do dependente'}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-white shadow-sm">
                        <UserCircle className="w-6 h-6 text-gray-400" />
                    </div>
                );
            },
        });

        if (canViewField('dependentes', 'nome')) {
            cols.push({
                accessorKey: 'dependente',
                header: 'Nome',
                cell: ({ row }) => (
                    <span className="font-black text-gray-900 dark:text-white uppercase text-xs">
                        {row.original.dependente || '-'}
                    </span>
                ),
            });
        }

        if (canViewField('dependentes', 'parentesco')) {
            cols.push({
                accessorKey: 'parentesco',
                header: 'Parentesco',
                cell: ({ row }) => <span className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">{row.original.parentesco || '-'}</span>,
            });
        }

        if (canViewField('dependentes', 'nascimento')) {
            cols.push({
                accessorKey: 'nascimento',
                header: 'Nascimento',
                cell: ({ row }) => {
                    const date = row.original.nascimento;
                    if (!date) return '-';
                    const d = new Date(date);
                    return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString('pt-BR');
                },
            });
        }

        if (canViewField('dependentes', 'socio')) {
            cols.push({
                accessorKey: 'socio',
                header: 'Sócio',
                cell: ({ row }) => (
                    <div className="flex flex-col text-xs">
                        <span className="font-black text-gray-900 dark:text-white uppercase">{row.original.socio || '-'}</span>
                        {row.original.empresa ? (
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase truncate">
                                {row.original.empresa}
                            </span>
                        ) : null}
                    </div>
                ),
            });
        }

        cols.push({
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const idx = dependentes.findIndex((s) => s.id === row.original.id);
                            handleFichaCadastral(row.original, idx >= 0 ? idx : undefined);
                        }}
                        className="h-8 w-8 grid place-items-center text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 rounded-full transition-colors shadow-sm"
                        title="Ficha"
                    >
                        <FileText size={18} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePrint(row.original.id);
                        }}
                        className="h-8 w-8 grid place-items-center text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 rounded-full transition-colors shadow-sm"
                        title="Imprimir"
                    >
                        <Printer size={18} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row.original);
                        }}
                        className="h-8 w-8 grid place-items-center text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 rounded-full transition-colors shadow-sm"
                        title="Editar"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.original.id);
                        }}
                        className="h-8 w-8 grid place-items-center text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 rounded-full transition-colors shadow-sm"
                        title="Excluir"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
        });

        return cols;
    }, [canViewField, dependentes, handleDelete, handleEdit, handleFichaCadastral, handlePrint]);

    const chartsYAxisMax = useMemo(() => {
        if (chartsPeriod === 'daily') return 20;
        if (chartsPeriod === 'weekly') return 100;
        if (chartsPeriod === 'monthly') return 200;
        if (chartsPeriod === 'yearly') return 2000;
        return undefined;
    }, [chartsPeriod]);

    const numberFmt = new Intl.NumberFormat('pt-BR');
    const totalDependentes = numberFmt.format(stats?.total || 0);
    const totalOrfaos = numberFmt.format(stats?.orfaos || 0);
    const totalSemEmpresa = numberFmt.format(stats?.semEmpresa || 0);
    const totalCarteira = numberFmt.format(stats?.comCarteira || 0);

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
                <StatCard title="Dependentes" value={totalDependentes} icon={<Users className="w-6 h-6" />} color="blue" />
                <StatCard title="Órfãos" value={totalOrfaos} icon={<UserX className="w-6 h-6" />} color="red" />
                <StatCard title="Sem Empresa" value={totalSemEmpresa} icon={<Building2 className="w-6 h-6" />} color="purple" />
                <StatCard title="Com Carteira" value={totalCarteira} icon={<BadgeCheck className="w-6 h-6" />} color="green" />
            </div>
            {Number(stats?.semEmpresa || 0) > 0 ? (
                <div className="flex items-center justify-end">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleBackfillEmpresas}
                        disabled={backfillMutation.isPending}
                        className="bg-white/80 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800"
                    >
                        {backfillMutation.isPending ? 'CORRIGINDO...' : 'CORRIGIR EMPRESAS (RAZÃO SOCIAL / NOME FANTASIA)'}
                    </Button>
                </div>
            ) : null}

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
                                data={dependentes}
                                storageKey="sindplast:dependentes:listgrid:columnSizing"
                                pageCount={data?.pages || 0}
                                page={page}
                                onPageChange={handlePageChange}
                                pageSize={limit}
                                onPageSizeChange={handlePageSizeChange}
                                pageSizeOptions={[10, 25, 50, 100, 'all']}
                                sortingState={sortingState}
                                onSortingStateChange={handleSortingChange}
                                total={data?.total || 0}
                                onRowClick={(row) => setSelectedRowId((row as any).id)}
                                onRowDoubleClick={(row) => {
                                    const idx = dependentes.findIndex((s) => s.id === (row as any).id);
                                    handleFichaCadastral(row as any, idx >= 0 ? idx : undefined);
                                }}
                                highlightRowId={selectedRowId}
                                highlightRowClassName="bg-[#FF6347]"
                                highlightCellClassName="text-white"
                                getRowId={(r) => (r as any).id}
                                searchValue={search}
                                onSearchChange={handleSearch}
                                actions={
                                    <div className="flex items-center gap-2">
                                        <select
                                            className="h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 px-3 text-xs font-black uppercase tracking-wide text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500"
                                            value={filtro}
                                            onChange={(e) => setFiltro(e.target.value as any)}
                                        >
                                            <option value="todos">TODOS</option>
                                            <option value="orfaos">ÓRFÃOS</option>
                                            <option value="sem_empresa">SEM EMPRESA</option>
                                        </select>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => { setSelectedDependente(null); setIsModalOpen(true); }}
                                            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 focus:ring-red-500"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            NOVO DEPENDENTE
                                        </Button>
                                    </div>
                                }
                            />
                        )}
                    </div>
                </div>

                <div className="xl:col-span-4 min-h-0 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <BarChart3 className="w-5 h-5 text-white" />
                            <h2 className="font-black text-white uppercase tracking-wide">DEPENDENTES - DADOS ESTATÍSTICOS</h2>
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
                                    <MiniChartCard title="Evolução: Dependentes cadastrados" delay={0}>
                                        <EChart height="190px" options={lineOption('Cadastrados', chartsData?.evolution.labels || [], chartsData?.evolution.cadastrados || [], chartsYAxisMax)} />
                                    </MiniChartCard>
                                    <MiniChartCard title="Evolução: Órfãos" delay={0.05}>
                                        <EChart height="190px" options={lineOption('Órfãos', chartsData?.evolution.labels || [], chartsData?.evolution.orfaos || [], chartsYAxisMax)} />
                                    </MiniChartCard>
                                    <MiniChartCard title="Evolução: Com carteira" delay={0.1}>
                                        <EChart height="190px" options={lineOption('Carteiras', chartsData?.evolution.labels || [], chartsData?.evolution.carteiras || [], chartsYAxisMax)} />
                                    </MiniChartCard>
                                    <MiniChartCard title="Dependentes por parentesco (Top 10)" delay={0.15}>
                                        <EChart height="240px" options={barOption('Parentesco', chartsData?.byParentesco || [], 200)} />
                                    </MiniChartCard>
                                    <MiniChartCard title="Dependentes por empresa (Top 10)" delay={0.2}>
                                        <EChart height="240px" options={barOption('Empresa', chartsData?.byEmpresa || [], 240)} />
                                    </MiniChartCard>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DependenteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                dependente={selectedDependente}
                onSave={handleSuccess}
            />

            <DependentesFichaModal
                isOpen={isFichaModalOpen}
                onClose={() => {
                    setIsFichaModalOpen(false);
                    setPreviewDependenteId(null);
                    setPreviewIndex(null);
                }}
                dependente={previewDependente}
                canViewField={canViewField}
                onEdit={(d) => {
                    setIsFichaModalOpen(false);
                    setPreviewDependenteId(null);
                    setPreviewIndex(null);
                    handleEdit(d);
                }}
                onDelete={(d) => handleDelete(d.id)}
                onPrint={(d) => handlePrint(d.id)}
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
