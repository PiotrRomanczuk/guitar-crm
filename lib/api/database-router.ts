import { getSupabaseConfig } from '../supabase/config';

export interface DatabaseEndpoint {
  baseUrl: string;
  headers: Record<string, string>;
  isLocal: boolean;
}

export interface HttpRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  error: Error | null;
  status: number;
  isLocal: boolean;
}

/**
 * Database Router Service
 *
 * Automatically routes HTTP requests to either local or remote Supabase
 * based on the current environment configuration.
 */
export class DatabaseRouter {
  private endpoint: DatabaseEndpoint | null = null;

  private getOrInitEndpoint(): DatabaseEndpoint {
    if (!this.endpoint) {
      this.endpoint = this.getActiveEndpoint();
    }
    return this.endpoint;
  }

  /**
   * Get the active database endpoint based on environment
   */
  private getActiveEndpoint(): DatabaseEndpoint {
    try {
      const config = getSupabaseConfig();

      // Base headers for Supabase REST API
      const headers = {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      };

      if (config.isLocal) {
        console.log('🔄 [DatabaseRouter] Using LOCAL database endpoint');
        return {
          baseUrl: `${config.url}/rest/v1`,
          headers,
          isLocal: true,
        };
      } else {
        console.log('🌐 [DatabaseRouter] Using REMOTE database endpoint');
        return {
          baseUrl: `${config.url}/rest/v1`,
          headers,
          isLocal: false,
        };
      }
    } catch (error) {
      console.error('❌ [DatabaseRouter] Failed to determine endpoint:', error);
      throw new Error('Database configuration not available');
    }
  }

  /**
   * Execute HTTP request to the appropriate database endpoint
   */
  async executeRequest<T = unknown>(options: HttpRequestOptions): Promise<ApiResponse<T>> {
    const { method, path, body, headers = {}, params = {} } = options;

    const endpoint = this.getOrInitEndpoint();

    // Build URL with query parameters
    const url = new URL(`${endpoint.baseUrl}${path}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    // Merge headers
    const requestHeaders = {
      ...endpoint.headers,
      ...headers,
    };

    const logPrefix = endpoint.isLocal ? '🏠 [LOCAL-API]' : '☁️  [REMOTE-API]';
    console.log(`${logPrefix} ${method} ${path}`, { params, hasBody: !!body });

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      const result: ApiResponse<T> = {
        data,
        error: response.ok ? null : new Error(`HTTP ${response.status}: ${response.statusText}`),
        status: response.status,
        isLocal: endpoint.isLocal,
      };

      if (!response.ok) {
        console.error(`${logPrefix} Request failed:`, result.error);
      } else {
        console.log(`${logPrefix} Request successful:`, {
          status: response.status,
          dataType: typeof data,
        });
      }

      return result;
    } catch (error) {
      console.error(`${logPrefix} Network error:`, error);
      return {
        data: null as T,
        error: error as Error,
        status: 0,
        isLocal: endpoint.isLocal,
      };
    }
  }

  /**
   * Convenience method for GET requests
   */
  async get<T = unknown>(path: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.executeRequest<T>({ method: 'GET', path, params });
  }

  /**
   * Convenience method for POST requests
   */
  async post<T = unknown>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>({ method: 'POST', path, body, headers });
  }

  /**
   * Convenience method for PUT requests
   */
  async put<T = unknown>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>({ method: 'PUT', path, body, headers });
  }

  /**
   * Convenience method for PATCH requests
   */
  async patch<T = unknown>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>({ method: 'PATCH', path, body, headers });
  }

  /**
   * Convenience method for DELETE requests
   */
  async delete<T = unknown>(path: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.executeRequest<T>({ method: 'DELETE', path, params });
  }

  /**
   * Get information about the current endpoint
   */
  getEndpointInfo(): { baseUrl: string; isLocal: boolean } {
    const endpoint = this.getOrInitEndpoint();
    return {
      baseUrl: endpoint.baseUrl,
      isLocal: endpoint.isLocal,
    };
  }

  /**
   * Refresh the endpoint configuration (useful after environment changes)
   */
  refreshEndpoint(): void {
    this.endpoint = this.getActiveEndpoint();
  }
}

// Export singleton instance
export const dbRouter = new DatabaseRouter();
