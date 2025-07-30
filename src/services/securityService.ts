import { cryptoService } from './cryptoService';

interface LoginAttempt {
  email: string;
  success: boolean;
  timestamp: Date;
  ip?: string;
}

class SecurityService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
  private readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private getLoginAttempts(): LoginAttempt[] {
    const attempts = localStorage.getItem('login_attempts');
    return attempts ? JSON.parse(attempts) : [];
  }

  private saveLoginAttempts(attempts: LoginAttempt[]): void {
    localStorage.setItem('login_attempts', JSON.stringify(attempts));
  }

  async logLoginAttempt(email: string, success: boolean, ip?: string): Promise<void> {
    const attempts = this.getLoginAttempts();
    const newAttempt: LoginAttempt = {
      email,
      success,
      timestamp: new Date(),
      ip
    };

    attempts.push(newAttempt);

    // Keep only last 100 attempts and clean old ones
    const recentAttempts = attempts
      .filter(attempt => Date.now() - new Date(attempt.timestamp).getTime() < 24 * 60 * 60 * 1000)
      .slice(-100);

    this.saveLoginAttempts(recentAttempts);
  }

  async isAccountLocked(email: string): Promise<boolean> {
    const attempts = this.getLoginAttempts();
    const recentFailedAttempts = attempts.filter(attempt => 
      attempt.email === email && 
      !attempt.success &&
      Date.now() - new Date(attempt.timestamp).getTime() < this.LOCKOUT_DURATION
    );

    return recentFailedAttempts.length >= this.MAX_LOGIN_ATTEMPTS;
  }

  async getRemainingLockoutTime(email: string): Promise<number> {
    if (!await this.isAccountLocked(email)) return 0;

    const attempts = this.getLoginAttempts();
    const lastFailedAttempt = attempts
      .filter(attempt => attempt.email === email && !attempt.success)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (!lastFailedAttempt) return 0;

    const timeSinceLastAttempt = Date.now() - new Date(lastFailedAttempt.timestamp).getTime();
    return Math.max(0, this.LOCKOUT_DURATION - timeSinceLastAttempt);
  }

  generateSessionToken(): string {
    const timestamp = Date.now();
    const randomData = Math.random().toString(36).substring(2);
    const tokenData = `${timestamp}-${randomData}`;
    return cryptoService.encrypt(tokenData);
  }

  isTokenValid(token: string): boolean {
    try {
      const decryptedData = cryptoService.decrypt(token);
      const timestamp = parseInt(decryptedData.split('-')[0]);
      const tokenAge = Date.now() - timestamp;
      
      return tokenAge < this.TOKEN_EXPIRY;
    } catch {
      return false;
    }
  }

  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 255); // Limit length
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }

    if (password.length > 128) {
      errors.push('Senha não pode ter mais de 128 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  encryptSensitiveData(data: string): string {
    return cryptoService.encrypt(data);
  }

  decryptSensitiveData(encryptedData: string): string {
    return cryptoService.decrypt(encryptedData);
  }

  generateCSRFToken(): string {
    return this.generateSessionToken();
  }

  validateCSRFToken(token: string): boolean {
    return this.isTokenValid(token);
  }

  logSecurityEvent(event: string, details: any): void {
    const securityLog = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.warn('Security Event:', securityLog);
    
    // In a real app, this would be sent to a security monitoring service
    const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    existingLogs.push(securityLog);
    
    // Keep only last 50 security events
    const recentLogs = existingLogs.slice(-50);
    localStorage.setItem('security_logs', JSON.stringify(recentLogs));
  }

  checkRateLimit(action: string, limit: number = 10, windowMs: number = 60000): boolean {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Filter attempts within the time window
    const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
    
    if (recentAttempts.length >= limit) {
      this.logSecurityEvent('rate_limit_exceeded', { action, limit, windowMs });
      return false;
    }

    // Add current attempt
    recentAttempts.push(now);
    localStorage.setItem(key, JSON.stringify(recentAttempts));
    
    return true;
  }
}

export const securityService = new SecurityService();