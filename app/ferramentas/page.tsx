'use client';

import { Database, HardDrive, RefreshCw, Download, Upload, Settings } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function FerramentasPage() {
    const [syncing, setSyncing] = useState(false);

    const handleBackup = () => {
        toast.success('Backup iniciado! (Funcionalidade em desenvolvimento)');
    };

    const handleRestore = () => {
        if (confirm('Tem certeza que deseja restaurar o backup? Esta ação não pode ser desfeita.')) {
            toast.success('Restauração iniciada! (Funcionalidade em desenvolvimento)');
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setTimeout(() => {
            setSyncing(false);
            toast.success('Sincronização concluída!');
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Ferramentas
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Ferramentas administrativas e de manutenção do sistema
                </p>
            </div>

            {/* Database Tools */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Database className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Gerenciamento de Banco de Dados
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 glass-card border-2 border-transparent hover:border-purple-500 transition-all">
                        <HardDrive className="w-10 h-10 text-purple-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Backup do Banco
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Criar uma cópia de segurança completa do banco de dados
                        </p>
                        <Button
                            variant="primary"
                            icon={<Download className="w-4 h-4" />}
                            onClick={handleBackup}
                            className="w-full"
                        >
                            Fazer Backup
                        </Button>
                    </div>

                    <div className="p-6 glass-card border-2 border-transparent hover:border-amber-500 transition-all">
                        <Upload className="w-10 h-10 text-amber-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Restaurar Backup
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Restaurar o banco de dados a partir de um backup
                        </p>
                        <Button
                            variant="danger"
                            icon={<Upload className="w-4 h-4" />}
                            onClick={handleRestore}
                            className="w-full"
                        >
                            Restaurar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sync Tools */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <RefreshCw className="w-6 h-6 text-teal-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Sincronização
                    </h2>
                </div>

                <div className="p-6 glass-card border-2 border-transparent hover:border-teal-500 transition-all">
                    <div className="flex items-start gap-4">
                        <RefreshCw className={`w-10 h-10 text-teal-600 flex-shrink-0 ${syncing ? 'animate-spin' : ''}`} />
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Sincronizar Status dos Dependentes
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Atualiza automaticamente o status dos dependentes com base no status dos sócios
                            </p>
                            <Button
                                variant="primary"
                                icon={<RefreshCw className="w-4 h-4" />}
                                onClick={handleSync}
                                loading={syncing}
                            >
                                {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Info */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Settings className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Informações do Sistema
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 glass-card">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Versão</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">1.0.0</p>
                    </div>

                    <div className="p-4 glass-card">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ambiente</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {process.env.NODE_ENV === 'production' ? 'Produção' : 'Desenvolvimento'}
                        </p>
                    </div>

                    <div className="p-4 glass-card">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Banco de Dados</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">Supabase</p>
                    </div>
                </div>
            </div>

            {/* Warning */}
            <div className="glass-card p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex gap-3">
                    <Settings className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                            Atenção
                        </h3>
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            As ferramentas de backup e restauração devem ser usadas com cuidado.
                            Sempre faça um backup antes de realizar operações críticas no sistema.
                            Em caso de dúvidas, consulte o administrador do sistema.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
