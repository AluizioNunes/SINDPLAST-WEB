'use client';

import type { ReactNode } from 'react';
import { Edit, Printer, Trash2, UserCircle, Users } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Funcionario } from '@/lib/types/funcionario';

interface FuncionariosFichaModalProps {
    isOpen: boolean;
    onClose: () => void;
    funcionario: Funcionario | null;
    canViewField: (screenId: string, fieldId: string) => boolean;
    onEdit?: (funcionario: Funcionario) => void;
    onDelete?: (funcionario: Funcionario) => void;
    onPrint?: (funcionario: Funcionario) => void;
}

export default function FuncionariosFichaModal({ isOpen, onClose, funcionario, canViewField, onEdit, onDelete, onPrint }: FuncionariosFichaModalProps) {
    if (!funcionario) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="FICHA CADASTRAL" maxWidth="max-w-4xl">
            <div className="p-6 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar funcionario={funcionario} />
                        <div>
                            <div className="text-xl font-black text-gray-900 dark:text-white">{funcionario.nome || '-'}</div>
                            {canViewField('funcionarios', 'cpf') ? (
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                    CPF: <span className="font-semibold">{funcionario.cpf || '-'}</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onEdit ? (
                            <ActionIconButton title="Editar" onClick={() => onEdit(funcionario)} icon={<Edit size={18} />} />
                        ) : null}
                        {onDelete ? (
                            <ActionIconButton title="Excluir" onClick={() => onDelete(funcionario)} icon={<Trash2 size={18} />} />
                        ) : null}
                        {onPrint ? (
                            <ActionIconButton title="Imprimir" onClick={() => onPrint(funcionario)} icon={<Printer size={18} />} />
                        ) : null}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Section title="Profissional" icon={<Users className="w-4 h-4 text-red-600" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {canViewField('funcionarios', 'cargo') ? <Field label="Cargo" value={funcionario.cargo} /> : null}
                            {canViewField('funcionarios', 'cbo') ? <Field label="CBO" value={funcionario.cbo} /> : null}
                            {canViewField('funcionarios', 'depto') ? <Field label="Departamento" value={funcionario.depto} /> : null}
                            <Field label="Setor" value={funcionario.setor} />
                        </div>
                    </Section>

                    <Section title="Local" icon={<Users className="w-4 h-4 text-red-600" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {canViewField('funcionarios', 'empresaLocal') ? <Field label="Empresa/Local" value={funcionario.empresaLocal} /> : null}
                            <Field label="Admissão" value={formatDate(funcionario.dataAdmissao || null)} />
                            <Field label="Salário" value={formatMoney(funcionario.salario)} />
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

function Avatar({ funcionario }: { funcionario: Funcionario }) {
    if (funcionario.imagem) {
        return (
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-red-600/30 bg-black/5">
                <img src={funcionario.imagem} className="w-full h-full object-cover" />
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

function formatMoney(value: number | null | undefined) {
    const n = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
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
