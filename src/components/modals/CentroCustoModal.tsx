'use client';

import { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { CentroCusto } from '@/lib/types/centroCusto';
import toast from 'react-hot-toast';
import { createCentroCusto, updateCentroCusto } from '@/lib/services/centroCustoService';

interface CentroCustoModalProps {
    isOpen: boolean;
    onClose: () => void;
    centroCusto?: CentroCusto | null;
    onSave: () => void;
}

export default function CentroCustoModal({
    isOpen,
    onClose,
    centroCusto,
    onSave,
}: CentroCustoModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<CentroCusto>>({
        codigo: '',
        descricao: '',
        status: true,
    });

    useEffect(() => {
        if (centroCusto) {
            setFormData(centroCusto);
        } else {
            setFormData({
                codigo: '',
                descricao: '',
                status: true,
            });
        }
    }, [centroCusto, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (centroCusto) {
                await updateCentroCusto(centroCusto.id, formData);
            } else {
                await createCentroCusto(formData);
            }

            toast.success(centroCusto ? 'Centro de Custo atualizado!' : 'Centro de Custo cadastrado!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving centro custo:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar centro de custo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={centroCusto ? 'EDIÇÃO DE CENTRO DE CUSTO' : 'CADASTRO DE CENTRO DE CUSTO'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    <Input
                        label="Código"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        required
                    />
                    
                    <Input
                        label="Descrição"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        required
                    />

                    <div className="flex gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
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
                        {centroCusto ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
}
