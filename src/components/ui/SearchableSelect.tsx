'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';

export type SearchableSelectOption = { value: string; label: string };

interface SearchableSelectProps {
    label?: string;
    value?: string;
    onValueChange: (value: string) => void;
    options: SearchableSelectOption[];
    placeholder?: string;
    disabled?: boolean;
    allowCreate?: boolean;
    onCreateOption?: (value: string) => void;
    uppercase?: boolean;
}

export default function SearchableSelect({
    label,
    value,
    onValueChange,
    options,
    placeholder = 'Selecione...',
    disabled,
    allowCreate,
    onCreateOption,
    uppercase,
}: SearchableSelectProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    const selectedLabel = useMemo(() => {
        const found = options.find((o) => o.value === value);
        return found?.label ?? value ?? '';
    }, [options, value]);

    const normalizedOptions = useMemo(() => {
        const q = (query || '').trim().toUpperCase();
        const list = q
            ? options.filter((o) => o.label.toUpperCase().includes(q) || o.value.toUpperCase().includes(q))
            : options;
        return list.slice(0, 150);
    }, [options, query]);

    const canCreate = useMemo(() => {
        if (!allowCreate) return false;
        const q = (query || '').trim();
        if (!q) return false;
        const upper = q.toUpperCase();
        return !options.some((o) => o.value.toUpperCase() === upper || o.label.toUpperCase() === upper);
    }, [allowCreate, options, query]);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!containerRef.current) return;
            if (containerRef.current.contains(e.target as Node)) return;
            setOpen(false);
        };
        window.addEventListener('mousedown', onDown);
        return () => window.removeEventListener('mousedown', onDown);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const t = window.setTimeout(() => inputRef.current?.focus(), 0);
        return () => window.clearTimeout(t);
    }, [open]);

    const display = uppercase ? selectedLabel.toUpperCase() : selectedLabel;

    return (
        <div ref={containerRef} className="w-full relative">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {label}
                </label>
            )}

            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((v) => !v)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-bold tracking-wide outline-none transition-all ${
                    disabled ? 'opacity-60 cursor-not-allowed' : ''
                } border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500`}
            >
                <span className={`truncate ${uppercase ? 'uppercase' : ''}`}>{display || placeholder}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-300" />
            </button>

            {open && (
                <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(uppercase ? e.target.value.toUpperCase() : e.target.value)}
                                placeholder="DIGITE PARA FILTRAR..."
                                className={`w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-bold tracking-wide text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 ${
                                    uppercase ? 'uppercase' : ''
                                }`}
                            />
                            {canCreate && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = (query || '').trim().toUpperCase();
                                        onCreateOption?.(next);
                                        onValueChange(next);
                                        setQuery('');
                                        setOpen(false);
                                    }}
                                    className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 grid place-items-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    title="Adicionar"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-72 overflow-auto p-1">
                        {normalizedOptions.map((o) => (
                            <button
                                key={o.value}
                                type="button"
                                onClick={() => {
                                    onValueChange(o.value);
                                    setQuery('');
                                    setOpen(false);
                                }}
                                className={`w-full text-left rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                                    o.value === value
                                        ? 'bg-red-600 text-white'
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-gray-800'
                                }`}
                            >
                                {o.label}
                            </button>
                        ))}
                        {!normalizedOptions.length && (
                            <div className="px-3 py-6 text-center text-xs font-bold uppercase tracking-wide text-gray-400">
                                Nenhum resultado
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

