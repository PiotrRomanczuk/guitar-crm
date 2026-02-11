/**
 * Response Utils Tests [BMS-115]
 *
 * Tests for agent response handling, error formatting, and metadata extraction.
 */

import {
  isAgentSuccess,
  extractAgentResult,
  formatAgentError,
  extractAgentMetadata,
  createErrorResponse,
} from '../response-utils';

// Mock the agent-registry import
jest.mock('../../agent-registry', () => ({}));

const makeSuccessResponse = (result: unknown = { content: 'test' }) => ({
  success: true as const,
  result,
  metadata: {
    agentId: 'test-agent',
    executionTime: 150,
    model: 'llama3.2',
    provider: 'Ollama',
    tokensUsed: 100,
  },
  analytics: {
    requestId: 'req_123',
    timestamp: new Date(),
    inputHash: 'abc123',
    successful: true,
  },
});

const makeErrorResponse = (code = 'EXECUTION_FAILED', message = 'Test error') => ({
  success: false as const,
  error: { code, message },
  metadata: {
    agentId: 'test-agent',
    executionTime: 50,
    model: 'unknown',
    provider: 'auto',
  },
  analytics: {
    requestId: 'req_456',
    timestamp: new Date(),
    inputHash: 'def456',
    successful: false,
  },
});

describe('isAgentSuccess', () => {
  it('should return true for successful responses', () => {
    expect(isAgentSuccess(makeSuccessResponse())).toBe(true);
  });

  it('should return false for error responses', () => {
    expect(isAgentSuccess(makeErrorResponse())).toBe(false);
  });
});

describe('extractAgentResult', () => {
  it('should return the result from a successful response', () => {
    const result = extractAgentResult(makeSuccessResponse({ content: 'hello' }));
    expect(result).toEqual({ content: 'hello' });
  });

  it('should throw for a failed response', () => {
    expect(() => extractAgentResult(makeErrorResponse())).toThrow('Test error');
  });

  it('should throw with default message when error has no message', () => {
    const response = { ...makeErrorResponse(), error: { code: 'UNKNOWN', message: '' } };
    expect(() => extractAgentResult(response)).toThrow('Agent execution failed');
  });
});

describe('formatAgentError', () => {
  it('should return empty string for successful response', () => {
    expect(formatAgentError(makeSuccessResponse())).toBe('');
  });

  it('should return user-friendly message for EXECUTION_FAILED', () => {
    const msg = formatAgentError(makeErrorResponse('EXECUTION_FAILED'));
    expect(msg).toContain('unavailable');
  });

  it('should return user-friendly message for VALIDATION_ERROR', () => {
    const msg = formatAgentError(makeErrorResponse('VALIDATION_ERROR'));
    expect(msg).toContain('Invalid input');
  });

  it('should return user-friendly message for PERMISSION_DENIED', () => {
    const msg = formatAgentError(makeErrorResponse('PERMISSION_DENIED'));
    expect(msg).toContain('permission');
  });

  it('should return user-friendly message for RATE_LIMITED', () => {
    const msg = formatAgentError(makeErrorResponse('RATE_LIMITED'));
    expect(msg).toContain('Too many requests');
  });

  it('should return user-friendly message for AGENT_NOT_FOUND', () => {
    const msg = formatAgentError(makeErrorResponse('AGENT_NOT_FOUND'));
    expect(msg).toContain('not available');
  });

  it('should return user-friendly message for CONTEXT_ERROR', () => {
    const msg = formatAgentError(makeErrorResponse('CONTEXT_ERROR'));
    expect(msg).toContain('context');
  });

  it('should return error message for unknown error codes', () => {
    const msg = formatAgentError(makeErrorResponse('CUSTOM_CODE', 'Custom message'));
    expect(msg).toBe('Custom message');
  });

  it('should return generic message when no error object', () => {
    const response = { ...makeErrorResponse(), error: undefined };
    const msg = formatAgentError(response);
    expect(msg).toBe('Unknown error occurred');
  });
});

describe('extractAgentMetadata', () => {
  it('should extract metadata from successful response', () => {
    const meta = extractAgentMetadata(makeSuccessResponse());
    expect(meta).toEqual({
      executionTime: 150,
      model: 'llama3.2',
      provider: 'Ollama',
      tokensUsed: 100,
      successful: true,
    });
  });

  it('should extract metadata from error response', () => {
    const meta = extractAgentMetadata(makeErrorResponse());
    expect(meta.successful).toBe(false);
    expect(meta.executionTime).toBe(50);
  });
});

describe('createErrorResponse', () => {
  it('should create a standardized error response', () => {
    const response = createErrorResponse('TEST_ERROR', 'Something went wrong', 'my-agent');
    expect(response.success).toBe(false);
    expect(response.error?.code).toBe('TEST_ERROR');
    expect(response.error?.message).toBe('Something went wrong');
    expect(response.metadata.agentId).toBe('my-agent');
  });

  it('should use default agent ID when not provided', () => {
    const response = createErrorResponse('ERR', 'msg');
    expect(response.metadata.agentId).toBe('unknown');
  });
});
