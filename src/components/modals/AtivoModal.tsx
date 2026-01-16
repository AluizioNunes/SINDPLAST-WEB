'use client';

import { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Ativo } from '@/lib/types/ativo';
import toast from 'react-hot-toast';
import { createAtivo, updateAtivo } from '@/lib/services/ativoService';

interface AtivoModalProps {
    isOpen: boolean;
    onClose: () => void;
    ativo?: Ativo | null;
    onSave: () => void;
}

export default function AtivoModal({
    isOpen,
    onClose,
    ativo,
    onSave,
}: AtivoModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Ativo>>({
        descricao: '',
        tipo: '',
        valor: 0,
        data_aquisicao: '',
        status: 'ATIVO',
        observacao: '',
    });

    useEffect(() => {
        if (ativo) {
            setFormData(ativo);
        } else {
            setFormData({
                descricao: '',
                tipo: '',
                valor: 0,
                data_aquisicao: '',
                status: 'ATIVO',
                observacao: '',
            });
        }
    }, [ativo, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (ativo) {
                await updateAtivo(ativo.id, formData);
            } else {
                await createAtivo(formData);
            }

            toast.success(ativo ? 'Ativo atualizado!' : 'Ativo cadastrado!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving ativo:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar ativo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={ativo ? 'EDIÇÃO DE ATIVO' : 'CADASTRO DE ATIVO'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    <Input
                        label="Descrição"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        required
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Tipo"
                            value={formData.tipo || ''}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            placeholder="Ex: Equipamento, Móvel"
                        />
                        <Input
                            label="Valor"
                            type="number"
                            step="0.01"
                            value={formData.valor || 0}
                            onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                        />
                    </div>

                    <Input
                        label="Data de Aquisição"
                        type="date"
                        value={formData.data_aquisicao ? formData.data_aquisicao.split('T')[0] : ''}
                        onChange={(e) => setFormData({ ...formData, data_aquisicao: e.target.value })}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Observação
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            rows={3}
                            value={formData.observacao || ''}
                            onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.status === 'ATIVO'}
                                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'ATIVO' : 'INATIVO' })}
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
                        {ativo ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
}
