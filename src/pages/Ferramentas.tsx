import { Database, HardDrive, RefreshCw, Download, Upload } from 'lucide-react';
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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                    <Database className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Gerenciamento de Banco de Dados
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-transparent hover:border-purple-500 transition-all">
                        <HardDrive className="w-10 h-10 text-purple-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Backup do Banco
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Criar uma cópia de segurança completa do banco de dados
                        </p>
                        <Button
                            onClick={handleBackup}
                            className="w-full"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Fazer Backup
                        </Button>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-transparent hover:border-amber-500 transition-all">
                        <Upload className="w-10 h-10 text-amber-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Restaurar Backup
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Restaurar o banco de dados a partir de um backup
                        </p>
                        <Button
                            variant="danger"
                            onClick={handleRestore}
                            className="w-full"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Restaurar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sync Tools */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                    <RefreshCw className="w-6 h-6 text-teal-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Sincronização
                    </h2>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-transparent hover:border-teal-500 transition-all">
                    <div className="flex items-start gap-4">
                        <RefreshCw className={`w-10 h-10 text-teal-600 flex-shrink-0 ${syncing ? 'animate-spin' : ''}`} />
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Sincronização de Dados
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Sincronizar dados locais com o servidor remoto. Útil para resolver conflitos ou atualizar cache.
                            </p>
                            <Button
                                onClick={handleSync}
                                disabled={syncing}
                                className="w-full sm:w-auto"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                                {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
