'use client';

import { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { Empresa } from '@/lib/types/empresa';
import toast from 'react-hot-toast';
import { createEmpresa, updateEmpresa } from '@/app/actions/empresas';

interface EmpresaModalProps {
    isOpen: boolean;
    onClose: () => void;
    empresa?: Empresa | null;
    onSave: () => void;
}

export default function EmpresaModal({
    isOpen,
    onClose,
    empresa,
    onSave,
}: EmpresaModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Empresa>>({
        codEmpresa: '',
        cnpj: '',
        razaoSocial: '',
        nomeFantasia: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cep: '',
        cidade: '',
        uf: '',
        telefone01: '',
        telefone02: '',
        fax: '',
        celular: '',
        whatsapp: '',
        instagram: '',
        linkedin: '',
        nFuncionarios: 0,
        dataContribuicao: '',
        valorContribuicao: 0,
        observacao: '',
    });

    useEffect(() => {
        if (empresa) {
            setFormData(empresa);
        } else {
            setFormData({
                codEmpresa: '',
                cnpj: '',
                razaoSocial: '',
                nomeFantasia: '',
                endereco: '',
                numero: '',
                complemento: '',
                bairro: '',
                cep: '',
                cidade: '',
                uf: '',
                telefone01: '',
                telefone02: '',
                fax: '',
                celular: '',
                whatsapp: '',
                instagram: '',
                linkedin: '',
                nFuncionarios: 0,
                dataContribuicao: '',
                valorContribuicao: 0,
                observacao: '',
            });
        }
    }, [empresa, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let result;
            if (empresa) {
                result = await updateEmpresa(empresa.id, formData);
            } else {
                result = await createEmpresa(formData);
            }

            if (!result.success) throw new Error(result.error);

            toast.success(empresa ? 'Empresa atualizada!' : 'Empresa cadastrada!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving empresa:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar empresa');
        } finally {
            setLoading(false);
        }
    };

    const ufs = [
        { value: '', label: 'Selecione...' },
        { value: 'AC', label: 'AC' }, { value: 'AL', label: 'AL' },
        { value: 'AP', label: 'AP' }, { value: 'AM', label: 'AM' },
        { value: 'BA', label: 'BA' }, { value: 'CE', label: 'CE' },
        { value: 'DF', label: 'DF' }, { value: 'ES', label: 'ES' },
        { value: 'GO', label: 'GO' }, { value: 'MA', label: 'MA' },
        { value: 'MT', label: 'MT' }, { value: 'MS', label: 'MS' },
        { value: 'MG', label: 'MG' }, { value: 'PA', label: 'PA' },
        { value: 'PB', label: 'PB' }, { value: 'PR', label: 'PR' },
        { value: 'PE', label: 'PE' }, { value: 'PI', label: 'PI' },
        { value: 'RJ', label: 'RJ' }, { value: 'RN', label: 'RN' },
        { value: 'RS', label: 'RS' }, { value: 'RO', label: 'RO' },
        { value: 'RR', label: 'RR' }, { value: 'SC', label: 'SC' },
        { value: 'SP', label: 'SP' }, { value: 'SE', label: 'SE' },
        { value: 'TO', label: 'TO' },
    ];

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={empresa ? 'EDIÇÃO DE EMPRESA' : 'CADASTRO DE EMPRESA'}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Código da Empresa"
                        value={formData.codEmpresa}
                        onChange={(e) => setFormData({ ...formData, codEmpresa: e.target.value })}
                    />
                    <Input
                        label="CNPJ"
                        value={formData.cnpj}
                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Razão Social"
                        value={formData.razaoSocial}
                        onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                        required
                    />
                    <Input
                        label="Nome Fantasia"
                        value={formData.nomeFantasia}
                        onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            label="Endereço"
                            value={formData.endereco}
                            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Número"
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Complemento"
                        value={formData.complemento}
                        onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                    />
                    <Input
                        label="Bairro"
                        value={formData.bairro}
                        onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    />
                    <Input
                        label="CEP"
                        value={formData.cep}
                        onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Cidade"
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    />
                    <Select
                        label="UF"
                        value={formData.uf}
                        onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                        options={ufs}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Telefone 1"
                        value={formData.telefone01}
                        onChange={(e) => setFormData({ ...formData, telefone01: e.target.value })}
                    />
                    <Input
                        label="Telefone 2"
                        value={formData.telefone02}
                        onChange={(e) => setFormData({ ...formData, telefone02: e.target.value })}
                    />
                    <Input
                        label="Celular"
                        value={formData.celular}
                        onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="WhatsApp"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                    <Input
                        label="Instagram"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    />
                    <Input
                        label="LinkedIn"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Nº Funcionários"
                        type="number"
                        value={formData.nFuncionarios}
                        onChange={(e) => setFormData({ ...formData, nFuncionarios: Number(e.target.value) })}
                    />
                    <Input
                        label="Data Contribuição"
                        type="date"
                        value={formData.dataContribuicao}
                        onChange={(e) => setFormData({ ...formData, dataContribuicao: e.target.value })}
                    />
                    <Input
                        label="Valor Contribuição"
                        type="number"
                        step="0.01"
                        value={formData.valorContribuicao}
                        onChange={(e) => setFormData({ ...formData, valorContribuicao: Number(e.target.value) })}
                    />
                </div>

                <Textarea
                    label="Observações"
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="ghost" onClick={onClose} type="button">
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" loading={loading}>
                        {empresa ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
}
