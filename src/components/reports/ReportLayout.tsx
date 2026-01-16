import { ReactNode } from 'react';

interface ReportLayoutProps {
    title: string;
    total: number;
    children: ReactNode;
    pageOrientation?: 'portrait' | 'landscape';
    singlePage?: boolean;
    showFooter?: boolean;
}

export default function ReportLayout({
    title,
    total,
    children,
    pageOrientation = 'landscape',
    singlePage = false,
    showFooter = true,
}: ReportLayoutProps) {
    const emittedAt = new Date();
    return (
        <div className="bg-white text-black font-sans report-root">
            <div className="p-8 report-content">
            <div className="mb-8 flex justify-between items-center no-print">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    Imprimir / Salvar PDF
                </button>
            </div>

            <div className="mb-6">
                <div className="rounded-2xl overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-4 flex items-center gap-4">
                        <img
                            src="/images/SINDPLAST.png"
                            alt="Logo SINDPLAST"
                            width={56}
                            height={56}
                            className="object-contain drop-shadow-md"
                        />
                        <div className="flex flex-col justify-center min-w-0">
                            <div className="text-xl font-black tracking-wide leading-none text-white drop-shadow-sm whitespace-nowrap">
                                SINDPLAST-AM
                            </div>
                            <div className="text-[10px] font-bold text-white/90 tracking-wide leading-tight uppercase">
                                SINDICATO DOS TRABALHADORES NAS INDÚSTRIAS DE MATERIAL PLÁSTICO DE MANAUS E DO ESTADO DO AMAZONAS
                            </div>
                        </div>
                    </div>

                    <div className="bg-white px-6 py-3 flex items-center justify-between gap-4 text-sm">
                        <div>
                            <div className="text-gray-500 block text-xs uppercase">Relatório</div>
                            <div className="font-bold text-gray-900">{title}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-gray-500 block text-xs uppercase">Data de Emissão</div>
                            <div className="font-bold text-gray-900">
                                {emittedAt.toLocaleDateString('pt-BR')} {emittedAt.toLocaleTimeString('pt-BR')}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-gray-500 block text-xs uppercase">Total de Registros</div>
                            <div className="font-bold text-gray-900">{total}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                {children}
            </div>

            {showFooter && (
                <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-200 pt-4 report-footer">
                    <p>Sistema de Gestão Sindical - SINDPLAST WEB</p>
                    <p>Gerado em {emittedAt.toLocaleDateString('pt-BR')}</p>
                </div>
            )}

            <style>{`
                @media print {
                    @page { margin: 8mm; size: A4 ${pageOrientation}; }
                    body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .break-inside-avoid { page-break-inside: avoid; }
                    .report-root { min-height: auto !important; }
                    .report-content { padding: 0 !important; }
                    ${singlePage ? '.report-footer { display: none !important; }' : ''}
                }
            `}</style>
            </div>
        </div>
    );
}
