'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';
import Image from 'next/image';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: string;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-4xl'
}: ModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog.Root open={isOpen} onOpenChange={onClose}>
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className={`w-full ${maxWidth} bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
                                >
                                    <div className="flex items-center justify-between h-16 sm:h-20 bg-gradient-to-r from-red-600 to-red-800 text-white px-4">
                                        {/* Left Side: Logo and Union Info */}
                                        <div className="flex items-center gap-2 sm:gap-3 select-none overflow-hidden mr-4">
                                            <div className="relative w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0">
                                                <Image
                                                    src="/images/SINDPLAST.png"
                                                    alt="Logo SINDPLAST"
                                                    fill
                                                    className="object-contain drop-shadow-md"
                                                />
                                            </div>
                                            <div className="flex flex-col justify-center overflow-hidden">
                                                <h1 className="text-2xl font-black tracking-wide leading-none text-white drop-shadow-sm whitespace-nowrap uppercase">
                                                    SINDPLAST-AM
                                                </h1>
                                                <p className="text-[11px] font-bold text-white/90 tracking-wide leading-tight whitespace-nowrap uppercase hidden xs:block">
                                                    SINDICATO DOS TRABALHADORES NAS INDÚSTRIAS DE MATERIAL PLÁSTICO DE MANAUS E DO ESTADO DO AMAZONAS
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right Side: Action Title and Close Button */}
                                        <div className="flex items-center gap-3 ml-auto">
                                            <div className="hidden sm:flex flex-col items-end">
                                                <Dialog.Title className="text-xs sm:text-sm font-black text-white/90 uppercase tracking-widest whitespace-nowrap">
                                                    {title}
                                                </Dialog.Title>
                                                <div className="h-0.5 w-full bg-white/30 rounded-full mt-0.5" />
                                            </div>

                                            <Dialog.Description className="sr-only">
                                                {title}
                                            </Dialog.Description>

                                            <Dialog.Close asChild>
                                                <button
                                                    className="p-1.5 sm:p-2 rounded-lg hover:bg-white/20 transition-colors text-white ml-2"
                                                    aria-label="Close"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </Dialog.Close>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        {children}
                                    </div>
                                </motion.div>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            )}
        </AnimatePresence>
    );
}
