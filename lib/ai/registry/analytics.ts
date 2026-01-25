/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Agent Analytics and Logging
 *
 * Analytics collection and logging for agent executions
 */

import { createClient } from '@/lib/supabase/server';
import type { AgentSpecification, AgentRequest, AgentResponse } from './types';

/**
 * Agent Analytics Data
 */
interface AgentAnalytics {
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  recentExecutions: AgentResponse[];
  errorDistribution: Record<string, number>;
}

/**
 * In-memory execution log (for development and immediate analytics)
 */
let executionLog: AgentResponse[] = [];

/**
 * Add execution to log
 */
export function addToExecutionLog(response: AgentResponse): void {
  executionLog.push(response);

  // Keep only last 1000 executions in memory
  if (executionLog.length > 1000) {
    executionLog.shift();
  }
}

/**
 * Get analytics for agent(s)
 */
export function getAnalytics(agentId?: string): AgentAnalytics {
  const logs = agentId
    ? executionLog.filter((log) => log.metadata.agentId === agentId)
    : executionLog;

  if (logs.length === 0) {
    return {
      totalExecutions: 0,
      successRate: 0,
      averageExecutionTime: 0,
      recentExecutions: [],
      errorDistribution: {},
    };
  }

  const successfulLogs = logs.filter((log) => log.success);
  const errorDistribution: Record<string, number> = {};

  // Calculate error distribution
  logs
    .filter((log) => !log.success && log.error)
    .forEach((log) => {
      const errorCode = log.error!.code;
      errorDistribution[errorCode] = (errorDistribution[errorCode] || 0) + 1;
    });

  return {
    totalExecutions: logs.length,
    successRate: successfulLogs.length / logs.length,
    averageExecutionTime:
      logs.reduce((sum, log) => sum + log.metadata.executionTime, 0) / logs.length,
    recentExecutions: logs.slice(-10),
    errorDistribution,
  };
}

/**
 * Log execution to database for persistence
 */
export async function logExecution(
  response: AgentResponse,
  request: AgentRequest,
  agent?: AgentSpecification
): Promise<void> {
  // Add to in-memory log
  addToExecutionLog(response);

  // Log to database if analytics are enabled
  if (agent?.enableAnalytics) {
    try {
      const supabase = await createClient();
      await supabase.from('agent_execution_logs').insert({
        agent_id: response.metadata.agentId,
        request_id: response.analytics.requestId,
        user_id: request.context.userId,
        user_role: request.context.userRole,
        successful: response.success,
        execution_time: response.metadata.executionTime,
        input_hash: response.analytics.inputHash,
        error_code: response.error?.code,
        model_used: response.metadata.model,
        provider_used: response.metadata.provider,
        tokens_used: response.metadata.tokensUsed,
        timestamp: response.analytics.timestamp,
        session_id: request.context.sessionId,
        entity_type: request.context.entityType,
        entity_id: request.context.entityId,
      });
    } catch (error) {
      console.error('[AgentAnalytics] Failed to log execution to database:', error);
    }
  }
}

/**
 * Get analytics from database
 */
export async function getDatabaseAnalytics(
  agentId?: string,
  limit: number = 100
): Promise<{
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  recentActivity: any[];
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('agent_execution_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data: logs, error } = await query.limit(limit);

    if (error) {
      throw error;
    }

    if (!logs || logs.length === 0) {
      return {
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0,
        recentActivity: [],
      };
    }

    const successfulLogs = logs.filter((log) => log.successful);

    return {
      totalExecutions: logs.length,
      successRate: successfulLogs.length / logs.length,
      averageExecutionTime:
        logs.reduce((sum, log) => sum + (log.execution_time || 0), 0) / logs.length,
      recentActivity: logs.slice(0, 10),
    };
  } catch (error) {
    console.error('[AgentAnalytics] Failed to fetch database analytics:', error);
    return {
      totalExecutions: 0,
      successRate: 0,
      averageExecutionTime: 0,
      recentActivity: [],
    };
  }
}

/**
 * Get agent performance metrics
 */
export async function getPerformanceMetrics(
  agentId?: string,
  timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'
): Promise<{
  executionCount: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  topErrors: Array<{ code: string; count: number }>;
}> {
  try {
    const supabase = await createClient();

    // Calculate time range
    const now = new Date();
    const timeMap = {
      hour: new Date(now.getTime() - 60 * 60 * 1000),
      day: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };

    let query = supabase
      .from('agent_execution_logs')
      .select('*')
      .gte('timestamp', timeMap[timeRange].toISOString());

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data: logs, error } = await query;

    if (error) {
      throw error;
    }

    if (!logs || logs.length === 0) {
      return {
        executionCount: 0,
        successRate: 0,
        averageResponseTime: 0,
        errorRate: 0,
        topErrors: [],
      };
    }

    const successfulLogs = logs.filter((log) => log.successful);
    const errorLogs = logs.filter((log) => !log.successful);

    // Count errors by code
    const errorCounts: Record<string, number> = {};
    errorLogs.forEach((log) => {
      if (log.error_code) {
        errorCounts[log.error_code] = (errorCounts[log.error_code] || 0) + 1;
      }
    });

    const topErrors = Object.entries(errorCounts)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      executionCount: logs.length,
      successRate: logs.length > 0 ? successfulLogs.length / logs.length : 0,
      averageResponseTime:
        logs.length > 0
          ? logs.reduce((sum, log) => sum + (log.execution_time || 0), 0) / logs.length
          : 0,
      errorRate: logs.length > 0 ? errorLogs.length / logs.length : 0,
      topErrors,
    };
  } catch (error) {
    console.error('[AgentAnalytics] Failed to fetch performance metrics:', error);
    return {
      executionCount: 0,
      successRate: 0,
      averageResponseTime: 0,
      errorRate: 0,
      topErrors: [],
    };
  }
}

/**
 * Clear in-memory execution log
 */
export function clearExecutionLog(): void {
  executionLog = [];
}
