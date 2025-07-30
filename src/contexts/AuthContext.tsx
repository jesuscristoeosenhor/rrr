import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Usuario, AuthContextType } from '@/types';
import { authService } from '@/services/authService';
import { securityService } from '@/services/securityService';
import { toast } from 'react-hot-toast';

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
        const token = localStorage.getItem('auth_token');
        if (token && securityService.isTokenValid(token)) {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            // Update last login time
            await authService.updateLastLogin(currentUser.id);
          }
        } else {
          // Clear invalid tokens
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Token refresh logic
  useEffect(() => {
    if (user) {
      const refreshInterval = setInterval(async () => {
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const result = await authService.refreshToken(refreshToken);
            localStorage.setItem('auth_token', result.token);
            if (result.refreshToken) {
              localStorage.setItem('refresh_token', result.refreshToken);
            }
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          logout();
        }
      }, 15 * 60 * 1000); // Refresh every 15 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [user]);

  const login = useCallback(async (email: string, senha: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Security checks
      if (await securityService.isAccountLocked(email)) {
        throw new Error('Conta temporariamente bloqueada por múltiplas tentativas de login');
      }

      const result = await authService.login({ email, senha });
      
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('auth_token', result.token);
        if (result.refreshToken) {
          localStorage.setItem('refresh_token', result.refreshToken);
        }
        
        // Log successful login
        await securityService.logLoginAttempt(email, true);
        
        toast.success(`Bem-vindo, ${result.user.nome}!`);
        return true;
      } else {
        await securityService.logLoginAttempt(email, false);
        throw new Error(result.message || 'Credenciais inválidas');
      }
    } catch (error) {
      await securityService.logLoginAttempt(email, false);
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    const userNome = user?.nome;
    
    authService.logout();
    setUser(null);
    
    // Clear all auth tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    
    toast.success(`Até logo${userNome ? `, ${userNome}` : ''}!`);
  }, [user]);

  const updateUser = useCallback((userData: Partial<Usuario>) => {
    if (user) {
      const updatedUser = { ...user, ...userData, atualizadoEm: new Date() };
      setUser(updatedUser);
    }
  }, [user]);

  const hasPermission = useCallback((modulo: string, acao: string): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.tipo === 'admin') return true;
    
    // Check specific permissions
    if (user.permissoes) {
      const moduloPermission = user.permissoes.find(p => p.modulo === modulo);
      return moduloPermission?.acoes.includes(acao as any) || false;
    }
    
    // Default role-based permissions
    return authService.checkDefaultPermissions(user.tipo, modulo, acao);
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
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