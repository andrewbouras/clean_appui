import { api } from '../api/client';
import { TokenService } from './token';

interface RefreshResponse {
  token: string;
  error?: string;
}

export class TokenRefreshService {
  private static refreshPromise: Promise<RefreshResponse> | null = null;
  private static readonly REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds

  static async refreshToken(): Promise<RefreshResponse> {
    try {
      // Prevent multiple refresh calls
      if (this.refreshPromise) {
        return this.refreshPromise;
      }

      this.refreshPromise = api.post('/api/auth/refresh').then(response => {
        const newToken = response.data.token;
        TokenService.setToken(newToken);
        return { token: newToken };
      });

      const result = await this.refreshPromise;
      this.refreshPromise = null;
      return result;
    } catch (error) {
      TokenService.clearToken();
      return { token: '', error: 'Failed to refresh token' };
    }
  }

  static shouldRefresh(): boolean {
    try {
      const token = TokenService.getToken();
      if (!token) return false;

      const decoded = TokenService.decodeToken(token);
      const expiresIn = decoded.exp - (Date.now() / 1000);
      
      return expiresIn < this.REFRESH_THRESHOLD;
    } catch {
      return false;
    }
  }

  static startRefreshInterval(): void {
    // Check every minute
    setInterval(() => {
      if (this.shouldRefresh()) {
        this.refreshToken();
      }
    }, 60 * 1000);
  }
} 