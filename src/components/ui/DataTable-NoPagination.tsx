'use client';

import React, { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    ColumnDef,
    flexRender,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    ColumnOrderState,
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
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Search,
    GripVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---

interface DataTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData>[];
    searchPlaceholder?: string;
}

// --- Helper Functions ---

function DraggableRowHeader({ header }: { header: any }) {
    const { attributes, isDragging, listeners, setNodeRef, transform } = useSortable({
        id: header.column.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <th
            ref={setNodeRef}
            style={style}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-move hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            {...attributes}
            {...listeners}
        >
            <div className="flex items-center gap-2">
                <GripVertical className="w-3 h-3 opacity-30" />
                {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                    )}
                <div className="ml-2">
                    {header.column.getCanSort() ? (
                        <button
                            onClick={header.column.getToggleSortingHandler()}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                            {header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown className="w-3 h-3" />
                            ) : header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp className="w-3 h-3" />
                            ) : (
                                <ChevronsUpDown className="w-3 h-3 opacity-30" />
                            )}
                        </button>
                    ) : (
                        <div className="p-1">
                            <ChevronsUpDown className="w-3 h-3 opacity-30" />
                        </div>
                    )}
                </div>
            </div>
        </th>
    );
}

// --- Main DataTable Component ---

export default function DataTable<TData>({
    data,
    columns,
    searchPlaceholder = 'Buscar...',
}: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
        columns.map((column) => (column.id || (column as any).accessorKey) as string)
    );
    const [globalFilter, setGlobalFilter] = useState('');

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable<TData>({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            columnOrder,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        // REMOVIDO: getPaginationRowModel(),
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor),
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            setColumnOrder((columnOrder) => {
                const oldIndex = columnOrder.indexOf(active.id as string);
                const newIndex = columnOrder.indexOf(over.id as string);
                return arrayMove(columnOrder, oldIndex, newIndex);
            });
        }
    }

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <DraggableRowHeader key={header.id} header={header} />
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {table.getRowModel().rows?.length ? (
                                    <AnimatePresence>
                                        {table.getRowModel().rows.map((row) => (
                                            <motion.tr
                                                key={row.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors group"
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
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
                    </div>
                </DndContext>
            </div>

            {/* REMOVIDO: Pagination Controls */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/30 rounded-b-2xl">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Mostrando <span className="font-bold text-gray-700 dark:text-gray-200">{table.getRowModel().rows.length}</span> de{' '}
                    <span className="font-bold text-gray-700 dark:text-gray-200">{data.length}</span> registros
                </div>
            </div>
        </div>
    );
}

// Custom icons removed

