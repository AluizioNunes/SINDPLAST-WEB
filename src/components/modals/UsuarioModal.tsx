'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import BaseModal from './BaseModal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Usuario } from '@/lib/types/usuario';
import toast from 'react-hot-toast';
import { createUsuario, updateUsuario } from '@/lib/services/usuarioService';
import { getPerfis } from '@/lib/services/perfilService';
import { Eye, EyeOff } from 'lucide-react';

interface UsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    usuario?: Usuario | null;
    onSave: () => void;
}

export default function UsuarioModal({
    isOpen,
    onClose,
    usuario,
    onSave,
}: UsuarioModalProps) {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    // Campos opcionais como Senha não estão no tipo base Usuario, mas são necessários no form
    const [formData, setFormData] = useState<Partial<Usuario> & { Senha?: string }>({
        Nome: '',
        CPF: '',
        Funcao: '',
        Email: '',
        Usuario: '',
        Perfil: '',
        Cadastrante: 'SISTEMA', // Default ou pego da sessão
    });

    const { data: perfis, isLoading: isLoadingPerfis, isError: isErrorPerfis } = useQuery({
        queryKey: ['perfis'],
        queryFn: getPerfis,
    });

    const perfilOptions = perfis?.map(p => ({
        value: p.Perfil,
        label: p.Perfil?.toUpperCase?.() ?? p.Perfil
    })) || [];

    useEffect(() => {
        if (usuario) {
            setFormData(usuario);
        } else {
            setFormData({
                Nome: '',
                CPF: '',
                Funcao: '',
                Email: '',
                Usuario: '',
                Perfil: '',
                Cadastrante: 'SISTEMA',
            });
        }
    }, [usuario, isOpen]);

    useEffect(() => {
        if (isErrorPerfis) {
            toast.error('Erro ao carregar perfis de acesso');
        }
    }, [isErrorPerfis]);

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length > 11) value = value.slice(0, 11);

        // Apply mask
        let maskedValue = value;
        if (value.length > 9) {
            maskedValue = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
        } else if (value.length > 6) {
            maskedValue = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
        } else if (value.length > 3) {
            maskedValue = `${value.slice(0, 3)}.${value.slice(3)}`;
        }

        setFormData({ ...formData, CPF: maskedValue });
    };

    const validateCPF = (cpf: string) => {
        if (!cpf) return true; // Optional field
        const cleanCPF = cpf.replace(/\D/g, '');
        if (cleanCPF.length !== 11) return false;
        
        // Basic CPF validation logic (checking for repeated digits)
        if (/^(\d)\1+$/.test(cleanCPF)) return false;
        
        // Additional checksum validation could be added here if needed
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.CPF && !validateCPF(formData.CPF)) {
            toast.error('CPF inválido');
            return;
        }

        setLoading(true);

        try {
            // Remover Senha se estiver vazia na edição
            const dataToSubmit = { ...formData };
            if (dataToSubmit.Nome) dataToSubmit.Nome = dataToSubmit.Nome.toUpperCase();
            if (dataToSubmit.Funcao) dataToSubmit.Funcao = dataToSubmit.Funcao.toUpperCase();
            if (dataToSubmit.Usuario) dataToSubmit.Usuario = dataToSubmit.Usuario.toUpperCase();
            if (dataToSubmit.Cadastrante) dataToSubmit.Cadastrante = dataToSubmit.Cadastrante.toUpperCase();
            if (dataToSubmit.Email) dataToSubmit.Email = dataToSubmit.Email.toLowerCase();
            if (usuario) {
                // Em edição: se senha não foi alterada (campo vazio), não enviar
                if (!dataToSubmit.Senha || dataToSubmit.Senha.trim() === '') {
                    delete dataToSubmit.Senha;
                }
            }

            if (usuario) {
                await updateUsuario(usuario.IdUsuarios, dataToSubmit);
            } else {
                await createUsuario(dataToSubmit as any); // Type assertion para lidar com Omit
            }

            toast.success(usuario ? 'Usuário atualizado!' : 'Usuário cadastrado!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving usuario:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar usuário');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={usuario ? 'EDIÇÃO DE USUÁRIO' : 'CADASTRO DE USUÁRIO'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nome Completo"
                        value={formData.Nome}
                        onChange={(e) => setFormData({ ...formData, Nome: e.target.value.toUpperCase() })}
                        uppercase
                        required
                    />
                    <Input
                        label="CPF"
                        value={formData.CPF}
                        onChange={handleCPFChange}
                        placeholder="000.000.000-00"
                        maxLength={14}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Email"
                        type="email"
                        value={formData.Email}
                        onChange={(e) => setFormData({ ...formData, Email: e.target.value.toLowerCase() })}
                        className="lowercase"
                        required
                    />
                    <Input
                        label="Função"
                        value={formData.Funcao}
                        onChange={(e) => setFormData({ ...formData, Funcao: e.target.value.toUpperCase() })}
                        uppercase
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Usuário (Login)"
                        value={formData.Usuario}
                        onChange={(e) => setFormData({ ...formData, Usuario: e.target.value.toUpperCase() })}
                        uppercase
                        required
                    />
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            {usuario ? "Nova Senha (opcional)" : "Senha"}
                            {!usuario && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.Senha || ''}
                                onChange={(e) => setFormData({ ...formData, Senha: e.target.value })}
                                required={!usuario}
                                className="block w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all border-gray-300 dark:border-gray-600"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <Select
                    label="Perfil de Acesso"
                    value={formData.Perfil}
                    onChange={(e) => setFormData({ ...formData, Perfil: e.target.value })}
                    options={[
                        ...(isLoadingPerfis
                            ? [{ value: '', label: 'CARREGANDO...' }]
                            : [{ value: '', label: 'SELECIONE...' }]),
                        ...perfilOptions,
                    ]}
                    uppercase
                    required
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="ghost" onClick={onClose} type="button">
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" loading={loading}>
                        {usuario ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
}
