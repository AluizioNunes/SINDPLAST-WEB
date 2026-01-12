'use client';

import React, { useState, useMemo } from 'react';
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
    FilterFn,
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
    ArrowUpDown,
    Filter,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---

interface DataTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData, any>[];
    searchPlaceholder?: string;
}

// --- Draggable Header Cell ---

interface DraggableHeaderProps {
    header: any;
}

const DraggableHeader = ({ header }: DraggableHeaderProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({
            id: header.id,
        });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <th
            ref={setNodeRef}
            style={style}
            className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider relative group border-r border-gray-100 dark:border-gray-800 last:border-r-0"
        >
            <div className="flex items-center gap-2">
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <GripVertical className="w-3 h-3" />
                </button>

                <div
                    className={`flex items-center gap-2 cursor-pointer select-none flex-1`}
                    onClick={header.column.getToggleSortingHandler()}
                >
                    {flexRender(header.column.columnDef.header, header.getContext())}

                    {header.column.getCanSort() && (
                        <div className="text-gray-400">
                            {{
                                asc: <ChevronUp className="w-3 h-3" />,
                                desc: <ChevronDown className="w-3 h-3" />,
                            }[header.column.getIsSorted() as string] ?? (
                                    <ChevronsUpDown className="w-3 h-3 opacity-30" />
                                )}
                        </div>
                    )}
                </div>
            </div>
        </th>
    );
};

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

    const table = useReactTable({
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
        getPaginationRowModel: getPaginationRowModel(),
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setColumnOrder((prev) => {
                const oldIndex = prev.indexOf(active.id as string);
                const newIndex = prev.indexOf(over.id as string);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none text-sm"
                    />
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
            <div className="glass-card shadow-xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm relative">
                <div className="overflow-x-auto">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        <SortableContext
                                            items={columnOrder}
                                            strategy={horizontalListSortingStrategy}
                                        >
                                            {headerGroup.headers.map((header) => (
                                                <DraggableHeader key={header.id} header={header} />
                                            ))}
                                        </SortableContext>
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                <AnimatePresence mode="popLayout">
                                    {table.getRowModel().rows.length > 0 ? (
                                        table.getRowModel().rows.map((row) => (
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
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </DndContext>
                </div>

                {/* Pagination Controls */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/30 rounded-b-2xl">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Mostrando <span className="font-bold text-gray-700 dark:text-gray-200">{table.getRowModel().rows.length}</span> de{' '}
                        <span className="font-bold text-gray-700 dark:text-gray-200">{data.length}</span> registros
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {table.getState().pagination.pageIndex + 1}
                            </span>
                            <span className="text-sm text-gray-400">/</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {table.getPageCount() || 1}
                            </span>
                        </div>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Custom icons due to missing lucide exports in some environments or versions
function ChevronLeft({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6" /></svg>;
}

function ChevronRight({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>;
}
