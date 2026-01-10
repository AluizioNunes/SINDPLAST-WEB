'use client';

interface StatusBadgeProps {
    status: string | boolean | null | undefined;
    activeText?: string;
    inactiveText?: string;
}

export default function StatusBadge({
    status,
    activeText = 'ATIVO',
    inactiveText = 'INATIVO'
}: StatusBadgeProps) {
    const isActive = typeof status === 'boolean'
        ? status
        : String(status || '').toUpperCase() === activeText.toUpperCase();

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
            {isActive ? activeText : inactiveText}
        </span>
    );
}
