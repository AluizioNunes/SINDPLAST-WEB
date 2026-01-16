import React, { createContext, useContext, useState } from 'react';
import { Usuario } from '@/lib/types/usuario';

interface AuthContextType {
    user: Usuario | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (user: Usuario) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    loading: true,
    login: () => {},
    logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Usuario | null>(() => {
        if (typeof window === 'undefined') return null;
        const storedUser = sessionStorage.getItem('sindplast_user');
        if (!storedUser) return null;
        try {
            return JSON.parse(storedUser) as Usuario;
        } catch {
            sessionStorage.removeItem('sindplast_user');
            return null;
        }
    });
    const loading = false;

    const login = (userData: Usuario) => {
        setUser(userData);
        sessionStorage.setItem('sindplast_user', JSON.stringify(userData));
        sessionStorage.setItem('loginTime', new Date().toISOString());
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('sindplast_user');
        sessionStorage.removeItem('loginTime');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated: !!user, 
            loading, 
            login, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
