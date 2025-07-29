import { Usuario } from '@/types';
import { hashPassword, verifyPassword } from '@/utils/security';
import { loginSchema, usuarioSchema } from '@/utils/validation';
import { generateId } from '@/utils/helpers';

// Mock user database - in production, this would be a real database
const USERS_STORAGE_KEY = 'system_users';

interface LoginCredentials {
  email: string;
  senha: string;
}

interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  tipo: 'admin' | 'gestor' | 'professor' | 'aluno';
  unidade?: string;
  telefone?: string;
}

export class AuthService {
  private async getDefaultUsers(): Promise<Usuario[]> {
    // Create default admin user on first run with proper password hash
    const adminPasswordHash = await hashPassword('password123');
    
    return [
      {
        id: generateId(),
        nome: 'Administrador',
        email: 'admin@futvolei.com',
        senha: adminPasswordHash,
        tipo: 'admin',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
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

  async login(credentials: LoginCredentials): Promise<{ user: Usuario; token: string } | null> {
    try {
      // Validate input
      const validatedCredentials = loginSchema.parse(credentials);
      
      const users = await this.getUsers();
      const user = users.find(u => u.email === validatedCredentials.email && u.ativo);
      
      if (!user) {
        throw new Error('Usuário não encontrado ou inativo');
      }

      // For existing users with plain text passwords (migration)  
      if (!user.senha.startsWith('$2a$')) {
        if (user.senha === validatedCredentials.senha) {
          // Hash the password and update the user
          user.senha = await hashPassword(validatedCredentials.senha);
          this.saveUsers(users);
        } else {
          throw new Error('Credenciais inválidas');
        }
      } else {
        // Verify hashed password
        const isValidPassword = await verifyPassword(validatedCredentials.senha, user.senha);
        if (!isValidPassword) {
          throw new Error('Credenciais inválidas');
        }
      }

      // Generate JWT token (simplified for now)
      const token = this.generateToken(user);
      
      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<Usuario> {
    try {
      // Validate input
      const validatedData = usuarioSchema.parse({
        ...userData,
        id: generateId(),
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      });

      const users = await this.getUsers();
      
      // Check if user already exists
      if (users.some(u => u.email === validatedData.email)) {
        throw new Error('Email já está em uso');
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.senha);
      
      const newUser: Usuario = {
        ...validatedData,
        id: validatedData.id!, // We know id exists because we set it above
        senha: hashedPassword,
        criadoEm: validatedData.criadoEm!, // We know these exist because we set them above
        atualizadoEm: validatedData.atualizadoEm!,
      };

      users.push(newUser);
      this.saveUsers(users);

      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      const users = await this.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('Usuário não encontrado');
      }

      const user = users[userIndex];
      
      // Verify old password
      const isValidOldPassword = await verifyPassword(oldPassword, user.senha);
      if (!isValidOldPassword) {
        throw new Error('Senha atual incorreta');
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);
      
      // Update user
      users[userIndex] = {
        ...user,
        senha: hashedNewPassword,
        atualizadoEm: new Date(),
      };

      this.saveUsers(users);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  logout(): void {
    // Clear any stored tokens or session data
    localStorage.removeItem('auth_token');
    sessionStorage.clear();
  }

  private generateToken(user: Usuario): string {
    // Simplified token generation - in production, use proper JWT
    const payload = {
      id: user.id,
      email: user.email,
      tipo: user.tipo,
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };
    
    return btoa(JSON.stringify(payload));
  }

  async validateToken(token: string): Promise<Usuario | null> {
    try {
      const payload = JSON.parse(atob(token));
      
      // Check if token is expired
      if (payload.exp < Date.now()) {
        return null;
      }

      const users = await this.getUsers();
      return users.find(u => u.id === payload.id && u.ativo) || null;
    } catch {
      return null;
    }
  }

  async getCurrentUser(): Promise<Usuario | null> {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    return this.validateToken(token);
  }

  hasPermission(user: Usuario, action: string, resource: string): boolean {
    // Role-based access control
    const permissions = {
      admin: ['*'], // Admin has all permissions
      gestor: ['read:*', 'write:alunos', 'write:professores', 'write:financeiro'],
      professor: ['read:alunos', 'read:agendamentos', 'write:presencas'],
      aluno: ['read:perfil', 'write:perfil', 'read:aulas'],
    };

    const userPermissions = permissions[user.tipo] || [];
    
    // Check for wildcard permission
    if (userPermissions.includes('*')) {
      return true;
    }

    // Check specific permission
    const permission = `${action}:${resource}`;
    if (userPermissions.includes(permission)) {
      return true;
    }

    // Check wildcard action
    const wildcardAction = `${action}:*`;
    if (userPermissions.includes(wildcardAction)) {
      return true;
    }

    return false;
  }
}

// Singleton instance
export const authService = new AuthService();