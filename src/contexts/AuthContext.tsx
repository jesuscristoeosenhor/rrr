import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Usuario } from '@/types';
import { authService } from '@/services/authService';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  hasPermission: (action: string, resource: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid tokens
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.login({ email, senha: password });
      if (result) {
        setUser(result.user);
        localStorage.setItem('auth_token', result.token);
        toast.success(`Bem-vindo, ${result.user.nome}!`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    toast.success('Logout realizado com sucesso');
  }, []);

  const register = useCallback(async (userData: any) => {
    setIsLoading(true);
    try {
      await authService.register(userData);
      toast.success('Usuário registrado com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar usuário';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    setIsLoading(true);
    try {
      await authService.changePassword(String(user.id), oldPassword, newPassword);
      toast.success('Senha alterada com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao alterar senha';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const hasPermission = useCallback((action: string, resource: string): boolean => {
    if (!user) return false;
    return authService.hasPermission(user, action, resource);
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    changePassword,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};