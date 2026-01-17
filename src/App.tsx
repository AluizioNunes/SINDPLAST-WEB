import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';
import { Toaster } from 'react-hot-toast';

// Layout
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

// Pages
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Socios from '@/pages/Socios';
import Empresas from '@/pages/Empresas';
import Funcionarios from '@/pages/Funcionarios';
import Dependentes from '@/pages/Dependentes';
import Ativos from '@/pages/Ativos';
import CentroCustos from '@/pages/CentroCustos';
import ContasPagar from '@/pages/ContasPagar';
import ContasReceber from '@/pages/ContasReceber';
import Funcoes from '@/pages/Funcoes';
import Usuarios from '@/pages/Usuarios';
import Perfil from '@/pages/Perfil';
import Permissoes from '@/pages/Permissoes';
import Ferramentas from '@/pages/Ferramentas';
import Relatorios from '@/pages/Relatorios';

// Print Reports
import SociosReport from '@/pages/reports/SociosReport';
import EmpresasReport from '@/pages/reports/EmpresasReport';
import DependentesReport from '@/pages/reports/DependentesReport';
import SocioFichaReport from '@/pages/reports/SocioFichaReport';
import EmpresaFichaReport from '@/pages/reports/EmpresaFichaReport';
import DependenteFichaReport from '@/pages/reports/DependenteFichaReport';
import FuncionarioFichaReport from '@/pages/reports/FuncionarioFichaReport';
import UsuarioFichaReport from '@/pages/reports/UsuarioFichaReport';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const handleMenuClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(!sidebarOpen);
    } else {
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
        <Header onMenuClick={handleMenuClick} sidebarCollapsed={sidebarCollapsed} />
        <main className="p-6 pt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: '#ef4444', // Red-500 from Tailwind
            },
          }}
        >
          <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Print Reports - Outside Dashboard Layout */}
            <Route path="/relatorios/print/socios" element={<SociosReport />} />
            <Route path="/relatorios/print/empresas" element={<EmpresasReport />} />
            <Route path="/relatorios/print/dependentes" element={<DependentesReport />} />
            <Route path="/relatorios/print/socio/:id" element={<SocioFichaReport />} />
            <Route path="/relatorios/print/empresa/:id" element={<EmpresaFichaReport />} />
            <Route path="/relatorios/print/dependente/:id" element={<DependenteFichaReport />} />
            <Route path="/relatorios/print/funcionario/:id" element={<FuncionarioFichaReport />} />
            <Route path="/relatorios/print/usuario/:id" element={<UsuarioFichaReport />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="socios" element={<Socios />} />
                <Route path="empresas" element={<Empresas />} />
                <Route path="funcionarios" element={<Funcionarios />} />
                <Route path="dependentes" element={<Dependentes />} />
                <Route path="ativos" element={<Ativos />} />
                <Route path="centro-custos" element={<CentroCustos />} />
                <Route path="contas-pagar" element={<ContasPagar />} />
                <Route path="contas-receber" element={<ContasReceber />} />
                <Route path="funcoes" element={<Funcoes />} />
                <Route path="usuarios" element={<Usuarios />} />
                <Route path="perfil" element={<Perfil />} />
                <Route path="permissoes" element={<Permissoes />} />
                <Route path="ferramentas" element={<Ferramentas />} />
                <Route path="relatorios" element={<Relatorios />} />
              </Route>
            </Route>
          </Routes>
        </Router>
        <Toaster position="top-right" />
        </ConfigProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
