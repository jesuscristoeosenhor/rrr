import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Verify a password against a hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a secure random password
 */
export const generateSecurePassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};

/**
 * Check password strength
 */
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Senha deve ter pelo menos 8 caracteres');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Senha deve conter pelo menos uma letra maiúscula');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Senha deve conter pelo menos uma letra minúscula');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Senha deve conter pelo menos um número');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Senha deve conter pelo menos um caractere especial');
  }

  // Additional length bonus
  if (password.length >= 12) {
    score += 1;
  }

  return {
    score,
    feedback,
    isStrong: score >= 4
  };
};