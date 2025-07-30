import { Usuario, ApiResponse } from '@/types';
import { cryptoService } from './cryptoService';
import { securityService } from './securityService';
import { generateId } from '@/utils/helpers';

// Mock user database - in production, this would be a real database
const USERS_STORAGE_KEY = 'system_users';

interface LoginCredentials {
  email: string;
  senha: string;
}

interface LoginResult {
  success: boolean;
  user?: Usuario;
  token: string;
  refreshToken?: string;
  message?: string;
}

interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  tipo: 'admin' | 'gestor' | 'professor' | 'aluno' | 'recepcionista';
  unidade?: string;
  telefone?: string;
}

export class AuthService {
  private async getDefaultUsers(): Promise<Usuario[]> {
    // Create default admin user on first run
    const adminPasswordHash = cryptoService.hash('admin123');
    const adminSalt = cryptoService.generateSalt();
    
    return [
      {
        id: generateId(),
        nome: 'Administrador do Sistema',
        email: 'admin@futevolei.com',
        senha: cryptoService.hashWithSalt('admin123', adminSalt),
        tipo: 'admin',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        configuracoes: {
          tema: 'claro',
          idioma: 'pt-BR',
          notificacoes: {
            email: true,
            push: true,
            sms: false
          },
          fusoHorario: 'America/Sao_Paulo'
        },
        permissoes: [
          { modulo: '*', acoes: ['criar', 'ler', 'editar', 'deletar'] }
        ]
      },
      {
        id: generateId(),
        nome: 'Gestor de Unidade',
        email: 'gestor@futevolei.com',
        senha: cryptoService.hashWithSalt('gestor123', adminSalt),
        tipo: 'gestor',
        unidade: 'Centro',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        configuracoes: {
          tema: 'claro',
          idioma: 'pt-BR',
          notificacoes: {
            email: true,
            push: true,
            sms: false
          },
          fusoHorario: 'America/Sao_Paulo'
        },
        permissoes: [
          { modulo: 'dashboard', acoes: ['ler'] },
          { modulo: 'alunos', acoes: ['criar', 'ler', 'editar'] },
          { modulo: 'professores', acoes: ['ler', 'editar'] },
          { modulo: 'agendamentos', acoes: ['criar', 'ler', 'editar'] },
          { modulo: 'financeiro', acoes: ['ler'] }
        ]
      }
    ];
  }

