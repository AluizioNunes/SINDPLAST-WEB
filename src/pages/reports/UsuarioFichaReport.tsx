import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReportLayout from '@/components/reports/ReportLayout';
import { getUsuarioById } from '@/lib/services/usuarioService';
import type { ReactNode } from 'react';

export default function UsuarioFichaReport() {
    const { id } = useParams();
    const usuarioId = Number(id);

    const { data: usuario, isLoading, error } = useQuery({
        queryKey: ['usuario-ficha', usuarioId],
        queryFn: () => getUsuarioById(usuarioId),
        enabled: Number.isFinite(usuarioId) && usuarioId > 0,
    });

    if (!Number.isFinite(usuarioId) || usuarioId <= 0) {
        return (
            <ReportLayout title="Ficha do Usuário" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-red-600">ID inválido.</div>
            </ReportLayout>
        );
    }

    if (isLoading) {
        return (
            <ReportLayout title="Ficha do Usuário" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-gray-600">Carregando...</div>
            </ReportLayout>
        );
    }

    if (error) {
        return (
            <ReportLayout title="Ficha do Usuário" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-red-600">Erro: {(error as Error).message}</div>
            </ReportLayout>
        );
    }

    if (!usuario) {
        return (
            <ReportLayout title="Ficha do Usuário" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-gray-600">Usuário não encontrado.</div>
            </ReportLayout>
        );
    }

    const formatDate = (value?: string | null) => {
        if (!value) return '-';
        const raw = String(value || '').trim();
        const d = new Date(raw.includes(' ') ? raw.replace(' ', 'T') : raw);
        return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('pt-BR');
    };

    const imagem = usuario.Imagem;

    return (
        <ReportLayout title="Ficha do Usuário" total={1} pageOrientation="portrait" singlePage showFooter={false}>
            <div className="border border-gray-300 p-3 text-[11px]">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="text-base font-bold leading-tight">{usuario.Nome || '-'}</div>
                        <div className="mt-1 grid grid-cols-3 gap-2 text-[10px] text-gray-700">
                            <div className="truncate"><span className="font-bold">ID:</span> {String(usuario.IdUsuarios || '-')}</div>
                            <div className="truncate"><span className="font-bold">USUÁRIO:</span> {usuario.Usuario || '-'}</div>
                            <div className="truncate"><span className="font-bold">CADASTRO:</span> {formatDate(usuario.DataCadastro || null)}</div>
                        </div>
                        <div className="mt-1 text-[10px] text-gray-700">
                            <span className="font-bold">EMAIL:</span> {usuario.Email || '-'}
                        </div>
                    </div>
                    {imagem ? (
                        <div className="w-24 h-24 rounded-full border border-gray-300 overflow-hidden flex-shrink-0">
                            <img src={imagem} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-500 flex-shrink-0">
                            SEM FOTO
                        </div>
                    )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                    <Card title="Acesso">
                        <Info label="Perfil" value={usuario.Perfil || '-'} />
                        <Info label="Usuário (login)" value={usuario.Usuario || '-'} />
                    </Card>
                    <Card title="Dados">
                        <Info label="CPF" value={usuario.CPF || '-'} />
                        <Info label="Função" value={usuario.Funcao || '-'} />
                        <Info label="Cadastrante" value={usuario.Cadastrante || '-'} />
                    </Card>
                </div>
            </div>
        </ReportLayout>
    );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="border border-gray-200 p-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-700">{title}</div>
            <div className="mt-1 space-y-1">{children}</div>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600">{label}</div>
            <div className="min-w-0 flex-1 text-right font-medium truncate">{value}</div>
        </div>
    );
}
