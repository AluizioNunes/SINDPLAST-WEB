import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { Perfil } from '@/lib/types/usuario';
import { createPerfil, updatePerfil } from '@/lib/services/perfilService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

interface PerfilModalProps {
    isOpen: boolean;
    onClose: () => void;
    perfil: Perfil | null;
}

export default function PerfilModal({ isOpen, onClose, perfil }: PerfilModalProps) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, setValue } = useForm<Partial<Perfil>>();

    useEffect(() => {
        if (perfil) {
            setValue('Perfil', perfil.Perfil);
            setValue('Descricao', perfil.Descricao);
        } else {
            reset({ Perfil: '', Descricao: '' });
        }
    }, [perfil, setValue, reset, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: Partial<Perfil>) => {
            if (perfil?.IdPerfil) {
                return updatePerfil(perfil.IdPerfil, data);
            }
            return createPerfil(data);
        },
        onSuccess: () => {
            toast.success(perfil ? 'Perfil atualizado!' : 'Perfil criado!');
            queryClient.invalidateQueries({ queryKey: ['perfis'] });
            onClose();
        },
        onError: () => {
            toast.error('Erro ao salvar perfil');
        },
    });

    const onSubmit = (data: Partial<Perfil>) => {
        mutation.mutate(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={perfil ? 'EDITAR PERFIL' : 'NOVO PERFIL'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase">
                        Nome do Perfil
                    </label>
                    <Input
                        {...register('Perfil', { required: true })}
                        placeholder="EX: ADMINISTRADOR"
                        className="uppercase"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase">
                        Descrição
                    </label>
                    <Input
                        {...register('Descricao')}
                        placeholder="DESCRIÇÃO DO PERFIL"
                        className="uppercase"
                    />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button type="button" variant="ghost" onClick={onClose} className="uppercase">
                        Cancelar
                    </Button>
                    <Button type="submit" loading={mutation.isPending} className="uppercase">
                        Salvar
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
