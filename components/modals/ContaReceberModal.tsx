'use client';

import { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { ContaReceber } from '@/lib/types/contaReceber';
import toast from 'react-hot-toast';
import { createContaReceber, updateContaReceber } from '@/app/actions/contasReceber';
import { getCentroCustosList } from '@/app/actions/centroCustos';

interface ContaReceberModalProps {
    isOpen: boolean;
    onClose: () => void;
    contaReceber?: ContaReceber | null;
    onSave: () => void;
}

export default function ContaReceberModal({
    isOpen,
    onClose,
    contaReceber,
    onSave,
}: ContaReceberModalProps) {
    const [loading, setLoading] = useState(false);
    const [centroCustos, setCentroCustos] = useState<{value: string, label: string}[]>([]);
    const [formData, setFormData] = useState<Partial<ContaReceber>>({
        descricao: '',
        valor: 0,
        vencimento: '',
        data_recebimento: '',
        status: 'PENDENTE',
        cliente: '',
        centro_custo_id: null,
        observacao: '',
    });

    useEffect(() => {
        if (isOpen) {
            getCentroCustosList().then(res => {
                if (res.success && res.data) {
                    setCentroCustos(res.data.map(cc => ({
                        value: cc.id.toString(),
                        label: `${cc.codigo} - ${cc.descricao}`
                    })));
                }
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (contaReceber) {
            setFormData(contaReceber);
        } else {
            setFormData({
                descricao: '',
                valor: 0,
                vencimento: '',
                data_recebimento: '',
                status: 'PENDENTE',
                cliente: '',
                centro_custo_id: null,
                observacao: '',
            });
        }
    }, [contaReceber, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let result;
            if (contaReceber) {
                result = await updateContaReceber(contaReceber.id, formData);
            } else {
                result = await createContaReceber(formData);
            }

            if (!result.success) throw new Error(result.error);

            toast.success(contaReceber ? 'Conta atualizada!' : 'Conta cadastrada!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving conta receber:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar conta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={contaReceber ? 'EDIÇÃO DE CONTA A RECEBER' : 'CADASTRO DE CONTA A RECEBER'}
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
                            label="Cliente"
                            value={formData.cliente || ''}
                            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                        />
                        <Input
                            label="Valor"
                            type="number"
                            step="0.01"
                            value={formData.valor || 0}
                            onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Vencimento"
                            type="date"
                            value={formData.vencimento ? formData.vencimento.split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })}
                            required
                        />
                         <Input
                            label="Data Recebimento"
                            type="date"
                            value={formData.data_recebimento ? formData.data_recebimento.split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, data_recebimento: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Centro de Custo"
                            value={formData.centro_custo_id?.toString() || ''}
                            onChange={(e) => setFormData({ ...formData, centro_custo_id: Number(e.target.value) || null })}
                            options={[{ value: '', label: 'Selecione...' }, ...centroCustos]}
                        />
                        <Select
                            label="Status"
                            value={formData.status || 'PENDENTE'}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            options={[
                                { value: 'PENDENTE', label: 'PENDENTE' },
                                { value: 'RECEBIDO', label: 'RECEBIDO' },
                                { value: 'CANCELADO', label: 'CANCELADO' },
                            ]}
                        />
                    </div>

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
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="ghost" onClick={onClose} type="button">
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" loading={loading}>
                        {contaReceber ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
}
