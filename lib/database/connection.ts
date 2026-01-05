/**
 * Database Connection Layer
 *
 * Centralized module for managing database connections and routing HTTP requests
 * to either local or remote Supabase instances based on configuration and user preference.
 *
 * This layer provides:
 * - Environment detection (local vs remote)
 * - User preference management via cookies
 * - Unified API for checking connection status
 * - Type-safe configuration access
 */

// ============================================
// TYPES
// ============================================

export type DatabaseType = 'local' | 'remote';

export interface DatabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  type: DatabaseType;
  isLocal: boolean;
}

export interface ConnectionStatus {
  isConnected: boolean;
  database: DatabaseType;
  url: string;
  latency?: number;
  error?: string;
}

export interface DatabasePreference {
  preferred: DatabaseType;
  actual: DatabaseType;
  canSwitchToLocal: boolean;
  canSwitchToRemote: boolean;
}

// ============================================
// CONFIGURATION
// ============================================

/**
 * Get the current database configuration based on environment and preferences
 */
export function getDatabaseConfig(options: { forceRemote?: boolean } = {}): DatabaseConfig {
  // Local configuration
  const localUrl = process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL;
  const localAnonKey = process.env.NEXT_PUBLIC_SUPABASE_LOCAL_ANON_KEY;
  const localServiceRoleKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;

  // Remote configuration
  const remoteUrl =
    process.env.NEXT_PUBLIC_SUPABASE_REMOTE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const remoteAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_REMOTE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const remoteServiceRoleKey =
    process.env.SUPABASE_REMOTE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Check user preference (from cookie in browser)
  let userPrefersRemote = options.forceRemote || false;
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )sb-provider-preference=([^;]+)'));
    if (match && match[2] === 'remote') {
      userPrefersRemote = true;
    }
  }

  // Prioritize local if available and not forced to remote
  if (!userPrefersRemote && localUrl && localAnonKey) {
    return {
      url: localUrl,
      anonKey: localAnonKey,
      serviceRoleKey: localServiceRoleKey,
      type: 'local',
      isLocal: true,
    };
  }

  // Use remote
  if (remoteUrl && remoteAnonKey) {
    return {
      url: remoteUrl,
      anonKey: remoteAnonKey,
      serviceRoleKey: remoteServiceRoleKey,
      type: 'remote',
      isLocal: false,
    };
  }

  throw new Error('No valid Supabase configuration found. Check your .env file.');
}

/**
 * Check if local database configuration is available
 */
export function hasLocalConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL && process.env.NEXT_PUBLIC_SUPABASE_LOCAL_ANON_KEY
  );
}

/**
 * Check if remote database configuration is available
 */
export function hasRemoteConfig(): boolean {
  return !!(
    (process.env.NEXT_PUBLIC_SUPABASE_REMOTE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    (process.env.NEXT_PUBLIC_SUPABASE_REMOTE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

/**
 * Get the current database preference status
 */
export function getDatabasePreference(): DatabasePreference {
  const config = getDatabaseConfig();

  // Check user preference
  let preferred: DatabaseType = 'local';
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )sb-provider-preference=([^;]+)'));
    if (match && match[2] === 'remote') {
      preferred = 'remote';
    }
  }

  return {
    preferred,
    actual: config.type,
    canSwitchToLocal: hasLocalConfig(),
    canSwitchToRemote: hasRemoteConfig(),
  };
}

// ============================================
// LOGGING UTILITIES
// ============================================

const LOG_PREFIX = {
  local: '🏠 [LOCAL-DB]',
  remote: '☁️  [REMOTE-DB]',
};

/**
 * Get the appropriate log prefix for the current database
 */
export function getLogPrefix(type?: DatabaseType): string {
  const dbType = type || getDatabaseConfig().type;
  return LOG_PREFIX[dbType];
}

/**
 * Log a database operation with the appropriate prefix
 */
export function logDbOperation(
  operation: string,
  details?: Record<string, unknown>,
  type?: DatabaseType
): void {
  const prefix = getLogPrefix(type);
  if (details) {
    console.log(`${prefix} ${operation}`, details);
  } else {
    console.log(`${prefix} ${operation}`);
  }
}

// ============================================
// HEADERS FOR HTTP REQUESTS
// ============================================

/**
 * Get the standard headers for Supabase REST API requests
 */
export function getSupabaseHeaders(config?: DatabaseConfig): Record<string, string> {
  const dbConfig = config || getDatabaseConfig();

  return {
    apikey: dbConfig.anonKey,
    Authorization: `Bearer ${dbConfig.anonKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    'X-Database-Type': dbConfig.type, // Custom header to track which DB is being used
  };
}

/**
 * Get headers for admin/service role operations
 */
export function getAdminHeaders(config?: DatabaseConfig): Record<string, string> {
  const dbConfig = config || getDatabaseConfig();

  if (!dbConfig.serviceRoleKey) {
    throw new Error('Service role key not available for admin operations');
  }

  return {
    apikey: dbConfig.serviceRoleKey,
    Authorization: `Bearer ${dbConfig.serviceRoleKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    'X-Database-Type': dbConfig.type,
  };
}

// ============================================
// REST API URL BUILDER
// ============================================

/**
 * Build the REST API URL for a given table/path
 */
export function buildRestUrl(path: string, config?: DatabaseConfig): string {
  const dbConfig = config || getDatabaseConfig();
  const baseUrl = `${dbConfig.url}/rest/v1`;

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

/**
 * Build the Auth API URL
 */
export function buildAuthUrl(path: string, config?: DatabaseConfig): string {
  const dbConfig = config || getDatabaseConfig();
  const baseUrl = `${dbConfig.url}/auth/v1`;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

/**
 * Build the Storage API URL
 */
export function buildStorageUrl(path: string, config?: DatabaseConfig): string {
  const dbConfig = config || getDatabaseConfig();
  const baseUrl = `${dbConfig.url}/storage/v1`;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

// ============================================
// CONNECTION TESTING
// ============================================

/**
 * Test the connection to the current database
 */
export async function testConnection(config?: DatabaseConfig): Promise<ConnectionStatus> {
  const dbConfig = config || getDatabaseConfig();
  const startTime = Date.now();

  try {
    const url = buildRestUrl('/profiles?select=count&limit=1', dbConfig);
    const headers = getSupabaseHeaders(dbConfig);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const latency = Date.now() - startTime;

    if (response.ok) {
      return {
        isConnected: true,
        database: dbConfig.type,
        url: dbConfig.url,
        latency,
      };
    }

    // Check for RLS errors (which mean we're connected but don't have permission)
    if (response.status === 401 || response.status === 403) {
      return {
        isConnected: true,
        database: dbConfig.type,
        url: dbConfig.url,
        latency,
        error: 'Connected but requires authentication',
      };
    }

    return {
      isConnected: false,
      database: dbConfig.type,
      url: dbConfig.url,
      latency,
      error: `HTTP ${response.status}: ${response.statusText}`,
    };
  } catch (error) {
    return {
      isConnected: false,
      database: dbConfig.type,
      url: dbConfig.url,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// EXPORTS
// ============================================

export const DatabaseConnection = {
  getConfig: getDatabaseConfig,
  hasLocal: hasLocalConfig,
  hasRemote: hasRemoteConfig,
  getPreference: getDatabasePreference,
  getHeaders: getSupabaseHeaders,
  getAdminHeaders,
  buildRestUrl,
  buildAuthUrl,
  buildStorageUrl,
  testConnection,
  log: logDbOperation,
  getLogPrefix,
};
