'use client';

import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

type NavbarListboxOption = { value: string; label: string };

interface NavbarListboxProps {
    value?: string;
    onValueChange: (value: string) => void;
    options: NavbarListboxOption[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export default function NavbarListbox({
    value,
    onValueChange,
    options,
    placeholder = 'Selecionar',
    disabled,
    className = '',
}: NavbarListboxProps) {
    return (
        <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
            <Select.Trigger
                className={`inline-flex w-full items-center justify-between gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm outline-none transition-colors hover:bg-white/15 focus:ring-2 focus:ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
                aria-label="Selecionar opção"
            >
                <Select.Value placeholder={placeholder} />
                <Select.Icon className="text-white/90">
                    <ChevronDown className="h-4 w-4" />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    position="popper"
                    sideOffset={8}
                    className="z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
                >
                    <Select.Viewport className="p-1">
                        {options.map((opt) => (
                            <Select.Item
                                key={opt.value}
                                value={opt.value}
                                className="relative flex select-none items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-700 outline-none data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700 data-[state=checked]:bg-red-600 data-[state=checked]:text-white"
                            >
                                <Select.ItemIndicator className="absolute right-3 inline-flex items-center justify-center">
                                    <Check className="h-4 w-4" />
                                </Select.ItemIndicator>
                                <Select.ItemText>{opt.label}</Select.ItemText>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}

