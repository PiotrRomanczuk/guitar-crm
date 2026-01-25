/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
/**
 * AI Agents Tests
 *
 * Tests for agent specifications and the agent registry system
 */

import {
  registerAllAgents,
  emailDraftAgent,
  lessonNotesAgent,
  assignmentGeneratorAgent,
  postLessonSummaryAgent,
  progressInsightsAgent,
  adminInsightsAgent,
  songNormalizationAgent,
  communicationAgents,
  contentAgents,
  analyticsAgents,
  systemAgents,
} from './index';

import {
  registerAgent,
  getAgent,
  getAllAgents,
  getAvailableAgents,
  hasAgent,
  unregisterAgent,
  getRegistryStats,
  executeAgent,
} from '../registry';

import type { AgentSpecification, AgentContext } from '../registry';

// Mock the AI provider to avoid actual API calls
jest.mock('../provider-factory', () => ({
  getAIProvider: jest.fn(() => ({
    complete: jest.fn().mockResolvedValue({
      success: true,
      content: 'Mocked AI response',
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    }),
    isAvailable: jest.fn().mockResolvedValue(true),
    listModels: jest.fn().mockResolvedValue([{ id: 'test-model', name: 'Test Model' }]),
    name: 'mock-provider',
  })),
}));

// Mock rate limiter to always allow
jest.mock('../rate-limiter', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({
    allowed: true,
    remaining: 100,
    resetTime: Date.now() + 60000,
  }),
  clearAllRateLimits: jest.fn(),
}));

