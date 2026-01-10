'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Desktop - Iniciar colapsado

    const handleMenuClick = () => {
        // Se for mobile (tela pequena), abre/fecha o drawer
        if (window.innerWidth < 1024) {
            setSidebarOpen(!sidebarOpen);
        } else {
            // Se for desktop, alterna entre colapsado e expandido
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <Sidebar
                isOpen={sidebarOpen}
                isCollapsed={sidebarCollapsed}
                onClose={handleMenuClick}
            />

            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-70'}`}>
                <Header
                    onMenuClick={handleMenuClick}
                    sidebarCollapsed={sidebarCollapsed}
                />

                <main className="p-6 pt-20">
                    {children}
                </main>
            </div>
        </div>
    );
}
