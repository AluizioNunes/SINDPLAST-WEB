'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export default function BaseModal({
    isOpen,
    onClose,
    title,
    children,
    size = 'lg',
}: BaseModalProps) {
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-7xl',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 overflow-y-auto bg-black/40">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`w-full ${sizeClasses[size]} bg-white dark:bg-gray-900 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header: SINDPLAST Standard */}
                            <div className="flex items-center justify-between h-16 sm:h-20 bg-gradient-to-r from-red-600 to-red-800 text-white px-4">
                                {/* Left Side: Logo and Union Info */}
                                <div className="flex items-center gap-2 sm:gap-3 select-none overflow-hidden mr-4">
                                    <div className="relative w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0">
                                        <img
                                            src="/images/SINDPLAST.png"
                                            alt="Logo SINDPLAST"
                                            className="object-contain drop-shadow-md w-full h-full"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center overflow-hidden">
                                        <h1 className="text-lg sm:text-2xl font-black tracking-wide leading-none text-white drop-shadow-sm whitespace-nowrap uppercase">
                                            SINDPLAST-AM
                                        </h1>
                                        <p className="text-[8px] sm:text-[11px] font-bold text-white/90 tracking-wide leading-tight whitespace-nowrap uppercase hidden xs:block">
                                            SINDICATO DOS TRABALHADORES NAS INDÚSTRIAS DE MATERIAL PLÁSTICO DE MANAUS E DO ESTADO DO AMAZONAS
                                        </p>
                                    </div>
                                </div>

                                {/* Right Side: Action Title and Close Button */}
                                <div className="flex items-center gap-3 ml-auto">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <h2 className="text-xs sm:text-sm font-black text-white/90 uppercase tracking-widest whitespace-nowrap">
                                            {title}
                                        </h2>
                                        <div className="h-0.5 w-full bg-white/30 rounded-full mt-0.5" />
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="p-1.5 sm:p-2 rounded-lg hover:bg-white/20 transition-colors text-white ml-2"
                                        aria-label="Close"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-gray-900">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
