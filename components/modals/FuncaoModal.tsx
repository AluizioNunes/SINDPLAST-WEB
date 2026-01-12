'use client';

import { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Funcao } from '@/lib/types/funcao';
import toast from 'react-hot-toast';
import { createFuncao, updateFuncao } from '@/app/actions/funcoes';

interface FuncaoModalProps {
    isOpen: boolean;
    onClose: () => void;
    funcao?: Funcao | null;
    onSave: () => void;
}

export default function FuncaoModal({
    isOpen,
    onClose,
    funcao,
    onSave,
}: FuncaoModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Funcao>>({
        descricao: '',
        cbo: '',
        status: true,
    });

    useEffect(() => {
        if (funcao) {
            setFormData(funcao);
        } else {
            setFormData({
                descricao: '',
                cbo: '',
                status: true,
            });
        }
    }, [funcao, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let result;
            if (funcao) {
                result = await updateFuncao(funcao.id, formData);
            } else {
                result = await createFuncao(formData);
            }

            if (!result.success) throw new Error(result.error);

            toast.success(funcao ? 'Função atualizada!' : 'Função cadastrada!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving funcao:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar função');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={funcao ? 'EDIÇÃO DE FUNÇÃO' : 'CADASTRO DE FUNÇÃO'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    <Input
                        label="Descrição"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        required
                    />
                    
                    <Input
                        label="CBO"
                        value={formData.cbo || ''}
                        onChange={(e) => setFormData({ ...formData, cbo: e.target.value })}
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
                        {funcao ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
}
