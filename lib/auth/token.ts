import { jwtDecode } from 'jwt-decode';

interface TokenData {
  exp: number;
  userId: string;
  email: string;
  permissions: string[];
}

export class TokenService {
  private static readonly TOKEN_KEY = 'auth_token';
  
  static setToken(token: string): void {
    // Use httpOnly cookies instead of localStorage
    document.cookie = `${this.TOKEN_KEY}=${token}; path=/; secure; samesite=strict`;
  }
  
  static getToken(): string | null {
    // Get token from cookies
    const match = document.cookie.match(new RegExp(`(^| )${this.TOKEN_KEY}=([^;]+)`));
    return match ? match[2] : null;
  }
  
  static isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decoded = jwtDecode<TokenData>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
  
  static clearToken(): void {
    document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
} 