/**
 * Centralized API client for consistent fetch operations with error handling
 * Used throughout the application for all data-fetching needs
 */

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(
      `${this.baseUrl}${endpoint}`,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = new Error(`API Error: ${response.status} ${response.statusText}`) as Error & {
        status?: number;
      };
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return null as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text() as T;
  }

  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const response = await fetch(url, {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const response = await fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const response = await fetch(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const response = await fetch(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const response = await fetch(url, {
      ...options,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
