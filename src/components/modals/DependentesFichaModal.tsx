'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Edit, Printer, Trash2, UserCircle, Users } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Dependente } from '@/lib/types/dependente';
import { getSocioById } from '@/lib/services/socioService';

interface DependentesFichaModalProps {
    isOpen: boolean;
    onClose: () => void;
    dependente: Dependente | null;
    canViewField: (screenId: string, fieldId: string) => boolean;
    onEdit?: (dependente: Dependente) => void;
    onDelete?: (dependente: Dependente) => void;
    onPrint?: (dependente: Dependente) => void;
}

export default function DependentesFichaModal({ isOpen, onClose, dependente, canViewField, onEdit, onDelete, onPrint }: DependentesFichaModalProps) {
    const [empresaFromSocio, setEmpresaFromSocio] = useState<string>('');

    useEffect(() => {
        if (!isOpen) return;
        const cod = Number(dependente?.codSocio || 0);
        if (!cod) return;
        (async () => {
            try {
                const socio = await getSocioById(cod);
                const v = String(socio?.razaoSocial || socio?.nomeFantasia || '').toUpperCase();
                setEmpresaFromSocio(v);
            } catch {
                setEmpresaFromSocio('');
            }
        })();
    }, [isOpen, dependente?.codSocio]);

    if (!dependente) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="FICHA CADASTRAL" maxWidth="max-w-4xl">
            <div className="p-6 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar dependente={dependente} />
                        <div>
                            <div className="text-xl font-black text-gray-900 dark:text-white">{dependente.dependente || '-'}</div>
                            {canViewField('dependentes', 'socio') ? (
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                    Sócio: <span className="font-semibold">{dependente.socio || '-'}</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onEdit ? (
                            <ActionIconButton title="Editar" onClick={() => onEdit(dependente)} icon={<Edit size={18} />} />
                        ) : null}
                        {onDelete ? (
                            <ActionIconButton title="Excluir" onClick={() => onDelete(dependente)} icon={<Trash2 size={18} />} />
                        ) : null}
                        {onPrint ? (
                            <ActionIconButton title="Imprimir" onClick={() => onPrint(dependente)} icon={<Printer size={18} />} />
                        ) : null}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Section title="Dependente" icon={<Users className="w-4 h-4 text-red-600" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {canViewField('dependentes', 'nome') ? <Field label="Nome" value={dependente.dependente} /> : null}
                            {canViewField('dependentes', 'parentesco') ? <Field label="Parentesco" value={dependente.parentesco} /> : null}
                            {canViewField('dependentes', 'nascimento') ? <Field label="Nascimento" value={formatDate(dependente.nascimento)} /> : null}
                        </div>
                    </Section>

                    <Section title="Vínculo" icon={<Users className="w-4 h-4 text-red-600" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {canViewField('dependentes', 'socio') ? <Field label="Sócio Titular" value={dependente.socio} /> : null}
                            <Field label="Empresa" value={dependente.empresa || empresaFromSocio || 'SEM EMPRESA'} />
                            <Field label="Órfão" value={dependente.flagOrfao ? 'SIM' : 'NÃO'} />
                            <Field label="Carteira" value={dependente.carteira ? 'SIM' : 'NÃO'} />
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

function Avatar({ dependente }: { dependente: Dependente }) {
    if (dependente.imagem) {
        const src = String(dependente.imagem || '').includes('://') ? String(dependente.imagem) : `/images/dependentes/${dependente.imagem}`;
        return (
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-red-600/30 bg-black/5">
                <img src={src} className="w-full h-full object-cover" />
            </div>
        );
    }

    return (
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-2xl font-black text-red-600 ring-2 ring-red-600/20">
            <UserCircle className="w-10 h-10 opacity-70" />
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

function formatDate(value: string | null) {
    if (!value) return '-';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('pt-BR');
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
