'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Home,
    Users,
    Building2,
    UserCircle,
    Briefcase,
    Shield,
    Settings,
    FileText,
    Wrench,
    ChevronRight,
    Tags,
    Package,
    PieChart,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    onClose: () => void;
}

const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Sócios', href: '/socios' },
    { icon: Building2, label: 'Empresas', href: '/empresas' },
    { icon: UserCircle, label: 'Dependentes', href: '/dependentes' },
    { icon: Briefcase, label: 'Funcionários', href: '/funcionarios' },
    { icon: Tags, label: 'Funções', href: '/funcoes' },
    { icon: Package, label: 'Ativos', href: '/ativos' },
    { icon: PieChart, label: 'Centro de Custos', href: '/centro-custos' },
    { icon: TrendingDown, label: 'Contas a Pagar', href: '/contas-pagar' },
    { icon: TrendingUp, label: 'Contas a Receber', href: '/contas-receber' },
    { icon: Users, label: 'Usuários', href: '/usuarios' },
    { icon: Shield, label: 'Perfil', href: '/perfil' },
    { icon: Settings, label: 'Permissões', href: '/permissoes' },
    { icon: FileText, label: 'Relatórios', href: '/relatorios' },
    { icon: Wrench, label: 'Ferramentas', href: '/ferramentas' },
];

export default function Sidebar({ isOpen, isCollapsed, onClose }: SidebarProps) {
    const pathname = usePathname();

    const SidebarContent = ({ collapsed = false, onItemClick }: { collapsed?: boolean, onItemClick?: () => void }) => (
        <div className="flex flex-col h-full bg-gradient-to-b from-red-600 to-red-800 text-white transition-all duration-300">
            <div className={`p-6 border-b border-red-500/30 h-20 flex items-center justify-between`}>
                {collapsed ? (
                    <div
                        className="w-full flex justify-center cursor-pointer"
                        onClick={onClose}
                        title="Expandir Menu"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold backdrop-blur-sm">
                            S
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between w-full">
                        <h2 className="text-2xl font-bold text-white whitespace-nowrap overflow-hidden">
                            SINDPLAST
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors lg:block hidden"
                            title="Recolher Menu"
                        >
                            <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                    </div>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-red-400 scrollbar-track-transparent">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                    return (
                        <Link key={item.href} href={item.href} onClick={onItemClick} title={collapsed ? item.label : ''}>
                            <div
                                className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-white text-red-600 shadow-lg font-bold'
                                    : 'text-white/90 hover:bg-white/10'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-red-600' : 'text-white'}`} />
                                {!collapsed && (
                                    <>
                                        <span className="font-medium whitespace-nowrap overflow-hidden uppercase">{item.label}</span>
                                        {isActive && (
                                            <ChevronRight className="w-4 h-4 ml-auto text-red-600" />
                                        )}
                                    </>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-red-500/30">
                {!collapsed ? (
                    <p className="text-xs text-white/60 text-center whitespace-nowrap overflow-hidden">
                        © {new Date().getFullYear()} SINDPLAST-AM
                    </p>
                ) : (
                    <p className="text-xs text-white/60 text-center">
                        ©
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                />
            )}

            {/* Mobile Sidebar (Animated) */}
            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: isOpen ? 0 : -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 h-full w-70 z-50 lg:hidden shadow-2xl"
            >
                <SidebarContent onItemClick={onClose} />
            </motion.aside>

            {/* Desktop Sidebar (Static Fixed) */}
            <aside
                className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 shadow-xl transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-70'
                    }`}
            >
                <SidebarContent collapsed={isCollapsed} />
            </aside>
        </>
    );
}
