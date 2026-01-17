import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReportLayout from '@/components/reports/ReportLayout';
import { getSocioById } from '@/lib/services/socioService';
import { getDependentesBySocioId } from '@/lib/services/dependenteService';
import type { ReactNode } from 'react';

export default function SocioFichaReport() {
    const { id } = useParams();
    const socioId = Number(id);

    const { data: socio, isLoading, error } = useQuery({
        queryKey: ['socio-ficha', socioId],
        queryFn: () => getSocioById(socioId),
        enabled: Number.isFinite(socioId) && socioId > 0,
    });

    const { data: dependentes = [] } = useQuery({
        queryKey: ['socio-dependentes', socioId],
        queryFn: () => getDependentesBySocioId(socioId),
        enabled: Number.isFinite(socioId) && socioId > 0,
    });

    if (!Number.isFinite(socioId) || socioId <= 0) {
        return (
            <ReportLayout title="Ficha do Sócio" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-red-600">ID inválido.</div>
            </ReportLayout>
        );
    }

    if (isLoading) {
        return (
            <ReportLayout title="Ficha do Sócio" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-gray-600">Carregando...</div>
            </ReportLayout>
        );
    }

    if (error) {
        return (
            <ReportLayout title="Ficha do Sócio" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-red-600">Erro: {(error as Error).message}</div>
            </ReportLayout>
        );
    }

    if (!socio) {
        return (
            <ReportLayout title="Ficha do Sócio" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-gray-600">Sócio não encontrado.</div>
            </ReportLayout>
        );
    }

    const formatDate = (value?: string | null) => {
        if (!value) return '-';
        const raw = String(value || '').trim();
        const d = new Date(raw.includes(' ') ? raw.replace(' ', 'T') : raw);
        return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('pt-BR');
    };

    const formatMoney = (value?: number | null) => {
        if (value == null) return '-';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const yn = (v?: boolean | null) => (v ? 'SIM' : 'NÃO');

    return (
        <ReportLayout title="Ficha do Sócio" total={1} pageOrientation="portrait" singlePage showFooter={false}>
            <div className="border border-gray-300 p-3 text-[11px]">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="text-base font-bold leading-tight">{socio.nome || '-'}</div>
                        <div className="mt-1 grid grid-cols-3 gap-2 text-[10px] text-gray-700">
                            <div className="truncate"><span className="font-bold">MATRÍCULA:</span> {socio.matricula || '-'}</div>
                            <div className="truncate"><span className="font-bold">STATUS:</span> {socio.status || '-'}</div>
                            <div className="truncate"><span className="font-bold">CADASTRO:</span> {formatDate(socio.dataCadastro)}</div>
                        </div>
                        <div className="mt-1 text-[10px] text-gray-700">
                            <span className="font-bold">CADASTRANTE:</span> {socio.cadastrante || '-'}
                        </div>
                    </div>
                    {socio.imagem ? (
                        <div className="w-24 h-24 rounded-full border border-gray-300 overflow-hidden flex-shrink-0">
                            <img src={socio.imagem} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-500 flex-shrink-0">
                            SEM FOTO
                        </div>
                    )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                    <Card title="Pessoal">
                        <Info label="CPF" value={socio.cpf || '-'} />
                        <Info label="RG" value={[socio.rg, socio.emissor].filter(Boolean).join(' - ') || '-'} />
                        <Info label="Nascimento" value={formatDate(socio.nascimento)} />
                        <Info label="Sexo" value={socio.sexo || '-'} />
                        <Info label="Estado Civil" value={socio.estadoCivil || '-'} />
                        <Info label="Nacionalidade" value={socio.nacionalidade || '-'} />
                        <Info label="Naturalidade" value={[socio.naturalidade, socio.naturalidadeUF].filter(Boolean).join(' / ') || '-'} />
                    </Card>

                    <Card title="Contato">
                        <Info label="Telefone" value={socio.telefone || '-'} />
                        <Info label="Celular" value={socio.celular || '-'} />
                        <Info label="Email" value={socio.email || '-'} />
                        <Info label="Rede Social" value={socio.redeSocial || '-'} />
                        <Info label="Link Rede Social" value={socio.linkRedeSocial || '-'} />
                    </Card>

                    <Card title="Endereço">
                        <Info label="CEP" value={socio.cep || '-'} />
                        <Info label="Cidade/UF" value={[socio.cidade, socio.uf].filter(Boolean).join(' / ') || '-'} />
                        <Info label="Bairro" value={socio.bairro || '-'} />
                        <Info label="Endereço" value={socio.endereco || '-'} />
                        <Info label="Complemento" value={socio.complemento || '-'} />
                    </Card>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2">
                    <Card title="Sindicato / Empresa">
                        <Info label="Empresa" value={socio.empresa || socio.nomeFantasia || socio.razaoSocial || '-'} />
                        <Info label="Setor" value={socio.setor || '-'} />
                        <Info label="Função" value={socio.funcao || '-'} />
                        <Info label="Admissão" value={formatDate(socio.dataAdmissao)} />
                        <Info label="Demissão" value={formatDate(socio.dataDemissao)} />
                        <Info label="Motivo" value={socio.motivoDemissao || '-'} />
                    </Card>

                    <Card title="Profissional">
                        <Info label="CNPJ" value={socio.cnpj || '-'} />
                        <Info label="Razão Social" value={socio.razaoSocial || '-'} />
                        <Info label="Nome Fantasia" value={socio.nomeFantasia || '-'} />
                        <Info label="Cod. Empresa" value={socio.codEmpresa || '-'} />
                        <Info label="CTPS" value={socio.ctps || '-'} />
                    </Card>

                    <Card title="Mensalidade / Documentos">
                        <Info label="Data Mensalidade" value={formatDate(socio.dataMensalidade)} />
                        <Info label="Valor Mensalidade" value={formatMoney(socio.valorMensalidade)} />
                        <Info label="Carta" value={yn(socio.carta)} />
                        <Info label="Carteira" value={yn(socio.carteira)} />
                        <Info label="Ficha" value={yn(socio.ficha)} />
                    </Card>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                    <Card title="Filiação">
                        <Info label="Pai" value={socio.pai || '-'} />
                        <Info label="Mãe" value={socio.mae || '-'} />
                    </Card>

                    <Card title={`Dependentes (${dependentes.length})`}>
                        {dependentes.length ? (
                            <table className="w-full text-[10px] border-collapse">
                                <thead>
                                    <tr className="text-gray-700">
                                        <th className="text-left font-bold uppercase tracking-wider border-b border-gray-200 pb-1">Dependente</th>
                                        <th className="text-left font-bold uppercase tracking-wider border-b border-gray-200 pb-1">Parentesco</th>
                                        <th className="text-center font-bold uppercase tracking-wider border-b border-gray-200 pb-1 w-20">Nascimento</th>
                                        <th className="text-center font-bold uppercase tracking-wider border-b border-gray-200 pb-1 w-16">Carteira</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dependentes.slice(0, 6).map((d) => (
                                        <tr key={d.id} className="border-b border-gray-100">
                                            <td className="py-1 pr-2">{d.dependente || '-'}</td>
                                            <td className="py-1 pr-2 uppercase">{d.parentesco || '-'}</td>
                                            <td className="py-1 text-center">{d.nascimento ? formatDate(d.nascimento) : '-'}</td>
                                            <td className="py-1 text-center">{d.carteira ? 'SIM' : 'NÃO'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-[10px] text-gray-500">Sem dependentes cadastrados.</div>
                        )}
                    </Card>
                </div>

                <div className="mt-2">
                    <Card title="Observação">
                        <div className="text-[11px] whitespace-pre-wrap break-words">{socio.observacao || '-'}</div>
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
