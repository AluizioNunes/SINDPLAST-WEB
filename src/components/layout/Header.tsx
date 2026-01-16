'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
    LogOut,
    Menu,
    Moon,
    Sun,
    User,
    Clock,
    Calendar,
    Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

interface HeaderProps {
    onMenuClick: () => void;
    sidebarCollapsed?: boolean;
}

export default function Header({ onMenuClick, sidebarCollapsed }: HeaderProps) {
    const { user, logout } = useAuth();
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });
    const [loginTime] = useState<Date>(() => {
        const storedLoginTime = sessionStorage.getItem('loginTime');
        return storedLoginTime ? new Date(storedLoginTime) : new Date();
    });
    const [connectionTime, setConnectionTime] = useState<string>('00:00:00');
    const navigate = useNavigate();

    useEffect(() => {
        // Timer de conexão
        const timer = window.setInterval(() => {
            const start = sessionStorage.getItem('loginTime');
            if (start) {
                const startTime = new Date(start).getTime();
                const now = new Date().getTime();
                const diff = now - startTime;

                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                setConnectionTime(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }
        }, 1000);

        return () => window.clearInterval(timer);
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        toast.success('Logout realizado com sucesso');
    };

    return (
        <header className={`fixed top-0 right-0 z-30 transition-all duration-300 bg-gradient-to-r from-red-600 to-red-800 text-white backdrop-blur-md border-b border-red-500/30 h-20 shadow-lg
            ${sidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-70'}`}>

            <div className="h-full px-4 lg:px-6 flex items-center justify-between overflow-hidden">
                {/* Esquerda: Logo e Títulos */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors mr-2 lg:hidden"
                        title="Menu"
                    >
                        <Menu className="w-6 h-6 text-white" />
                    </button>

                    <div className="flex items-center gap-4 select-none">
                        <img
                            src="/images/SINDPLAST.png"
                            alt="Logo SINDPLAST"
                            width={60}
                            height={60}
                            className="object-contain drop-shadow-md"
                        />
                        <div className="flex flex-col justify-center">
                            <h1 className="text-2xl font-black tracking-wide leading-none text-white drop-shadow-sm whitespace-nowrap">
                                SINDPLAST-AM
                            </h1>
                            <p className="text-[9px] sm:text-[11px] font-bold text-white/90 tracking-wide leading-tight whitespace-nowrap uppercase">
                                SINDICATO DOS TRABALHADORES NAS INDÚSTRIAS DE MATERIAL PLÁSTICO DE MANAUS E DO ESTADO DO AMAZONAS
                            </p>
                        </div>
                    </div>
                </div>

                {/* Direita: Informações do Usuário e Controles */}
                <div className="flex items-center gap-4 lg:gap-6">
                    {user && (
                        <div className="hidden lg:flex flex-col items-end gap-1 text-right">
                            {/* Nome e Cargo Simplificado */}
                            <div className="flex items-center justify-end gap-2 font-bold text-[14.4px] leading-tight text-white drop-shadow-sm uppercase whitespace-nowrap">
                                <User className="w-4 h-4 text-white" />
                                <span>{user.Nome || 'USUÁRIO'}</span>
                                <span className="opacity-50 mx-1">|</span>
                                <span className="text-white/90">{user.Funcao || 'N/A'}</span>
                            </div>

                            {/* Função Detalhada e Perfil (Badge) */}
                            <div className="flex items-center justify-end gap-3 text-[9.6px] text-white/90 font-medium uppercase tracking-wide whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                    <Briefcase className="w-3 h-3 text-white/80" />
                                    <span>USUÁRIO: {user.Usuario || 'LOGIN'}</span>
                                </div>
                                <span className="opacity-30">|</span>
                                <div className="flex items-center gap-1.5">
                                    <span>PERFIL:</span>
                                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[8px] text-white border border-white/30">
                                        {user.Perfil || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Datas e Tempos */}
                            <div className="flex items-center justify-end gap-3 text-[9.6px] text-white/80 font-medium uppercase tracking-wide whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3 text-white/70" />
                                    <span>CONECTADO: {loginTime?.toLocaleDateString()} {loginTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <span className="opacity-30">|</span>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-white/70" />
                                    <span>TEMPO: {connectionTime}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 sm:gap-4 pl-4 border-l border-white/20">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                            title={isDark ? 'Modo Claro' : 'Modo Escuro'}
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white transition-colors text-xs font-bold uppercase tracking-wider bg-white/10 border border-white/20"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
