import { dbRouter, ApiResponse } from './database-router';
import type { Database } from '@/types/database.types';

// Type helpers for database tables
type Tables = Database['public']['Tables'];
type TableName = keyof Tables;
type TableRow<T extends TableName> = Tables[T]['Row'];
type TableInsert<T extends TableName> = Tables[T]['Insert'];
type TableUpdate<T extends TableName> = Tables[T]['Update'];

export interface QueryOptions {
  select?: string;
  filter?: Record<string, any>;
  order?: string;
  limit?: number;
  offset?: number;
}

export interface FilterCondition {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is' | 'not';
  value: any;
}

/**
 * Unified Database API Client
 *
 * Provides a consistent interface for database operations that automatically
 * routes to local or remote Supabase based on environment configuration.
 */
export class UnifiedDatabaseAPI {
  /**
   * Generic method to query any table
   */
  async query<T extends TableName>(
    table: T,
    options: QueryOptions = {}
  ): Promise<ApiResponse<TableRow<T>[]>> {
    const { select = '*', filter = {}, order, limit, offset } = options;

    // Build query parameters
    const params: Record<string, string> = {
      select,
    };

    // Add filters
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = `eq.${value}`;
      }
    });

    // Add ordering
    if (order) {
      params.order = order;
    }

    // Add pagination
    if (limit) {
      params.limit = limit.toString();
    }
    if (offset) {
      params.offset = offset.toString();
    }

    return dbRouter.get<TableRow<T>[]>(`/${table}`, params);
  }

  /**
   * Insert a new record
   */
  async insert<T extends TableName>(
    table: T,
    data: TableInsert<T>
  ): Promise<ApiResponse<TableRow<T>>> {
    return dbRouter.post<TableRow<T>>(`/${table}`, data);
  }

  /**
   * Update records with filter
   */
  async update<T extends TableName>(
    table: T,
    data: TableUpdate<T>,
    filter: Record<string, any>
  ): Promise<ApiResponse<TableRow<T>[]>> {
    // Build filter parameters
    const params: Record<string, string> = {};
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = `eq.${value}`;
      }
    });

    return dbRouter.patch<TableRow<T>[]>(`/${table}`, data, {
      ...Object.fromEntries(Object.entries(params).map(([key, value]) => [`${key}`, value])),
    });
  }

  /**
   * Delete records with filter
   */
  async delete<T extends TableName>(
    table: T,
    filter: Record<string, any>
  ): Promise<ApiResponse<void>> {
    // Build filter parameters
    const params: Record<string, string> = {};
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = `eq.${value}`;
      }
    });

    return dbRouter.delete<void>(`/${table}`, params);
  }

  /**
   * Find a single record by ID
   */
  async findById<T extends TableName>(
    table: T,
    id: string
  ): Promise<ApiResponse<TableRow<T> | null>> {
    const result = await this.query(table, {
      filter: { id },
      limit: 1,
    });

    return {
      ...result,
      data: result.data && result.data.length > 0 ? result.data[0] : null,
    };
  }

  /**
   * Count records in a table with optional filter
   */
  async count<T extends TableName>(
    table: T,
    filter: Record<string, any> = {}
  ): Promise<ApiResponse<number>> {
    const params: Record<string, string> = {
      select: 'count',
    };

    // Add filters
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = `eq.${value}`;
      }
    });

    const response = await dbRouter.get<any>(`/${table}`, params);

    return {
      ...response,
      data: response.data ? parseInt(response.data[0]?.count || '0', 10) : 0,
    };
  }

  /**
   * Execute RPC (Remote Procedure Call) function
   */
  async rpc<TResult = any>(
    functionName: string,
    args: Record<string, any> = {}
  ): Promise<ApiResponse<TResult>> {
    return dbRouter.post<TResult>(`/rpc/${functionName}`, args);
  }

  /**
   * Raw SQL query execution (use with caution)
   */
  async raw<TResult = any>(query: string, params: any[] = []): Promise<ApiResponse<TResult>> {
    return dbRouter.post<TResult>('/rpc/sql', {
      query,
      params,
    });
  }

  /**
   * Get current database connection info
   */
  getDatabaseInfo() {
    return dbRouter.getEndpointInfo();
  }

  /**
   * Refresh database connection (useful after environment changes)
   */
  refreshConnection() {
    dbRouter.refreshEndpoint();
  }
}

// Export singleton instance
export const unifiedDB = new UnifiedDatabaseAPI();

// Export convenience functions for common operations
export const db = {
  // Tables
  songs: {
    findAll: (options?: QueryOptions) => unifiedDB.query('songs', options),
    findById: (id: string) => unifiedDB.findById('songs', id),
    create: (data: TableInsert<'songs'>) => unifiedDB.insert('songs', data),
    update: (id: string, data: TableUpdate<'songs'>) => unifiedDB.update('songs', data, { id }),
    delete: (id: string) => unifiedDB.delete('songs', { id }),
    count: (filter?: Record<string, any>) => unifiedDB.count('songs', filter),
  },

  lessons: {
    findAll: (options?: QueryOptions) => unifiedDB.query('lessons', options),
    findById: (id: string) => unifiedDB.findById('lessons', id),
    create: (data: TableInsert<'lessons'>) => unifiedDB.insert('lessons', data),
    update: (id: string, data: TableUpdate<'lessons'>) => unifiedDB.update('lessons', data, { id }),
    delete: (id: string) => unifiedDB.delete('lessons', { id }),
    count: (filter?: Record<string, any>) => unifiedDB.count('lessons', filter),
  },

  profiles: {
    findAll: (options?: QueryOptions) => unifiedDB.query('profiles', options),
    findById: (id: string) => unifiedDB.findById('profiles', id),
    create: (data: TableInsert<'profiles'>) => unifiedDB.insert('profiles', data),
    update: (id: string, data: TableUpdate<'profiles'>) =>
      unifiedDB.update('profiles', data, { id }),
    delete: (id: string) => unifiedDB.delete('profiles', { id }),
    count: (filter?: Record<string, any>) => unifiedDB.count('profiles', filter),
  },

  assignments: {
    findAll: (options?: QueryOptions) => unifiedDB.query('assignments', options),
    findById: (id: string) => unifiedDB.findById('assignments', id),
    create: (data: TableInsert<'assignments'>) => unifiedDB.insert('assignments', data),
    update: (id: string, data: TableUpdate<'assignments'>) =>
      unifiedDB.update('assignments', data, { id }),
    delete: (id: string) => unifiedDB.delete('assignments', { id }),
    count: (filter?: Record<string, any>) => unifiedDB.count('assignments', filter),
  },

  // RPC functions
  rpc: {
    isAdmin: () => unifiedDB.rpc<boolean>('is_admin'),
    isTeacher: () => unifiedDB.rpc<boolean>('is_teacher'),
    isStudent: () => unifiedDB.rpc<boolean>('is_student'),
    hasRole: (role: string) => unifiedDB.rpc<boolean>('has_role', { _role: role }),
    softDeleteSong: (songId: string, userId: string) =>
      unifiedDB.rpc('soft_delete_song_with_cascade', { song_uuid: songId, user_uuid: userId }),
    hasActiveLessonAssignments: (songId: string) =>
      unifiedDB.rpc<boolean>('has_active_lesson_assignments', { song_uuid: songId }),
  },
};
