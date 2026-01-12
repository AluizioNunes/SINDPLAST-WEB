'use client';

import { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Dependente } from '@/lib/types/dependente';
import toast from 'react-hot-toast';
import { createDependente, updateDependente } from '@/app/actions/dependentes';

interface DependenteModalProps {
    isOpen: boolean;
    onClose: () => void;
    dependente?: Dependente | null;
    onSave: () => void;
}

export default function DependenteModal({
    isOpen,
    onClose,
    dependente,
    onSave,
}: DependenteModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Dependente>>({
        dependente: '',
        nascimento: '',
        parentesco: '',
        carteira: false,
        status: true,
        codSocio: '',
        socio: '', // Nome do sócio, idealmente preenchido ao selecionar codSocio
    });

    // Estado para busca de sócios (simplificado por enquanto)
    // Num cenário real, seria um Combobox/Autocomplete async
    const [socios, setSocios] = useState<{ id: number, nome: string }[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Carregar lista de sócios para o select (limitado ou paginado idealmente)
            fetch('/api/socios?limit=100') // Exemplo simplificado
                .then(res => res.json())
                .then(data => setSocios(data.map((s: any) => ({ id: s.id, nome: s.nome }))))
                .catch(err => console.error('Erro ao carregar sócios', err));
        }
    }, [isOpen]);

    useEffect(() => {
        if (dependente) {
            setFormData(dependente);
        } else {
            setFormData({
                dependente: '',
                nascimento: '',
                parentesco: '',
                carteira: false,
                status: true,
                codSocio: '',
                socio: '',
            });
        }
    }, [dependente, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let result;
            if (dependente) {
                result = await updateDependente(dependente.id, formData);
            } else {
                result = await createDependente(formData);
            }

            if (!result.success) throw new Error(result.error);

            toast.success(dependente ? 'Dependente atualizado!' : 'Dependente cadastrado!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving dependente:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar dependente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={dependente ? 'EDIÇÃO DE DEPENDENTE' : 'CADASTRO DE DEPENDENTE'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Sócio Responsável
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={formData.codSocio || ''}
                            onChange={(e) => {
                                const selectedSocio = socios.find(s => s.id === Number(e.target.value));
                                setFormData({ 
                                    ...formData, 
                                    codSocio: Number(e.target.value),
                                    socio: selectedSocio?.nome || ''
                                });
                            }}
                            required
                        >
                            <option value="">Selecione um sócio...</option>
                            {socios.map(s => (
                                <option key={s.id} value={s.id}>{s.nome}</option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Nome do Dependente"
                        value={formData.dependente}
                        onChange={(e) => setFormData({ ...formData, dependente: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Data de Nascimento"
                            type="date"
                            value={formData.nascimento ? formData.nascimento.split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, nascimento: e.target.value })}
                            required
                        />
                        <Select
                            label="Parentesco"
                            value={formData.parentesco}
                            onChange={(e) => setFormData({ ...formData, parentesco: e.target.value })}
                            options={[
                                { value: '', label: 'Selecione...' },
                                { value: 'FILHO(A)', label: 'FILHO(A)' },
                                { value: 'ESPOSO(A)', label: 'ESPOSO(A)' },
                                { value: 'PAI', label: 'PAI' },
                                { value: 'MÃE', label: 'MÃE' },
                                { value: 'OUTROS', label: 'OUTROS' },
                            ]}
                            required
                        />
                    </div>

                    <div className="flex gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!formData.carteira}
                                onChange={(e) => setFormData({ ...formData, carteira: e.target.checked })}
                                className="w-4 h-4 text-purple-600 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Possui Carteirinha</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                className="w-4 h-4 text-purple-600 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ativo</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="ghost" onClick={onClose} type="button">
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" loading={loading}>
                        {dependente ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
}
