'use client';

import { Dependente } from '@/lib/types/dependente';

interface ReportViewProps {
    dependentes: Dependente[];
    title: string;
}

export default function ReportView({ dependentes, title }: ReportViewProps) {
    return (
        <div className="p-8 bg-white text-black min-h-screen font-sans">
            <div className="mb-8 flex justify-between items-center no-print">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    Imprimir / Salvar PDF
                </button>
            </div>

            <div className="mb-6 border-b-2 border-black pb-4">
                <div className="flex items-center gap-4 mb-4">
                    {/* Logo placeholder */}
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xs text-center font-bold border border-gray-400">
                        LOGO
                    </div>
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-wide">
                            Sindicato dos Trabalhadores nas Indústrias Plásticas de Manaus
                        </h2>
                        <p className="text-sm text-gray-600">SINDPLAST-AM</p>
                    </div>
                </div>
                
                <div className="flex justify-between text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div>
                        <span className="text-gray-500 block text-xs uppercase">Relatório</span>
                        <span className="font-bold text-gray-900">{title}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs uppercase">Data de Emissão</span>
                        <span className="font-bold text-gray-900">{new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-gray-500 block text-xs uppercase">Total de Registros</span>
                        <span className="font-bold text-gray-900">{dependentes.length}</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 text-gray-900">
                            <th className="border border-gray-300 p-2 text-left">Nome Dependente</th>
                            <th className="border border-gray-300 p-2 text-left">Sócio Responsável</th>
                            <th className="border border-gray-300 p-2 text-left w-32">Parentesco</th>
                            <th className="border border-gray-300 p-2 text-center w-24">Nascimento</th>
                            <th className="border border-gray-300 p-2 text-center w-20">Carteira</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dependentes.map((dep, index) => (
                            <tr key={dep.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} break-inside-avoid`}>
                                <td className="border border-gray-300 p-2 font-medium">{dep.dependente}</td>
                                <td className="border border-gray-300 p-2">
                                    <div className="flex flex-col">
                                        <span>{dep.socio}</span>
                                        {dep.empresa && <span className="text-[10px] text-gray-500">{dep.empresa}</span>}
                                    </div>
                                </td>
                                <td className="border border-gray-300 p-2 text-xs uppercase">{dep.parentesco}</td>
                                <td className="border border-gray-300 p-2 text-center">
                                    {dep.nascimento ? new Date(dep.nascimento).toLocaleDateString('pt-BR') : '-'}
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                    {dep.carteira ? 'Sim' : 'Não'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
                <p>Sistema de Gestão Sindical - SINDPLAST WEB</p>
                <p>Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 1cm; size: landscape; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .break-inside-avoid { page-break-inside: avoid; }
                }
            `}</style>
        </div>
    );
}
