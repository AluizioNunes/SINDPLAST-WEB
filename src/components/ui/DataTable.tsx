'use client';

import React, { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    ColumnDef,
    flexRender,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    ColumnOrderState,
    ColumnSizingState,
    ColumnSizingInfoState,
} from '@tanstack/react-table';
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Search,
    Settings2,
    Check,
    GripVertical,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

// --- Types ---

export interface DataTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData, any>[];
    storageKey?: string;
    searchPlaceholder?: string;
    pageCount?: number;
    page?: number;
    onPageChange?: (page: number) => void;
    pageSize?: number | 'all';
    onPageSizeChange?: (pageSize: number | 'all') => void;
    pageSizeOptions?: Array<number | 'all'>;
    sortingState?: SortingState;
    onSortingStateChange?: (sorting: SortingState) => void;
    total?: number;
    onRowClick?: (row: TData) => void;
    highlightRowId?: string | number | null;
    getRowId?: (row: TData) => string | number;
    actions?: React.ReactNode;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
}

interface DraggableHeaderProps {
    header: any;
}

const DraggableHeader = ({ header }: DraggableHeaderProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: header.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0,
        opacity: isDragging ? 0.7 : 1,
        width: header.getSize?.() ?? undefined,
    };

    return (
        <th
            ref={setNodeRef}
            style={style}
            className="px-6 py-4 text-center text-xs font-bold text-white/90 uppercase tracking-wider relative group"
        >
            {header.isPlaceholder ? null : (
                <div className="flex items-center gap-2 relative">
                    <button
                        type="button"
                        {...attributes}
                        {...listeners}
                        className="p-1 hover:bg-white/10 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity absolute left-1 top-1/2 -translate-y-1/2"
                        aria-label="Arrastar coluna"
                    >
                        <GripVertical className="w-3 h-3" />
                    </button>

                    <div
                        className="flex items-center justify-center gap-2 cursor-pointer select-none flex-1"
                        onClick={header.column.getToggleSortingHandler()}
                    >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                            <div className="text-white/80">
                                {{
                                    asc: <ChevronUp className="w-3 h-3" />,
                                    desc: <ChevronDown className="w-3 h-3" />,
                                }[header.column.getIsSorted() as string] ?? (
                                    <ChevronsUpDown className="w-3 h-3 opacity-40" />
                                )}
                            </div>
                        )}
                    </div>

                    {header.column.getCanResize?.() && (
                        <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-0 h-full w-2 cursor-col-resize select-none opacity-0 group-hover:opacity-100"
                        >
                            <div className="h-full w-px bg-white/30 mx-auto" />
                        </div>
                    )}
                </div>
            )}
        </th>
    );
};

// --- Main DataTable Component ---

