class CryptoService {
  private readonly SECRET_KEY = 'futevolei-management-2024';

  // Simple XOR encryption for demo purposes
  // In production, use proper encryption libraries like crypto-js
  encrypt(text: string): string {
    try {
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const keyChar = this.SECRET_KEY.charCodeAt(i % this.SECRET_KEY.length);
        const textChar = text.charCodeAt(i);
        result += String.fromCharCode(textChar ^ keyChar);
      }
      return btoa(result); // Base64 encode
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // Fallback to plain text
    }
  }

  decrypt(encryptedText: string): string {
    try {
      const decodedText = atob(encryptedText); // Base64 decode
      let result = '';
      for (let i = 0; i < decodedText.length; i++) {
        const keyChar = this.SECRET_KEY.charCodeAt(i % this.SECRET_KEY.length);
        const encryptedChar = decodedText.charCodeAt(i);
        result += String.fromCharCode(encryptedChar ^ keyChar);
      }
      return result;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText; // Fallback to encrypted text
    }
  }

  hash(text: string): string {
    // Simple hash function for demo purposes
    // In production, use proper hashing like bcrypt or scrypt
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  generateSalt(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  hashWithSalt(text: string, salt: string): string {
    return this.hash(text + salt);
  }

  verifyHash(text: string, hash: string, salt: string): boolean {
    return this.hashWithSalt(text, salt) === hash;
  }
}

export const cryptoService = new CryptoService();