describe('AI Agents', () => {
  describe('Agent Specifications', () => {
    describe('emailDraftAgent', () => {
      it('should have correct id', () => {
        expect(emailDraftAgent.id).toBe('email-draft-generator');
      });

      it('should have proper name and description', () => {
        expect(emailDraftAgent.name).toBe('Email Draft Generator');
        expect(emailDraftAgent.description).toContain('email drafts');
      });

      it('should target admin and teacher users', () => {
        expect(emailDraftAgent.targetUsers).toContain('admin');
        expect(emailDraftAgent.targetUsers).toContain('teacher');
        expect(emailDraftAgent.targetUsers).not.toContain('student');
      });

      it('should have communication use cases', () => {
        expect(emailDraftAgent.useCases).toContainEqual(
          expect.stringContaining('reminder')
        );
        expect(emailDraftAgent.useCases).toContainEqual(
          expect.stringContaining('progress')
        );
      });

      it('should have reasonable temperature for emails', () => {
        expect(emailDraftAgent.temperature).toBeGreaterThanOrEqual(0.5);
        expect(emailDraftAgent.temperature).toBeLessThanOrEqual(1.0);
      });

      it('should have correct UI category', () => {
        expect(emailDraftAgent.uiConfig.category).toBe('communication');
      });

      it('should have email-related allowed fields', () => {
        expect(emailDraftAgent.inputValidation.allowedFields).toContain('student_name');
        expect(emailDraftAgent.inputValidation.allowedFields).toContain('template_type');
      });

      it('should have logging enabled', () => {
        expect(emailDraftAgent.enableLogging).toBe(true);
      });
    });

    describe('lessonNotesAgent', () => {
      it('should have correct id', () => {
        expect(lessonNotesAgent.id).toBe('lesson-notes-assistant');
      });

      it('should target admin and teacher', () => {
        expect(lessonNotesAgent.targetUsers).toEqual(['admin', 'teacher']);
      });

      it('should have content UI category', () => {
        expect(lessonNotesAgent.uiConfig.category).toBe('content');
      });

      it('should have lesson-related allowed fields', () => {
        expect(lessonNotesAgent.inputValidation.allowedFields).toContain('lesson_topic');
        expect(lessonNotesAgent.inputValidation.allowedFields).toContain('songs_covered');
      });

      it('should have lower temperature for structured content', () => {
        expect(lessonNotesAgent.temperature).toBeLessThanOrEqual(0.7);
      });
    });

    describe('assignmentGeneratorAgent', () => {
      it('should have correct id', () => {
        expect(assignmentGeneratorAgent.id).toBe('assignment-generator');
      });

      it('should have educational purpose', () => {
        expect(assignmentGeneratorAgent.purpose).toContain('assignment');
        expect(assignmentGeneratorAgent.purpose).toContain('student');
      });

      it('should have appropriate max tokens for detailed assignments', () => {
        expect(assignmentGeneratorAgent.maxTokens).toBeGreaterThanOrEqual(500);
      });
    });

    describe('progressInsightsAgent', () => {
      it('should have correct id', () => {
        expect(progressInsightsAgent.id).toBe('student-progress-insights');
      });

      it('should have analysis UI category', () => {
        expect(progressInsightsAgent.uiConfig.category).toBe('analysis');
      });

      it('should access student-related tables', () => {
        expect(progressInsightsAgent.dataAccess.tables).toContain('profiles');
        expect(progressInsightsAgent.dataAccess.tables).toContain('lessons');
      });

      it('should have read-only permissions', () => {
        expect(progressInsightsAgent.dataAccess.permissions).toContain('read');
        expect(progressInsightsAgent.dataAccess.permissions).not.toContain('write');
      });
    });

    describe('adminInsightsAgent', () => {
      it('should have correct id', () => {
        expect(adminInsightsAgent.id).toBe('admin-dashboard-insights');
      });

      it('should target only admin users', () => {
        expect(adminInsightsAgent.targetUsers).toEqual(['admin']);
      });

      it('should have lower temperature for analytical output', () => {
        expect(adminInsightsAgent.temperature).toBeLessThanOrEqual(0.6);
      });
    });

    describe('songNormalizationAgent', () => {
      it('should have correct id', () => {
        expect(songNormalizationAgent.id).toBe('song-normalization');
      });

      it('should target system users', () => {
        expect(songNormalizationAgent.targetUsers).toContain('system');
      });

      it('should have very low temperature for consistent output', () => {
        expect(songNormalizationAgent.temperature).toBeLessThanOrEqual(0.4);
      });

      it('should have song-related fields', () => {
        expect(songNormalizationAgent.inputValidation.allowedFields).toContain('title');
        expect(songNormalizationAgent.inputValidation.allowedFields).toContain('artist');
      });

      it('should not have analytics enabled', () => {
        expect(songNormalizationAgent.enableAnalytics).toBe(false);
      });
    });

    describe('postLessonSummaryAgent', () => {
      it('should exist and have required properties', () => {
        expect(postLessonSummaryAgent).toBeDefined();
        expect(postLessonSummaryAgent.id).toBeDefined();
        expect(postLessonSummaryAgent.name).toBeDefined();
      });
    });
  });

  describe('Agent Categories', () => {
    it('should export communicationAgents', () => {
      expect(communicationAgents).toHaveProperty('emailDraftAgent');
    });

    it('should export contentAgents', () => {
      expect(contentAgents).toHaveProperty('lessonNotesAgent');
      expect(contentAgents).toHaveProperty('assignmentGeneratorAgent');
      expect(contentAgents).toHaveProperty('postLessonSummaryAgent');
    });

    it('should export analyticsAgents', () => {
      expect(analyticsAgents).toHaveProperty('progressInsightsAgent');
      expect(analyticsAgents).toHaveProperty('adminInsightsAgent');
    });

    it('should export systemAgents', () => {
      expect(systemAgents).toHaveProperty('songNormalizationAgent');
    });
  });

  describe('Agent Specification Validation', () => {
    // Filter out songNormalizationAgent since it's a system agent without uiConfig
    const uiAgents = [
      emailDraftAgent,
      lessonNotesAgent,
      assignmentGeneratorAgent,
      progressInsightsAgent,
      adminInsightsAgent,
    ];

    const allAgents = [
      emailDraftAgent,
      lessonNotesAgent,
      assignmentGeneratorAgent,
      progressInsightsAgent,
      adminInsightsAgent,
      songNormalizationAgent,
    ];

    allAgents.forEach((agent) => {
      describe(`${agent.name}`, () => {
        it('should have valid id format', () => {
          expect(agent.id).toMatch(/^[a-z0-9-]+$/);
        });

        it('should have version string', () => {
          expect(agent.version).toMatch(/^\d+\.\d+\.\d+$/);
        });

        it('should have non-empty purpose', () => {
          expect(agent.purpose.length).toBeGreaterThan(20);
        });

        it('should have at least one use case', () => {
          expect(agent.useCases.length).toBeGreaterThan(0);
        });

        it('should have at least one limitation', () => {
          expect(agent.limitations.length).toBeGreaterThan(0);
        });

        it('should have system prompt', () => {
          expect(agent.systemPrompt.length).toBeGreaterThan(50);
        });

        it('should have temperature between 0 and 1', () => {
          expect(agent.temperature).toBeGreaterThanOrEqual(0);
          expect(agent.temperature).toBeLessThanOrEqual(1);
        });

        it('should have valid input validation config', () => {
          expect(agent.inputValidation.maxLength).toBeGreaterThan(0);
          expect(agent.inputValidation.allowedFields.length).toBeGreaterThan(0);
          expect(['block', 'sanitize', 'allow']).toContain(
            agent.inputValidation.sensitiveDataHandling
          );
        });
      });
    });

    // Test UI config separately for agents that have it
    uiAgents.forEach((agent) => {
      describe(`${agent.name} UI Config`, () => {
        it('should have valid UI config', () => {
          expect(['content', 'analysis', 'automation', 'communication']).toContain(
            agent.uiConfig.category
          );
          expect(agent.uiConfig.icon).toBeDefined();
          expect(agent.uiConfig.placement.length).toBeGreaterThan(0);
        });
      });
    });

    describe('songNormalizationAgent (System Agent)', () => {
      it('should not require uiConfig for system agents', () => {
        // System agents may not have uiConfig - this is expected
        expect(songNormalizationAgent.targetUsers).toContain('system');
      });
    });
  });

  describe('registerAllAgents', () => {
    beforeEach(() => {
      // Clear registry before each test
      const agents = getAllAgents();
      agents.forEach((agent) => unregisterAgent(agent.id));
    });

    it('should register all agents without error', () => {
      expect(() => registerAllAgents()).not.toThrow();
    });

    it('should register expected number of agents', () => {
      registerAllAgents();
      const agents = getAllAgents();
      expect(agents.length).toBeGreaterThanOrEqual(6);
    });

    it('should register communication agents', () => {
      registerAllAgents();
      expect(hasAgent('email-draft-generator')).toBe(true);
    });

    it('should register content agents', () => {
      registerAllAgents();
      expect(hasAgent('lesson-notes-assistant')).toBe(true);
      expect(hasAgent('assignment-generator')).toBe(true);
    });

    it('should register analytics agents', () => {
      registerAllAgents();
      expect(hasAgent('student-progress-insights')).toBe(true);
      expect(hasAgent('admin-dashboard-insights')).toBe(true);
    });

    it('should register system agents', () => {
      registerAllAgents();
      expect(hasAgent('song-normalization')).toBe(true);
    });
  });
});

