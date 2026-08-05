/**
 * AxioVital API Client
 * Centralized HTTP client with JWT handling, error formatting, and token refresh.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_PREFIX = '/api/v1';

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('axiovital_access_token');
      this.refreshToken = localStorage.getItem('axiovital_refresh_token');
    }
  }

  public setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('axiovital_access_token', accessToken);
      localStorage.setItem('axiovital_refresh_token', refreshToken);
    }
  }

  public clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('axiovital_access_token');
      localStorage.removeItem('axiovital_refresh_token');
      localStorage.removeItem('axiovital_user_session');
    }
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.map((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE_URL}${API_PREFIX}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
        return this.handleUnauthorizedAndRetry<T>(endpoint, options);
      }

      const resData = await response.json().catch(() => null);

      if (!response.ok) {
        const error: ApiError = {
          statusCode: response.status,
          message: resData?.message || resData?.error?.message || response.statusText || 'An unexpected error occurred',
          error: resData?.error || response.statusText,
        };
        throw error;
      }

      return resData;
    } catch (err: any) {
      if (err.statusCode) throw err;
      throw {
        statusCode: 500,
        message: err.message || 'Network or server error',
      } as ApiError;
    }
  }

  private async handleUnauthorizedAndRetry<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_BASE_URL}${API_PREFIX}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });

        if (!refreshRes.ok) {
          this.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
          throw new Error('Session expired');
        }

        const data = await refreshRes.json();
        this.setTokens(data.accessToken, data.refreshToken);
        this.isRefreshing = false;
        this.onRefreshed(data.accessToken);
      } catch (err) {
        this.isRefreshing = false;
        this.clearTokens();
        throw err;
      }
    }

    return new Promise((resolve) => {
      this.addRefreshSubscriber((token: string) => {
        const headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
        resolve(this.request<T>(endpoint, { ...options, headers }));
      });
    });
  }

  public get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
