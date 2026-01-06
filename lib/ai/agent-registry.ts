/**
 * AI Agent Registry System
 *
 * This module provides a standardized way to register, configure, and execute
 * AI agents across the application. Every AI use must go through this registry
 * to ensure consistent behavior, proper specifications, and unified monitoring.
 */

import { getAIProvider, type AIMessage } from '@/lib/ai';
import { DEFAULT_AI_MODEL } from '@/lib/ai-models';
import { createClient } from '@/lib/supabase/server';

// Core Agent Specification Interface
export interface AgentSpecification {
  // Agent Identity
  id: string;
  name: string;
  description: string;
  version: string;

  // Purpose & Scope
  purpose: string;
  targetUsers: ('admin' | 'teacher' | 'student')[];
  useCases: string[];
  limitations: string[];

  // Behavior Configuration
  systemPrompt: string;
  temperature: number;
  maxTokens?: number;
  model?: string;

  // Context & Data Requirements
  requiredContext: string[];
  optionalContext: string[];
  dataAccess: {
    tables?: string[];
    permissions: ('read' | 'write')[];
  };

  // Validation & Safety
  inputValidation: {
    maxLength: number;
    allowedFields: string[];
    sensitiveDataHandling: 'block' | 'sanitize' | 'allow';
  };

  // Monitoring & Analytics
  enableLogging: boolean;
  enableAnalytics: boolean;
  successMetrics: string[];

  // UI Integration
  uiConfig: {
    category: 'content' | 'analysis' | 'automation' | 'communication';
    icon: string;
    placement: ('dashboard' | 'modal' | 'inline' | 'sidebar')[];
    loadingMessage?: string;
    errorMessage?: string;
  };
}

// Agent Execution Context
export interface AgentContext {
  // User Information
  userId: string;
  userRole: 'admin' | 'teacher' | 'student';

  // Request Context
  sessionId: string;
  requestId: string;
  timestamp: Date;

  // Application Context
  currentPage?: string;
  entityId?: string; // ID of current student, lesson, song, etc.
  entityType?: string;

  // Additional Context Data
  contextData: Record<string, any>;
}

// Agent Execution Request
export interface AgentRequest {
  agentId: string;
  input: Record<string, any>;
  context: AgentContext;
  overrides?: {
    model?: string;
    temperature?: number;
    systemPrompt?: string;
  };
}

// Agent Execution Response
export interface AgentResponse {
  success: boolean;
  result?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    agentId: string;
    executionTime: number;
    tokensUsed?: number;
    model: string;
    provider: string;
  };
  analytics: {
    requestId: string;
    timestamp: Date;
    inputHash: string;
    successful: boolean;
  };
}

// Agent Registry Class
class AIAgentRegistry {
  private agents: Map<string, AgentSpecification> = new Map();
  private executionLog: AgentResponse[] = [];

  /**
   * Register a new AI agent with its specification
   */
  register(spec: AgentSpecification): void {
    // Validate specification
    this.validateSpecification(spec);

    // Register agent
    this.agents.set(spec.id, spec);

    console.log(`[AgentRegistry] Registered agent: ${spec.id} (${spec.name})`);
  }

  /**
   * Execute an agent with proper validation and monitoring
   */
  async execute(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // Get agent specification
      const agent = this.agents.get(request.agentId);
      if (!agent) {
        throw new Error(`Agent not found: ${request.agentId}`);
      }

      // Validate request
      await this.validateRequest(request, agent);

      // Check permissions
      await this.checkPermissions(request, agent);

      // Prepare execution context
      const executionContext = await this.prepareContext(request, agent);

      // Execute agent
      const result = await this.executeAgent(request, agent, executionContext);

      // Create response
      const response: AgentResponse = {
        success: true,
        result,
        metadata: {
          agentId: request.agentId,
          executionTime: Date.now() - startTime,
          model: request.overrides?.model || agent.model || DEFAULT_AI_MODEL,
          provider: 'auto', // Will be determined by provider factory
        },
        analytics: {
          requestId,
          timestamp: new Date(),
          inputHash: this.hashInput(request.input),
          successful: true,
        },
      };

      // Log execution
      if (agent.enableLogging) {
        await this.logExecution(response, request, agent);
      }

      return response;
    } catch (error) {
      const response: AgentResponse = {
        success: false,
        error: {
          code: 'EXECUTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
        metadata: {
          agentId: request.agentId,
          executionTime: Date.now() - startTime,
          model: request.overrides?.model || DEFAULT_AI_MODEL,
          provider: 'auto',
        },
        analytics: {
          requestId,
          timestamp: new Date(),
          inputHash: this.hashInput(request.input),
          successful: false,
        },
      };

      // Log error
      console.error(`[AgentRegistry] Execution failed for ${request.agentId}:`, error);
      await this.logExecution(response, request);

      return response;
    }
  }

