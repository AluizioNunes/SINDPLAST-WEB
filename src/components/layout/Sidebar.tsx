'use client';

import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

import { SYSTEM_MENU_ITEMS } from '@/config/menu';
import { usePermissions } from '@/hooks/usePermissions';

interface SidebarContentProps {
    collapsed?: boolean;
    onItemClick?: () => void;
    pathname: string;
    onClose?: () => void;
}

const SidebarContent = ({ collapsed = false, onItemClick, pathname, onClose }: SidebarContentProps) => {
    const { canAccessMenu, isLoading } = usePermissions();

    const filteredMenuItems = SYSTEM_MENU_ITEMS.filter(item => canAccessMenu(item.id));

    return (
    <div className="flex flex-col h-full bg-gradient-to-b from-red-600 to-red-800 text-white transition-all duration-300">
        <div className={`p-6 border-b border-red-500/30 h-20 flex items-center justify-between`}>
            {collapsed ? (
                <motion.div
                    layoutId="sidebar-logo"
                    className="w-full flex justify-center cursor-pointer"
                    onClick={onClose}
                    title="Expandir Menu"
                >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden p-1">
                        <img src="/images/SINDPLAST.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    layoutId="sidebar-logo"
                    className="flex items-center gap-3 w-full"
                >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden p-1 shrink-0">
                        <img src="/images/SINDPLAST.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-xl font-bold text-white whitespace-nowrap overflow-hidden flex-1">
                        SINDPLAST
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors lg:block hidden"
                        title="Recolher Menu"
                    >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                </motion.div>
            )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-red-400 scrollbar-track-transparent">
            {isLoading ? (
                 <div className="flex justify-center p-4">
                     <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 </div>
            ) : (
                filteredMenuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                return (
                    <Link key={item.href} to={item.href} onClick={onItemClick} title={collapsed ? item.label : ''}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03, duration: 0.3 }}
                            className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-all relative overflow-hidden ${isActive
                                ? 'bg-white text-red-600 shadow-lg font-bold'
                                : 'text-white/90 hover:bg-white/10'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-menu-bg"
                                    className="absolute inset-0 bg-white z-0"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <span className="z-10 relative flex items-center gap-3 w-full">
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-red-600' : 'text-white'}`} />
                                {!collapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="flex-1 flex items-center justify-between overflow-hidden"
                                    >
                                        <span className="font-medium whitespace-nowrap uppercase">{item.label}</span>
                                        {isActive && (
                                            <ChevronRight className="w-4 h-4 text-red-600" />
                                        )}
                                    </motion.div>
                                )}
                            </span>
                        </motion.div>
                    </Link>
                );
            }))}
        </nav>

        <div className="p-4 border-t border-red-500/30">
            {!collapsed ? (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-white/60 text-center whitespace-nowrap overflow-hidden"
                >
                    © {new Date().getFullYear()} SINDPLAST-AM
                </motion.p>
            ) : (
                <p className="text-xs text-white/60 text-center">
                    ©
                </p>
            )}
        </div>
    </div>
);
};

export default function Sidebar({ isOpen, isCollapsed, onClose }: SidebarProps) {
    const location = useLocation();
    const pathname = location.pathname;

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar (Animated) */}
            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: isOpen ? 0 : -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 h-full w-70 z-50 lg:hidden shadow-2xl"
            >
                <SidebarContent onItemClick={onClose} pathname={pathname} onClose={onClose} />
            </motion.aside>

            {/* Desktop Sidebar (Static Fixed) */}
            <aside
                className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 shadow-xl transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-70'
                    }`}
            >
                <SidebarContent collapsed={isCollapsed} pathname={pathname} onClose={onClose} />
            </aside>
        </>
    );
}
