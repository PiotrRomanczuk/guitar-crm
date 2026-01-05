/**
 * Database Status API Endpoint
 *
 * Provides backend status information about the current database connection.
 * This API can be used by both frontend and external services to check
 * which database the application is currently connected to.
 *
 * GET /api/database/status - Returns current database status
 * POST /api/database/status - Tests connection and returns detailed status
 */

import { NextRequest, NextResponse } from 'next/server';
import { DatabaseMiddleware } from '@/lib/database/middleware';
import { testConnection } from '@/lib/database/connection';

interface DatabaseStatusResponse {
  success: boolean;
  database: {
    type: 'local' | 'remote';
    url: string;
    isLocal: boolean;
    source: 'cookie' | 'header' | 'default';
  };
  availability: {
    localAvailable: boolean;
    remoteAvailable: boolean;
  };
  connection?: {
    isConnected: boolean;
    latency?: number;
    error?: string;
  };
  timestamp: string;
}

/**
 * GET - Returns current database configuration and routing info
 */
export async function GET(request: NextRequest): Promise<NextResponse<DatabaseStatusResponse>> {
  try {
    const dbInfo = DatabaseMiddleware.detectPreference(request);
    const localConfig = DatabaseMiddleware.getLocalConfig();
    const remoteConfig = DatabaseMiddleware.getRemoteConfig();

    const response: DatabaseStatusResponse = {
      success: true,
      database: {
        type: dbInfo.actualType,
        url: dbInfo.url,
        isLocal: dbInfo.actualType === 'local',
        source: dbInfo.source,
      },
      availability: {
        localAvailable: localConfig.isAvailable,
        remoteAvailable: remoteConfig.isAvailable,
      },
      timestamp: new Date().toISOString(),
    };

    const nextResponse = NextResponse.json(response);

    // Add database indicator headers
    DatabaseMiddleware.addHeaders(nextResponse, dbInfo);

    return nextResponse;
  } catch {
    return NextResponse.json(
      {
        success: false,
        database: {
          type: 'local' as const,
          url: '',
          isLocal: true,
          source: 'default' as const,
        },
        availability: {
          localAvailable: false,
          remoteAvailable: false,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Tests actual database connection and returns detailed status
 */
export async function POST(request: NextRequest): Promise<NextResponse<DatabaseStatusResponse>> {
  try {
    const dbInfo = DatabaseMiddleware.detectPreference(request);
    const localConfig = DatabaseMiddleware.getLocalConfig();
    const remoteConfig = DatabaseMiddleware.getRemoteConfig();

    // Test the actual connection
    const connectionResult = await testConnection();

    DatabaseMiddleware.log(dbInfo.actualType, 'Connection test', {
      isConnected: connectionResult.isConnected,
      latency: connectionResult.latency,
      error: connectionResult.error,
    });

    const response: DatabaseStatusResponse = {
      success: connectionResult.isConnected,
      database: {
        type: dbInfo.actualType,
        url: dbInfo.url,
        isLocal: dbInfo.actualType === 'local',
        source: dbInfo.source,
      },
      availability: {
        localAvailable: localConfig.isAvailable,
        remoteAvailable: remoteConfig.isAvailable,
      },
      connection: {
        isConnected: connectionResult.isConnected,
        latency: connectionResult.latency,
        error: connectionResult.error,
      },
      timestamp: new Date().toISOString(),
    };

    const nextResponse = NextResponse.json(response, {
      status: connectionResult.isConnected ? 200 : 503,
    });

    // Add database indicator headers
    DatabaseMiddleware.addHeaders(nextResponse, dbInfo);

    return nextResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        database: {
          type: 'local' as const,
          url: '',
          isLocal: true,
          source: 'default' as const,
        },
        availability: {
          localAvailable: false,
          remoteAvailable: false,
        },
        connection: {
          isConnected: false,
          error: errorMessage,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