export default function DataTable<TData>({
    data,
    columns,
    storageKey,
    searchPlaceholder = 'Buscar...',
    pageCount: _pageCount,
    page: _page = 1,
    onPageChange: _onPageChange,
    pageSize: _pageSize,
    onPageSizeChange: _onPageSizeChange,
    pageSizeOptions: _pageSizeOptions,
    sortingState,
    onSortingStateChange,
    total: _total,
    onRowClick,
    highlightRowId,
    getRowId,
    actions,
    searchValue,
    onSearchChange,
}: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
        columns.map((column) => (column.id || (column as any).accessorKey) as string)
    );
    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => {
        if (!storageKey) return {};
        if (typeof window === 'undefined') return {};
        try {
            const raw = window.localStorage.getItem(storageKey);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return {};
            return parsed as ColumnSizingState;
        } catch {
            return {};
        }
    });
    const [columnSizingInfo, setColumnSizingInfo] = useState<ColumnSizingInfoState>({} as any);
    const [globalFilter, setGlobalFilter] = useState('');
    const effectiveSorting = sortingState ?? sorting;
    const isServerSorting = !!onSortingStateChange;
    const isServerPagination = !!_onPageChange;
    const handleSortingChange = (updater: any) => {
        const nextSorting = typeof updater === 'function' ? updater(effectiveSorting) : updater;
        if (onSortingStateChange) onSortingStateChange(nextSorting);
        else setSorting(nextSorting);
    };

    const handleColumnSizingChange = (updater: any) => {
        setColumnSizing((prev) => {
            const nextSizing = typeof updater === 'function' ? updater(prev) : updater;
            if (storageKey && typeof window !== 'undefined') {
                try {
                    window.localStorage.setItem(storageKey, JSON.stringify(nextSizing));
                } catch {
                    // ignore
                }
            }
            return nextSizing;
        });
    };

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting: effectiveSorting,
            columnFilters,
            columnVisibility,
            columnOrder,
            globalFilter,
            columnSizing,
            columnSizingInfo,
        },
        onSortingChange: handleSortingChange,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onGlobalFilterChange: setGlobalFilter,
        onColumnSizingChange: handleColumnSizingChange,
        onColumnSizingInfoChange: setColumnSizingInfo,
        manualSorting: isServerSorting,
        manualPagination: isServerPagination,
        pageCount: isServerPagination ? (_pageCount || 1) : undefined,
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: isServerSorting ? undefined : getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: isServerPagination ? undefined : getPaginationRowModel(),
    });

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;
        setColumnOrder((prev) => {
            const oldIndex = prev.indexOf(active.id as string);
            const newIndex = prev.indexOf(over.id as string);
            if (oldIndex === -1 || newIndex === -1) return prev;
            return arrayMove(prev, oldIndex, newIndex);
        });
    };

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchValue ?? globalFilter ?? ''}
                            onChange={(e) => {
                                if (onSearchChange) onSearchChange(e.target.value);
                                else setGlobalFilter(e.target.value);
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none text-sm"
                        />
                    </div>
                    {actions}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Column Visibility Toggle */}
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm">
                                <Settings2 className="w-4 h-4" />
                                Colunas
                            </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                className="z-50 min-w-[200px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 animate-in fade-in zoom-in duration-200"
                                align="end"
                            >
                                <DropdownMenu.Label className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    Visualização de Colunas
                                </DropdownMenu.Label>
                                <DropdownMenu.Separator className="h-px bg-gray-100 dark:bg-gray-700 my-1" />

                                {table.getAllLeafColumns().map((column) => {
                                    return (
                                        <DropdownMenu.CheckboxItem
                                            key={column.id}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 outline-none cursor-pointer data-[state=checked]:text-red-600 dark:data-[state=checked]:text-red-400"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            <div className="w-4 h-4 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded">
                                                <DropdownMenu.ItemIndicator>
                                                    <Check className="w-3 h-3" />
                                                </DropdownMenu.ItemIndicator>
                                            </div>
                                            {typeof column.columnDef.header === 'string'
                                                ? column.columnDef.header
                                                : column.id}
                                        </DropdownMenu.CheckboxItem>
                                    );
                                })}
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            </div>

            {/* Table Container */}
            <div className="glass-card shadow-xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm relative flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="overflow-auto flex-1 min-h-0">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <table className="w-full border-collapse table-fixed">
                            <thead className="bg-gradient-to-r from-red-600 to-red-800 border-b border-red-900/20">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                                            {headerGroup.headers.map((header) => (
                                                <DraggableHeader key={header.id} header={header} />
                                            ))}
                                        </SortableContext>
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map((row) => (
                                        (() => {
                                            const rowKey = getRowId ? getRowId(row.original) : (row.original as any)?.id;
                                            const isHighlighted = highlightRowId != null && rowKey === highlightRowId;
                                            return (
                                        <tr
                                            key={row.id}
                                            onClick={() => onRowClick?.(row.original)}
                                            className={`transition-colors group ${onRowClick ? 'cursor-pointer' : ''} ${isHighlighted ? 'bg-red-50/80 dark:bg-red-900/25' : 'hover:bg-red-50/30 dark:hover:bg-red-900/10'}`}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td
                                                    key={cell.id}
                                                    className={`px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 ${
                                                        (cell.column.columnDef as any)?.meta?.align === 'center' ? 'text-center' : 'text-left'
                                                    }`}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                            );
                                        })()
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            Nenhum dado encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </DndContext>
                </div>

                {/* Pagination Controls */}
                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 bg-gray-50/30 dark:bg-gray-800/30 rounded-b-2xl">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Mostrando <span className="font-bold text-gray-700 dark:text-gray-200">{table.getRowModel().rows.length}</span> de{' '}
                        <span className="font-bold text-gray-700 dark:text-gray-200">{_total || data.length}</span> registros
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        {_pageSizeOptions && _onPageSizeChange && (
                            <div className="flex items-center gap-2 mr-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                    Registros
                                </span>
                                <select
                                    value={_pageSize ?? ''}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        _onPageSizeChange(v === 'all' ? 'all' : Number(v));
                                    }}
                                    className="h-10 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                >
                                    {_pageSizeOptions.map((opt) => (
                                        <option key={String(opt)} value={opt === 'all' ? 'all' : String(opt)}>
                                            {opt === 'all' ? 'TODOS' : opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                if (_onPageChange) _onPageChange(1);
                                else table.setPageIndex(0);
                            }}
                            disabled={_onPageChange ? (_pageCount ? _page <= 1 : true) : !table.getCanPreviousPage()}
                            className="h-10 w-10 grid place-items-center border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                            title="Primeira página"
                        >
                            <ChevronFirst className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                if (_onPageChange && _page) _onPageChange(_page - 1);
                                else table.previousPage();
                            }}
                            disabled={_page && _pageCount ? _page <= 1 : !table.getCanPreviousPage()}
                            className="h-10 w-10 grid place-items-center border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {_onPageChange ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                    Página
                                </span>
                                <input
                                    type="number"
                                    min={1}
                                    max={_pageCount || 1}
                                    value={_page}
                                    onChange={(e) => {
                                        const raw = Number(e.target.value);
                                        const max = _pageCount || 1;
                                        const next = Math.min(max, Math.max(1, raw || 1));
                                        _onPageChange(next);
                                    }}
                                    className="h-10 w-24 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                />
                                <span className="text-sm text-gray-400">/</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {_pageCount || 1}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {table.getState().pagination.pageIndex + 1}
                                </span>
                                <span className="text-sm text-gray-400">/</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {table.getPageCount() || 1}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                if (_onPageChange && _page) _onPageChange(_page + 1);
                                else table.nextPage();
                            }}
                            disabled={_page && _pageCount ? _page >= _pageCount : !table.getCanNextPage()}
                            className="h-10 w-10 grid place-items-center border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                if (_onPageChange && _pageCount) _onPageChange(_pageCount);
                                else table.setPageIndex(Math.max(0, table.getPageCount() - 1));
                            }}
                            disabled={_onPageChange ? (_pageCount ? _page >= _pageCount : true) : !table.getCanNextPage()}
                            className="h-10 w-10 grid place-items-center border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                            title="Última página"
                        >
                            <ChevronLast className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChevronLeft({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6" /></svg>;
}

function ChevronRight({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>;
}

function ChevronFirst({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M11 18 5 12l6-6" />
            <path d="M19 18 13 12l6-6" />
        </svg>
    );
}

function ChevronLast({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m13 18 6-6-6-6" />
            <path d="m5 18 6-6-6-6" />
        </svg>
    );
}