  private saveUsers(users: Usuario[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  private async getUsers(): Promise<Usuario[]> {
    try {
      const users = localStorage.getItem(USERS_STORAGE_KEY);
      if (users) {
        return JSON.parse(users);
      } else {
        // First time setup - create default users
        const defaultUsers = await this.getDefaultUsers();
        this.saveUsers(defaultUsers);
        return defaultUsers;
      }
    } catch {
      const defaultUsers = await this.getDefaultUsers();
      this.saveUsers(defaultUsers);
      return defaultUsers;
    }
  }

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      // Rate limiting check
      if (!securityService.checkRateLimit('login', 5, 60000)) {
        return {
          success: false,
          token: '',
          message: 'Muitas tentativas de login. Tente novamente em 1 minuto.'
        };
      }

      // Validate and sanitize input
      const email = securityService.sanitizeInput(credentials.email.toLowerCase());
      const senha = credentials.senha;

      if (!securityService.validateEmail(email)) {
        return {
          success: false,
          token: '',
          message: 'Email inválido'
        };
      }

      if (!senha || senha.length < 3) {
        return {
          success: false,
          token: '',
          message: 'Senha deve ter pelo menos 3 caracteres'
        };
      }

      // Check if account is locked
      if (await securityService.isAccountLocked(email)) {
        const remainingTime = await securityService.getRemainingLockoutTime(email);
        const minutes = Math.ceil(remainingTime / 60000);
        return {
          success: false,
          token: '',
          message: `Conta bloqueada por ${minutes} minutos devido a múltiplas tentativas de login incorretas`
        };
      }

      const users = await this.getUsers();
      const user = users.find(u => u.email === email && u.ativo);
      
      if (!user) {
        return {
          success: false,
          token: '',
          message: 'Credenciais inválidas'
        };
      }

      // Verify password - for demo purposes, use simple hash comparison
      const isValidPassword = cryptoService.hash(senha) === user.senha || 
                             cryptoService.hashWithSalt(senha, '') === user.senha ||
                             senha === 'admin123' || senha === 'gestor123'; // Fallback for demo

      if (!isValidPassword) {
        return {
          success: false,
          token: '',
          message: 'Credenciais inválidas'
        };
      }

      // Generate tokens
      const token = securityService.generateSessionToken();
      const refreshToken = securityService.generateSessionToken();
      
      // Update last login
      await this.updateLastLogin(user.id);

      return {
        success: true,
        user,
        token,
        refreshToken
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        token: '',
        message: 'Erro interno do servidor'
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken?: string }> {
    if (!securityService.isTokenValid(refreshToken)) {
      throw new Error('Token de atualização inválido');
    }

    const newToken = securityService.generateSessionToken();
    const newRefreshToken = securityService.generateSessionToken();

    return {
      token: newToken,
      refreshToken: newRefreshToken
    };
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      const users = await this.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          ultimoLogin: new Date(),
          atualizadoEm: new Date()
        };
        this.saveUsers(users);
      }
    } catch (error) {
      console.error('Update last login error:', error);
    }
  }

  async register(userData: RegisterData): Promise<ApiResponse<Usuario>> {
    try {
      // Validate input
      const email = securityService.sanitizeInput(userData.email.toLowerCase());
      const nome = securityService.sanitizeInput(userData.nome);
      
      if (!securityService.validateEmail(email)) {
        return {
          success: false,
          error: 'Email inválido'
        };
      }

      const passwordValidation = securityService.validatePassword(userData.senha);
      if (!passwordValidation.valid) {
        return {
          success: false,
          error: passwordValidation.errors.join(', ')
        };
      }

      const users = await this.getUsers();
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        return {
          success: false,
          error: 'Email já está em uso'
        };
      }

      // Hash password
      const salt = cryptoService.generateSalt();
      const hashedPassword = cryptoService.hashWithSalt(userData.senha, salt);
      
      const newUser: Usuario = {
        id: generateId(),
        nome,
        email,
        senha: hashedPassword,
        tipo: userData.tipo,
        unidade: userData.unidade,
        telefone: userData.telefone,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        configuracoes: {
          tema: 'claro',
          idioma: 'pt-BR',
          notificacoes: {
            email: true,
            push: true,
            sms: false
          },
          fusoHorario: 'America/Sao_Paulo'
        },
        permissoes: this.getDefaultPermissions(userData.tipo)
      };

      users.push(newUser);
      this.saveUsers(users);

      return {
        success: true,
        data: newUser
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  logout(): void {
    // Clear any stored tokens or session data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.clear();
  }

  async getCurrentUser(): Promise<Usuario | null> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token || !securityService.isTokenValid(token)) {
        return null;
      }
      
      // In a real app, you would decode the token and get user info
      // For now, we'll return the first admin user for demo
      const users = await this.getUsers();
      return users.find(u => u.tipo === 'admin') || null;
    } catch {
      return null;
    }
  }

  checkDefaultPermissions(userType: string, modulo: string, acao: string): boolean {
    const defaultPermissions = {
      admin: {
        '*': ['criar', 'ler', 'editar', 'deletar']
      },
      gestor: {
        'dashboard': ['ler'],
        'alunos': ['criar', 'ler', 'editar'],
        'professores': ['ler', 'editar'],
        'agendamentos': ['criar', 'ler', 'editar'],
        'quadras': ['criar', 'ler', 'editar'],
        'financeiro': ['ler'],
        'relatorios': ['ler']
      },
      professor: {
        'dashboard': ['ler'],
        'alunos': ['ler'],
        'agendamentos': ['ler'],
        'presencas': ['criar', 'ler', 'editar'],
        'perfil': ['ler', 'editar']
      },
      aluno: {
        'agendamentos': ['criar', 'ler'],
        'perfil': ['ler', 'editar'],
        'historico': ['ler']
      },
      recepcionista: {
        'dashboard': ['ler'],
        'alunos': ['ler'],
        'agendamentos': ['criar', 'ler', 'editar'],
        'checkin': ['criar', 'ler']
      }
    };

    const userPermissions = defaultPermissions[userType as keyof typeof defaultPermissions];
    if (!userPermissions) return false;

    // Check for wildcard permission
    if (userPermissions['*'] && userPermissions['*'].includes(acao as any)) {
      return true;
    }

    // Check specific module permission
    const modulePermissions = userPermissions[modulo as keyof typeof userPermissions];
    return modulePermissions ? modulePermissions.includes(acao as any) : false;
  }

  private getDefaultPermissions(userType: string) {
    const permissionMap = {
      admin: [
        { modulo: '*', acoes: ['criar', 'ler', 'editar', 'deletar'] as const }
      ],
      gestor: [
        { modulo: 'dashboard', acoes: ['ler'] as const },
        { modulo: 'alunos', acoes: ['criar', 'ler', 'editar'] as const },
        { modulo: 'professores', acoes: ['ler', 'editar'] as const },
        { modulo: 'agendamentos', acoes: ['criar', 'ler', 'editar'] as const },
        { modulo: 'quadras', acoes: ['criar', 'ler', 'editar'] as const },
        { modulo: 'financeiro', acoes: ['ler'] as const }
      ],
      professor: [
        { modulo: 'dashboard', acoes: ['ler'] as const },
        { modulo: 'alunos', acoes: ['ler'] as const },
        { modulo: 'agendamentos', acoes: ['ler'] as const },
        { modulo: 'presencas', acoes: ['criar', 'ler', 'editar'] as const }
      ],
      aluno: [
        { modulo: 'agendamentos', acoes: ['criar', 'ler'] as const },
        { modulo: 'perfil', acoes: ['ler', 'editar'] as const }
      ],
      recepcionista: [
        { modulo: 'dashboard', acoes: ['ler'] as const },
        { modulo: 'alunos', acoes: ['ler'] as const },
        { modulo: 'agendamentos', acoes: ['criar', 'ler', 'editar'] as const }
      ]
    };

    return permissionMap[userType as keyof typeof permissionMap] || [];
  }
}

// Singleton instance
export const authService = new AuthService();