'use client';

import { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Usuario } from '@/lib/types/usuario';
import toast from 'react-hot-toast';
import { createUsuario, updateUsuario } from '@/app/actions/usuarios';

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
    // Campos opcionais como Senha não estão no tipo base Usuario, mas são necessários no form
    const [formData, setFormData] = useState<Partial<Usuario> & { Senha?: string }>({
        Nome: '',
        CPF: '',
        Funcao: '',
        Email: '',
        Usuario: '',
        Perfil: '',
        Cadastrante: 'Sistema', // Default ou pego da sessão
    });

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
                Perfil: 'Usuário',
                Cadastrante: 'Sistema',
            });
        }
    }, [usuario, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let result;
            // Remover Senha se estiver vazia na edição
            const dataToSubmit = { ...formData };
            if (usuario && !dataToSubmit.Senha) {
                delete dataToSubmit.Senha;
            }

            if (usuario) {
                result = await updateUsuario(usuario.IdUsuarios, dataToSubmit);
            } else {
                result = await createUsuario(dataToSubmit as any); // Type assertion para lidar com Omit
            }

            if (!result.success) throw new Error(result.error);

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
                        onChange={(e) => setFormData({ ...formData, Nome: e.target.value })}
                        required
                    />
                    <Input
                        label="CPF"
                        value={formData.CPF}
                        onChange={(e) => setFormData({ ...formData, CPF: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Email"
                        type="email"
                        value={formData.Email}
                        onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                        required
                    />
                    <Input
                        label="Função"
                        value={formData.Funcao}
                        onChange={(e) => setFormData({ ...formData, Funcao: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Usuário (Login)"
                        value={formData.Usuario}
                        onChange={(e) => setFormData({ ...formData, Usuario: e.target.value })}
                        required
                    />
                    <Input
                        label={usuario ? "Nova Senha (opcional)" : "Senha"}
                        type="password"
                        value={formData.Senha || ''}
                        onChange={(e) => setFormData({ ...formData, Senha: e.target.value })}
                        required={!usuario}
                    />
                </div>

                <Select
                    label="Perfil de Acesso"
                    value={formData.Perfil}
                    onChange={(e) => setFormData({ ...formData, Perfil: e.target.value })}
                    options={[
                        { value: 'Administrador', label: 'Administrador' },
                        { value: 'Usuário', label: 'Usuário' },
                        { value: 'Consulta', label: 'Consulta' },
                    ]}
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
