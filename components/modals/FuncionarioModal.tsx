'use client';

import { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Funcionario } from '@/lib/types/funcionario';
import toast from 'react-hot-toast';
import { createFuncionario, updateFuncionario } from '@/app/actions/funcionarios';

interface FuncionarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    funcionario?: Funcionario | null;
    onSave: () => void;
}

export default function FuncionarioModal({
    isOpen,
    onClose,
    funcionario,
    onSave,
}: FuncionarioModalProps) {
    const [loading, setLoading] = useState(false);
    const [empresas, setEmpresas] = useState<{ id: number, nomeFantasia: string }[]>([]);
    const [formData, setFormData] = useState<Partial<Funcionario>>({
        nome: '',
        cpf: '',
        cargo: '',
        dataAdmissao: '',
        salario: 0,
        empresaId: 0,
        empresaLocal: '',
        depto: '',
        setor: '',
    });

    useEffect(() => {
        if (isOpen) {
            // Idealmente usar uma server action para buscar empresas ou passar como prop
            // Mantendo fetch por consistência com o código anterior, mas em produção deve ser otimizado
            fetch('/api/empresas')
                .then(res => res.json())
                .then(data => setEmpresas(data.map((e: any) => ({ id: e.id, nomeFantasia: e.nomeFantasia || e.razaoSocial }))))
                .catch(err => console.error('Erro ao carregar empresas', err));
        }
    }, [isOpen]);

    useEffect(() => {
        if (funcionario) {
            setFormData(funcionario);
        } else {
            setFormData({
                nome: '',
                cpf: '',
                cargo: '',
                dataAdmissao: '',
                salario: 0,
                empresaId: 0,
                empresaLocal: '',
                depto: '',
                setor: '',
            });
        }
    }, [funcionario, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let result;
            if (funcionario) {
                result = await updateFuncionario(funcionario.id, formData);
            } else {
                result = await createFuncionario(formData);
            }

            if (!result.success) throw new Error(result.error);

            toast.success(funcionario ? 'Funcionário atualizado!' : 'Funcionário cadastrado!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving funcionario:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar funcionário');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={funcionario ? 'EDIÇÃO DE FUNCIONÁRIO' : 'CADASTRO DE FUNCIONÁRIO'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nome Completo"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                    />
                    <Input
                        label="CPF"
                        value={formData.cpf}
                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        placeholder="000.000.000-00"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Cargo"
                        value={formData.cargo || ''}
                        onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    />
                     <Input
                        label="CBO"
                        value={formData.cbo || ''}
                        onChange={(e) => setFormData({ ...formData, cbo: e.target.value })}
                    />
                    <Input
                        label="Data de Admissão"
                        type="date"
                        value={formData.dataAdmissao ? formData.dataAdmissao.split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Salário"
                        type="number"
                        step="0.01"
                        value={formData.salario ?? 0}
                        onChange={(e) => setFormData({ ...formData, salario: Number(e.target.value) })}
                    />
                     <Input
                        label="Departamento"
                        value={formData.depto || ''}
                        onChange={(e) => setFormData({ ...formData, depto: e.target.value })}
                    />
                     <Input
                        label="Setor"
                        value={formData.setor || ''}
                        onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input
                        label="Empresa (Local)"
                        value={formData.empresaLocal || ''}
                        onChange={(e) => setFormData({ ...formData, empresaLocal: e.target.value })}
                        placeholder="Nome do local de trabalho"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Empresa Vinculada
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={formData.empresaId || ''}
                            onChange={(e) => setFormData({ ...formData, empresaId: Number(e.target.value) })}
                        >
                            <option value="">Selecione uma empresa...</option>
                            {empresas.map(e => (
                                <option key={e.id} value={e.id}>{e.nomeFantasia}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="ghost" onClick={onClose} type="button">
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" loading={loading}>
                        {funcionario ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
}