  /**
   * Get all registered agents
   */
  getAgents(): AgentSpecification[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents filtered by user role and context
   */
  getAvailableAgents(userRole: string, context?: string): AgentSpecification[] {
    return this.getAgents().filter((agent) => {
      // Check if user has permission
      if (!agent.targetUsers.includes(userRole as any)) {
        return false;
      }

      // Additional context-based filtering can be added here
      return true;
    });
  }

  /**
   * Get agent execution analytics
   */
  getAnalytics(agentId?: string): any {
    const logs = agentId
      ? this.executionLog.filter((log) => log.metadata.agentId === agentId)
      : this.executionLog;

    return {
      totalExecutions: logs.length,
      successRate: logs.filter((log) => log.success).length / logs.length,
      averageExecutionTime:
        logs.reduce((sum, log) => sum + log.metadata.executionTime, 0) / logs.length,
      recentExecutions: logs.slice(-10),
    };
  }

  // Private methods
  private validateSpecification(spec: AgentSpecification): void {
    const required = ['id', 'name', 'description', 'purpose', 'systemPrompt'];
    for (const field of required) {
      if (!spec[field as keyof AgentSpecification]) {
        throw new Error(`Agent specification missing required field: ${field}`);
      }
    }
  }

  private async validateRequest(request: AgentRequest, agent: AgentSpecification): Promise<void> {
    // Validate input fields
    for (const field of agent.inputValidation.allowedFields) {
      if (request.input[field] && typeof request.input[field] === 'string') {
        if (request.input[field].length > agent.inputValidation.maxLength) {
          throw new Error(`Input field '${field}' exceeds maximum length`);
        }
      }
    }

    // Check for sensitive data
    if (agent.inputValidation.sensitiveDataHandling === 'block') {
      // Add sensitive data detection logic here
    }
  }

  private async checkPermissions(request: AgentRequest, agent: AgentSpecification): Promise<void> {
    // Check if user role is allowed
    if (!agent.targetUsers.includes(request.context.userRole)) {
      throw new Error(`Insufficient permissions for agent: ${agent.id}`);
    }
  }

  private async prepareContext(
    request: AgentRequest,
    agent: AgentSpecification
  ): Promise<Record<string, any>> {
    const context: Record<string, any> = {};

    // Fetch required context data
    for (const contextKey of agent.requiredContext) {
      context[contextKey] = await this.fetchContextData(contextKey, request.context);
    }

    // Fetch optional context data
    for (const contextKey of agent.optionalContext) {
      try {
        context[contextKey] = await this.fetchContextData(contextKey, request.context);
      } catch (error) {
        // Optional context failures are non-blocking
        console.warn(`[AgentRegistry] Failed to fetch optional context: ${contextKey}`);
      }
    }

    return context;
  }

  private async fetchContextData(contextKey: string, context: AgentContext): Promise<any> {
    const supabase = await createClient();

    switch (contextKey) {
      case 'currentUser':
        const { data: user } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', context.userId)
          .single();
        return user;

      case 'currentStudent':
        if (context.entityType === 'student' && context.entityId) {
          const { data: student } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', context.entityId)
            .single();
          return student;
        }
        return null;

      case 'recentLessons':
        const { data: lessons } = await supabase
          .from('lessons')
          .select('*')
          .order('scheduled_at', { ascending: false })
          .limit(5);
        return lessons;

      // Add more context data fetchers as needed
      default:
        throw new Error(`Unknown context key: ${contextKey}`);
    }
  }

  private async executeAgent(
    request: AgentRequest,
    agent: AgentSpecification,
    executionContext: Record<string, any>
  ): Promise<any> {
    const provider = await getAIProvider();

    // Build system prompt with context
    const systemPrompt = this.buildSystemPrompt(agent, executionContext);

    // Build user message
    const userMessage = this.buildUserMessage(request.input, agent);

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    // Execute AI request
    const result = await provider.complete({
      model: request.overrides?.model || agent.model || DEFAULT_AI_MODEL,
      messages,
      temperature: request.overrides?.temperature || agent.temperature,
      max_tokens: agent.maxTokens,
    });

    return result;
  }

  private buildSystemPrompt(agent: AgentSpecification, context: Record<string, any>): string {
    let prompt = agent.systemPrompt;

    // Inject context variables
    for (const [key, value] of Object.entries(context)) {
      if (value) {
        prompt += `\n\n${key.toUpperCase()}: ${JSON.stringify(value)}`;
      }
    }

    return prompt;
  }

  private buildUserMessage(input: Record<string, any>, agent: AgentSpecification): string {
    // Build user message from input fields
    const messageParts: string[] = [];

    for (const field of agent.inputValidation.allowedFields) {
      if (input[field]) {
        messageParts.push(`${field}: ${input[field]}`);
      }
    }

    return messageParts.join('\n');
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashInput(input: Record<string, any>): string {
    return Buffer.from(JSON.stringify(input)).toString('base64').substr(0, 16);
  }

  private async logExecution(
    response: AgentResponse,
    request: AgentRequest,
    agent?: AgentSpecification
  ): Promise<void> {
    this.executionLog.push(response);

    // Keep only last 1000 executions in memory
    if (this.executionLog.length > 1000) {
      this.executionLog.shift();
    }

    // Optional: Store in database for persistence
    if (agent?.enableAnalytics) {
      try {
        const supabase = await createClient();
        await supabase.from('agent_execution_logs').insert({
          agent_id: response.metadata.agentId,
          request_id: response.analytics.requestId,
          user_id: request.context.userId,
          successful: response.success,
          execution_time: response.metadata.executionTime,
          input_hash: response.analytics.inputHash,
          error_code: response.error?.code,
          timestamp: response.analytics.timestamp,
        });
      } catch (error) {
        console.error('[AgentRegistry] Failed to log execution to database:', error);
      }
    }
  }
}

// Singleton instance
export const agentRegistry = new AIAgentRegistry();

// Helper function for easier agent execution
export async function executeAgent(
  agentId: string,
  input: Record<string, any>,
  context: Partial<AgentContext>,
  overrides?: AgentRequest['overrides']
): Promise<AgentResponse> {
  const fullContext: AgentContext = {
    userId: context.userId || '',
    userRole: context.userRole || 'admin',
    sessionId: context.sessionId || `session_${Date.now()}`,
    requestId: `req_${Date.now()}`,
    timestamp: new Date(),
    currentPage: context.currentPage,
    entityId: context.entityId,
    entityType: context.entityType,
    contextData: context.contextData || {},
  };

  return agentRegistry.execute({
    agentId,
    input,
    context: fullContext,
    overrides,
  });
}
