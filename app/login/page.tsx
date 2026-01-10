'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Lock, User, LogIn } from 'lucide-react';

export default function LoginPage() {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Fazer login com Supabase Auth usando email
            // Como não temos email no sistema antigo, vamos usar o usuario@sindplast.local
            // No futuro, podemos implementar login com username se necessário
            const email = usuario.includes('@') ? usuario : `${usuario}@sindplast.local`;

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password: senha,
            });

            if (signInError) {
                toast.error('Usuário ou senha inválidos');
                setLoading(false);
                return;
            }

            toast.success('Login realizado com sucesso!');
            router.push('/dashboard');
        } catch (error) {
            console.error('Erro no login:', error);
            toast.error('Erro ao fazer login. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="glass-card p-8">
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="inline-block mb-4"
                        >
                            <Image
                                src="/images/SINDPLAST.png"
                                alt="Logo SINDPLAST"
                                width={96}
                                height={96}
                                className="object-contain drop-shadow-lg mx-auto"
                                priority
                            />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            SINDPLAST-AM
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Sistema de Gestão Sindical
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label
                                htmlFor="usuario"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
                            >
                                Usuário
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="usuario"
                                    type="text"
                                    value={usuario}
                                    onChange={(e) => setUsuario(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                                    placeholder="Digite seu usuário"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="senha"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
                            >
                                Senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="senha"
                                    type="password"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                                    placeholder="Digite sua senha"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Entrar
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        <p>Usuário padrão: <strong>Admin</strong></p>
                        <p>Senha padrão: <strong>Sindplast</strong></p>
                    </div>
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-6 text-white text-sm"
                >
                    © {new Date().getFullYear()} SINDPLAST-AM. Todos os direitos reservados.
                </motion.p>
            </motion.div>
        </div>
    );
}