describe('Agent Registry Core', () => {
  beforeEach(() => {
    // Clear registry
    const agents = getAllAgents();
    agents.forEach((agent) => unregisterAgent(agent.id));
  });

  describe('registerAgent', () => {
    it('should register a valid agent', () => {
      registerAgent(emailDraftAgent);
      expect(hasAgent('email-draft-generator')).toBe(true);
    });

    it('should make agent retrievable', () => {
      registerAgent(emailDraftAgent);
      const agent = getAgent('email-draft-generator');
      expect(agent).toBeDefined();
      expect(agent?.name).toBe('Email Draft Generator');
    });
  });

  describe('getAgent', () => {
    it('should return undefined for non-existent agent', () => {
      const agent = getAgent('non-existent-agent');
      expect(agent).toBeUndefined();
    });

    it('should return correct agent', () => {
      registerAgent(lessonNotesAgent);
      const agent = getAgent('lesson-notes-assistant');
      expect(agent?.id).toBe('lesson-notes-assistant');
    });
  });

  describe('getAllAgents', () => {
    it('should return empty array when no agents registered', () => {
      const agents = getAllAgents();
      expect(agents).toEqual([]);
    });

    it('should return all registered agents', () => {
      registerAgent(emailDraftAgent);
      registerAgent(lessonNotesAgent);
      const agents = getAllAgents();
      expect(agents.length).toBe(2);
    });
  });

  describe('getAvailableAgents', () => {
    beforeEach(() => {
      registerAgent(emailDraftAgent);
      registerAgent(adminInsightsAgent);
      registerAgent(lessonNotesAgent);
    });

    it('should filter agents by admin role', () => {
      const agents = getAvailableAgents('admin');
      expect(agents.length).toBe(3);
    });

    it('should filter agents by teacher role', () => {
      const agents = getAvailableAgents('teacher');
      // Admin insights is admin-only
      expect(agents.length).toBe(2);
    });

    it('should return empty for student (no student agents in test set)', () => {
      const agents = getAvailableAgents('student');
      expect(agents.length).toBe(0);
    });
  });

  describe('hasAgent', () => {
    it('should return false for non-existent agent', () => {
      expect(hasAgent('fake-agent')).toBe(false);
    });

    it('should return true for registered agent', () => {
      registerAgent(emailDraftAgent);
      expect(hasAgent('email-draft-generator')).toBe(true);
    });
  });

  describe('unregisterAgent', () => {
    it('should remove registered agent', () => {
      registerAgent(emailDraftAgent);
      expect(hasAgent('email-draft-generator')).toBe(true);

      unregisterAgent('email-draft-generator');
      expect(hasAgent('email-draft-generator')).toBe(false);
    });

    it('should return true when agent was removed', () => {
      registerAgent(emailDraftAgent);
      const result = unregisterAgent('email-draft-generator');
      expect(result).toBe(true);
    });

    it('should return false when agent did not exist', () => {
      const result = unregisterAgent('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('getRegistryStats', () => {
    beforeEach(() => {
      registerAgent(emailDraftAgent);
      registerAgent(lessonNotesAgent);
      registerAgent(adminInsightsAgent);
    });

    it('should return total agent count', () => {
      const stats = getRegistryStats();
      expect(stats.totalAgents).toBe(3);
    });

    it('should categorize agents by UI category', () => {
      const stats = getRegistryStats();
      expect(stats.agentsByCategory.communication).toBe(1);
      expect(stats.agentsByCategory.content).toBe(1);
      expect(stats.agentsByCategory.analysis).toBe(1);
    });

    it('should categorize agents by target user', () => {
      const stats = getRegistryStats();
      expect(stats.agentsByTargetUser.admin).toBe(3);
      expect(stats.agentsByTargetUser.teacher).toBe(2);
    });
  });
});

describe('Agent Execution', () => {
  beforeEach(() => {
    // Register agents
    const agents = getAllAgents();
    agents.forEach((agent) => unregisterAgent(agent.id));
    registerAgent(emailDraftAgent);
    registerAgent(lessonNotesAgent);
  });

  const mockContext: Partial<AgentContext> = {
    userId: 'test-user-123',
    userRole: 'admin',
    sessionId: 'test-session',
  };

  it('should return error for non-existent agent', async () => {
    const result = await executeAgent(
      'non-existent-agent',
      { message: 'test' },
      mockContext
    );

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('AGENT_NOT_FOUND');
  });

  it('should execute registered agent', async () => {
    const result = await executeAgent(
      'email-draft-generator',
      { template_type: 'reminder', student_name: 'Test Student' },
      mockContext
    );

    // Should execute (mocked provider)
    expect(result).toBeDefined();
    expect(result.metadata.agentId).toBe('email-draft-generator');
  });

  it('should include execution metadata', async () => {
    const result = await executeAgent(
      'email-draft-generator',
      { template_type: 'reminder' },
      mockContext
    );

    expect(result.metadata).toBeDefined();
    expect(result.metadata.executionTime).toBeGreaterThanOrEqual(0);
    expect(result.analytics).toBeDefined();
    expect(result.analytics.requestId).toBeDefined();
  });

  it('should check rate limits', async () => {
    const { checkRateLimit } = require('../rate-limiter');

    await executeAgent(
      'email-draft-generator',
      { template_type: 'test' },
      mockContext
    );

    expect(checkRateLimit).toHaveBeenCalled();
  });
});
