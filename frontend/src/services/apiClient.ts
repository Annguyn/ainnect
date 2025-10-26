import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { ApiErrorResponse } from '../types';
import { debugLogger } from '../utils/debugLogger';

const BASE_URL = 'http://localhost:8080';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.setupInterceptors();
    this.loadTokensFromStorage();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        debugLogger.logApiCall(
          config.method?.toUpperCase() || 'UNKNOWN',
          config.url || 'UNKNOWN',
          config.data
        );
        return config;
      },
      (error) => {
        debugLogger.logApiCall(
          error.config?.method?.toUpperCase() || 'UNKNOWN',
          error.config?.url || 'UNKNOWN',
          error.config?.data
        );
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        debugLogger.logApiResponse(
          response.config.method?.toUpperCase() || 'UNKNOWN',
          response.config.url || 'UNKNOWN',
          response.data
        );
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && this.refreshToken && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await this.refreshAccessToken();
            this.setTokens(response.accessToken, response.refreshToken);
            
            originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/auth';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiErrorResponse {
    const errorResponse = error.response?.data as ApiErrorResponse || {
      timestamp: new Date().toISOString(),
      status: error.response?.status || 500,
      error: 'Network Error',
      message: error.message || 'An unexpected error occurred',
      details: null,
    };

    debugLogger.logApiResponse(
      error.config?.method?.toUpperCase() || 'UNKNOWN',
      error.config?.url || 'UNKNOWN',
      undefined,
      errorResponse
    );

    return errorResponse;
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  private saveTokensToStorage() {
    if (this.accessToken) {
      localStorage.setItem('accessToken', this.accessToken);
    }
    if (this.refreshToken) {
      localStorage.setItem('refreshToken', this.refreshToken);
    }
  }

  private clearTokensFromStorage() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.saveTokensToStorage();
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.clearTokensFromStorage();
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${BASE_URL}/api/auth/refresh?refreshToken=${this.refreshToken}`
    );
    
    return response.data;
  }

  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
