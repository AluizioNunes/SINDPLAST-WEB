'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit, FileText, Printer, Trash2, Users } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import { Socio } from '@/lib/types/socio';
import { getDependentesBySocioId } from '@/lib/services/dependenteService';

interface SociosFichaModalProps {
    isOpen: boolean;
    onClose: () => void;
    socio: Socio | null;
    canViewField: (screenId: string, fieldId: string) => boolean;
    onEdit?: (socio: Socio) => void;
    onDelete?: (socio: Socio) => void;
    onPrint?: (socio: Socio) => void;
}

export default function SociosFichaModal({ isOpen, onClose, socio, canViewField, onEdit, onDelete, onPrint }: SociosFichaModalProps) {
    const socioId = socio?.id ?? 0;

    const { data: dependentes, isLoading: depsLoading } = useQuery({
        queryKey: ['dependentes-by-socio', socioId],
        queryFn: () => getDependentesBySocioId(socioId),
        enabled: isOpen && socioId > 0,
    });

    const dependenteNames = useMemo(() => (dependentes || []).map((d) => d.dependente).filter(Boolean), [dependentes]);

    if (!socio) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="FICHA CADASTRAL" maxWidth="max-w-4xl">
            <div className="p-6 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar socio={socio} />
                        <div>
                            <div className="text-xl font-black text-gray-900 dark:text-white">{socio.nome || '-'}</div>
                            <div className="mt-1">
                                <StatusBadge status={socio.status} />
                            </div>
                            {canViewField('socios', 'matricula') && (
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                    Matrícula: <span className="font-semibold">{socio.matricula || '-'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onEdit && (
                            <ActionIconButton
                                title="Editar"
                                onClick={() => onEdit(socio)}
                                icon={<Edit size={18} />}
                            />
                        )}
                        {onDelete && (
                            <ActionIconButton
                                title="Excluir"
                                onClick={() => onDelete(socio)}
                                icon={<Trash2 size={18} />}
                            />
                        )}
                        {onPrint && (
                            <ActionIconButton
                                title="Imprimir"
                                onClick={() => onPrint(socio)}
                                icon={<Printer size={18} />}
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Section title="Pessoal" icon={<Users className="w-4 h-4 text-red-600" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {canViewField('socios', 'cpf') && <Field label="CPF" value={socio.cpf} />}
                            {canViewField('socios', 'rg') && <Field label="RG" value={socio.rg} />}
                            {canViewField('socios', 'nascimento') && <Field label="Nascimento" value={formatDate(socio.nascimento)} />}
                            {canViewField('socios', 'sexo') && <Field label="Sexo" value={socio.sexo} />}
                        </div>
                    </Section>

                    <Section title="Sindicato" icon={<FileText className="w-4 h-4 text-red-600" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {canViewField('socios', 'empresa') && <Field label="Empresa" value={socio.empresa || socio.razaoSocial} />}
                            {canViewField('socios', 'setor') && <Field label="Setor" value={socio.setor} />}
                            {canViewField('socios', 'funcao') && <Field label="Função" value={socio.funcao} />}
                            {canViewField('socios', 'dataAdmissao') && <Field label="Admissão" value={formatDate(socio.dataAdmissao)} />}
                        </div>
                    </Section>

                    <Section title="Contato" icon={<Users className="w-4 h-4 text-red-600" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {canViewField('socios', 'telefone') && <Field label="Telefone" value={socio.telefone} />}
                            {canViewField('socios', 'celular') && <Field label="Celular" value={socio.celular} />}
                            {canViewField('socios', 'email') && <Field label="Email" value={socio.email} />}
                            {canViewField('socios', 'redeSocial') && <Field label="Rede Social" value={socio.redeSocial} />}
                            {canViewField('socios', 'linkRedeSocial') && <Field label="Link Rede Social" value={socio.linkRedeSocial} />}
                            {canViewField('socios', 'cep') && <Field label="CEP" value={socio.cep} />}
                            {canViewField('socios', 'cidade') && <Field label="Cidade" value={socio.cidade} />}
                            {canViewField('socios', 'uf') && <Field label="UF" value={socio.uf} />}
                        </div>
                    </Section>

                    <Section title={`Dependentes (${depsLoading ? '...' : String(dependenteNames.length)})`} icon={<Users className="w-4 h-4 text-red-600" />}>
                        <div className="space-y-2">
                            {depsLoading ? (
                                <div className="text-sm text-gray-600 dark:text-gray-300">Carregando...</div>
                            ) : dependenteNames.length ? (
                                <div className="space-y-2">
                                    {dependenteNames.map((n) => (
                                        <div key={n} className="rounded-lg border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                                            {n}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-600 dark:text-gray-300">Nenhum dependente cadastrado.</div>
                            )}
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

function Avatar({ socio }: { socio: Socio }) {
    if (socio.imagem) {
        return (
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-red-600/30">
                <img src={socio.imagem} className="w-full h-full object-cover" />
            </div>
        );
    }

    return (
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-2xl font-black text-red-600 ring-2 ring-red-600/20">
            {socio.nome?.charAt(0) || '-'}
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
