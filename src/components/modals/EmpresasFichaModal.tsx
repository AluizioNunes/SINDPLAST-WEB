'use client';

import type { ReactNode } from 'react';
import { Building2, Edit, Printer, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Empresa } from '@/lib/types/empresa';

interface EmpresasFichaModalProps {
    isOpen: boolean;
    onClose: () => void;
    empresa: Empresa | null;
    canViewField: (screenId: string, fieldId: string) => boolean;
    onEdit?: (empresa: Empresa) => void;
    onDelete?: (empresa: Empresa) => void;
    onPrint?: (empresa: Empresa) => void;
}

export default function EmpresasFichaModal({ isOpen, onClose, empresa, canViewField, onEdit, onDelete, onPrint }: EmpresasFichaModalProps) {
    if (!empresa) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="FICHA CADASTRAL" maxWidth="max-w-4xl">
            <div className="p-6 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar empresa={empresa} />
                        <div>
                            <div className="text-xl font-black text-gray-900 dark:text-white">
                                {empresa.nomeFantasia || empresa.razaoSocial || '-'}
                            </div>
                            {canViewField('empresas', 'razaoSocial') && empresa.razaoSocial ? (
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-semibold">{empresa.razaoSocial}</div>
                            ) : null}
                            {canViewField('empresas', 'codEmpresa') && (
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                    Código: <span className="font-semibold">{empresa.codEmpresa || '-'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onEdit ? (
                            <ActionIconButton title="Editar" onClick={() => onEdit(empresa)} icon={<Edit size={18} />} />
                        ) : null}
                        {onDelete ? (
                            <ActionIconButton title="Excluir" onClick={() => onDelete(empresa)} icon={<Trash2 size={18} />} />
                        ) : null}
                        {onPrint ? (
                            <ActionIconButton title="Imprimir" onClick={() => onPrint(empresa)} icon={<Printer size={18} />} />
                        ) : null}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Section title="Empresa" icon={<Building2 className="w-4 h-4 text-red-600" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {canViewField('empresas', 'codEmpresa') ? <Field label="Código" value={empresa.codEmpresa} /> : null}
                            {canViewField('empresas', 'cnpj') ? <Field label="CNPJ" value={empresa.cnpj} /> : null}
                            {canViewField('empresas', 'razaoSocial') ? <Field label="Razão Social" value={empresa.razaoSocial} /> : null}
                            {canViewField('empresas', 'nomeFantasia') ? <Field label="Nome Fantasia" value={empresa.nomeFantasia} /> : null}
                        </div>
                    </Section>

                    <Section title="Localização" icon={<Building2 className="w-4 h-4 text-red-600" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {canViewField('empresas', 'cidade') ? <Field label="Cidade" value={empresa.cidade} /> : null}
                            {canViewField('empresas', 'uf') ? <Field label="UF" value={empresa.uf} /> : null}
                            {canViewField('empresas', 'nFuncionarios') ? <Field label="Nº Funcionários" value={empresa.nFuncionarios} /> : null}
                        </div>
                    </Section>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function Avatar({ empresa }: { empresa: Empresa }) {
    if (empresa.imagem) {
        return (
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-red-600/30 bg-black/5">
                <img src={empresa.imagem} className="w-full h-full object-cover" />
            </div>
        );
    }
    return (
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-2xl font-black text-red-600 ring-2 ring-red-600/20">
            {String(empresa.nomeFantasia || empresa.razaoSocial || '-').charAt(0) || '-'}
        </div>
    );
}

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                {icon}
                <div className="text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-200">{title}</div>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 p-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{value || '-'}</div>
        </div>
    );
}

function ActionIconButton({ title, onClick, icon }: { title: string; onClick: () => void; icon: ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className="h-9 w-9 grid place-items-center text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 rounded-full transition-colors shadow-sm"
        >
            {icon}
        </button>
    );
}
