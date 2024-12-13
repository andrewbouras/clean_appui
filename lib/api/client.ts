import axios, { AxiosError, AxiosInstance } from 'axios';
import { TokenService } from '../auth/token';
import { TokenRefreshService } from '../auth/refresh';

class APIClient {
  private static instance: AxiosInstance;

  static getInstance(): AxiosInstance {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Request interceptor
      this.instance.interceptors.request.use(
        async (config) => {
          // Check if token needs refresh before making request
          if (TokenRefreshService.shouldRefresh()) {
            await TokenRefreshService.refreshToken();
          }

          const token = TokenService.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Response interceptor
      this.instance.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
          if (error.response?.status === 401) {
            // Token expired or invalid
            TokenService.clearToken();
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      );
    }

    return this.instance;
  }
}

export const api = APIClient.getInstance(); 