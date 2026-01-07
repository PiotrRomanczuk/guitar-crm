'use server';

import { getAIProvider, isAIError, type AIMessage, type AIModelInfo } from '@/lib/ai';
import { DEFAULT_AI_MODEL } from '@/lib/ai-models';
import { createClient } from '@/lib/supabase/server';

/**
 * Map OpenRouter model IDs to appropriate local models for Ollama
 */
export async function getProviderAppropriateModel(provider: any, requestedModel: string): Promise<string> {
  // If using Ollama, map OpenRouter models to local equivalents
  if (provider.name === 'Ollama') {
    // Map OpenRouter model IDs to Ollama model names
    const modelMappings: Record<string, string> = {
      'meta-llama/llama-3.3-70b-instruct:free': 'llama3.2:3b',
      'google/gemini-2.0-flash-exp:free': 'mistral:7b',
    };

    const mapped = modelMappings[requestedModel];
    if (mapped) {
      console.log(`[AI] Mapped ${requestedModel} to ${mapped} for Ollama`);
      return mapped;
    }

    // If no mapping, use the first available local model
    try {
      const models = await provider.listModels();
      if (models.length > 0) {
        console.log(`[AI] Using first available local model: ${models[0].id}`);
        return models[0].id;
      }
    } catch (error) {
      console.warn('[AI] Failed to list local models, using fallback');
    }

    // Ultimate fallback for Ollama
    return 'llama3.2:3b';
  }

  // For other providers (OpenRouter), use the requested model as-is
  return requestedModel;
}

// NEW: Import standardized agent execution functions
import {
  generateEmailDraftAgent,
  generateLessonNotesAgent,
  generateAssignmentAgent,
  generatePostLessonSummaryAgent,
  analyzeStudentProgressAgent,
  generateAdminInsightsAgent,
  extractAgentResult,
  formatAgentError,
  isAgentSuccess,
} from '@/lib/ai/agent-execution';

/**
 * LEGACY: Generate AI response using the configured provider
 *
 * @deprecated Use specific agent functions instead for new implementations
 *
 * This action automatically selects between OpenRouter and local LLM
 * based on the AI_PROVIDER environment variable:
 * - 'openrouter': Use OpenRouter API
 * - 'ollama': Use local Ollama
 * - 'auto' (default): Try Ollama first, fallback to OpenRouter
 */
export async function generateAIResponse(
  prompt: string,
  model: string = DEFAULT_AI_MODEL
): Promise<{ content?: string; error?: string }> {
  try {
    // Get the configured provider
    const provider = await getAIProvider();

    // Map the model to the appropriate provider model
    const providerModel = await getProviderAppropriateModel(provider, model);

    console.log(`[AI] Using provider: ${provider.name}, model: ${providerModel}`);

    // Check if provider is available
    const available = await provider.isAvailable();
    if (!available) {
      return {
        error: `${provider.name} is not available. Please check your configuration.`,
      };
    }

    // Prepare messages
    const messages: AIMessage[] = [
      {
        role: 'system',
        content:
          'You are a helpful assistant for the Guitar CRM admin dashboard. Keep your answers concise and relevant to managing a music school.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    // Generate completion
    const result = await provider.complete({
      model: providerModel,
      messages,
      temperature: 0.7,
    });

    // Handle error response
    if (isAIError(result)) {
      console.error(`[AI] ${provider.name} error:`, result.error);
      return { error: result.error };
    }

    // Return success response
    return { content: result.content };
  } catch (error) {
    console.error('[AI] Unexpected error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to generate AI response.',
    };
  }
}

/**
 * Get available AI models from the current provider
 */
export async function getAvailableModels(): Promise<{
  models?: AIModelInfo[];
  providerName?: string;
  error?: string;
}> {
  try {
    const provider = await getAIProvider();
    const models = await provider.listModels();

    return {
      models,
      providerName: provider.name,
    };
  } catch (error) {
    console.error('[AI] Failed to fetch models:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch available models.',
    };
  }
}

// ═══════════════════════════════════════════════════════════
// PHASE 1: Admin Quick Wins
// ═══════════════════════════════════════════════════════════

/**
 * Generate lesson notes using the standardized Lesson Notes Agent
 */
export async function generateLessonNotes(params: {
  studentName: string;
  songsCovered: string[];
  lessonTopic: string;
  duration?: number;
  teacherNotes?: string;
  previousNotes?: string;
}): Promise<{ success: boolean; notes: string; error?: string }> {
  try {
    const response = await generateLessonNotesAgent({
      student_name: params.studentName,
      lesson_topic: params.lessonTopic,
      songs_covered: params.songsCovered.join(', '),
      techniques_practiced: '', // Will be added to params in future
      student_progress: params.previousNotes || '',
      areas_to_focus: '', // Will be derived from context
      homework_assigned: '', // Will be specified in context
      next_lesson_goals: params.teacherNotes || '',
    });

    if (!isAgentSuccess(response)) {
      return {
        success: false,
        notes: '',
        error: formatAgentError(response),
      };
    }

    const result = extractAgentResult(response);
    const notes = result.content || result;

    return {
      success: true,
      notes,
    };
  } catch (error) {
    console.error('[AI] generateLessonNotes error:', error);
    return {
      success: false,
      notes: '',
      error: error instanceof Error ? error.message : 'Failed to generate lesson notes',
    };
  }
}

/**
 * Generate assignment description using the standardized Assignment Generator Agent
 */
export async function generateAssignment(params: {
  studentName: string;
  studentLevel: 'beginner' | 'intermediate' | 'advanced';
  recentSongs: string[];
  focusArea: string;
  duration: string;
  lessonTopic?: string;
}): Promise<{ success: boolean; assignment: string; error?: string }> {
  try {
    const response = await generateAssignmentAgent({
      student_name: params.studentName,
      student_level: params.studentLevel,
      song_title: params.recentSongs[0] || '', // Use first recent song
      song_artist: '', // Not available in current params
      assignment_focus: params.focusArea,
      duration_weeks: params.duration,
      specific_techniques: params.lessonTopic || '',
      difficulty_level: params.studentLevel,
    });

    if (!isAgentSuccess(response)) {
      return {
        success: false,
        assignment: '',
        error: formatAgentError(response),
      };
    }

    const result = extractAgentResult(response);
    const assignment = result.content || result;

    return {
      success: true,
      assignment,
    };
  } catch (error) {
    console.error('[AI] generateAssignment error:', error);
    return {
      success: false,
      assignment: '',
      error: error instanceof Error ? error.message : 'Failed to generate assignment',
    };
  }
}

/**
 * Generate email draft using the standardized Email Draft Agent
 */
export async function generateEmailDraft(params: {
  templateType:
    | 'lesson_reminder'
    | 'progress_report'
    | 'payment_reminder'
    | 'milestone_celebration';
  studentName: string;
  context: Record<string, unknown>;
}): Promise<{ success: boolean; subject: string; body: string; error?: string }> {
  try {
    const response = await generateEmailDraftAgent({
      template_type: params.templateType,
      student_name: params.studentName,
      student_id: String(params.context.student_id || ''),
      lesson_date: String(params.context.lesson_date || ''),
      lesson_time: String(params.context.lesson_time || ''),
      practice_songs: String(params.context.practice_songs || ''),
      notes: String(params.context.notes || ''),
      amount: String(params.context.amount || ''),
      due_date: String(params.context.due_date || ''),
      achievement: String(params.context.achievement || ''),
    });

    if (!isAgentSuccess(response)) {
      return {
        success: false,
        subject: '',
        body: '',
        error: formatAgentError(response),
      };
    }

    const result = extractAgentResult(response);

    // Parse the AI response to extract subject and body
    const content = result.content || result;
    let subject = 'Generated Email';
    let body = content;

    // Look for subject line patterns
    const subjectMatch = content.match(/Subject:\s*(.+?)(?:\n|$)/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      body = content.replace(/Subject:\s*.+?(?:\n|$)/i, '').trim();
    }

    return {
      success: true,
      subject,
      body,
    };
  } catch (error) {
    console.error('[AI] generateEmailDraft error:', error);
    return {
      success: false,
      subject: '',
      body: '',
      error: error instanceof Error ? error.message : 'Failed to generate email draft',
    };
  }
}

// ═══════════════════════════════════════════════════════════
// PHASE 2: Enhanced Features
// ═══════════════════════════════════════════════════════════

/**
 * Generate post-lesson summary using the standardized Post-Lesson Summary Agent
 */
export async function generatePostLessonSummary(params: {
  studentName: string;
  duration: number;
  songsPracticed: string[];
  newTechniques?: string[];
  struggles?: string[];
  successes?: string[];
  teacherNotes?: string;
}): Promise<{ success: boolean; summary: string; error?: string }> {
  try {
    const response = await generatePostLessonSummaryAgent({
      student_name: params.studentName,
      lesson_date: new Date().toLocaleDateString(),
      songs_practiced: params.songsPracticed.join(', '),
      techniques_covered: params.newTechniques?.join(', ') || '',
      achievements: params.successes?.join(', ') || '',
      challenges: params.struggles?.join(', ') || '',
      practice_recommendations: '', // Will be derived from context
      next_focus: params.teacherNotes || '',
    });

    if (!isAgentSuccess(response)) {
      return {
        success: false,
        summary: '',
        error: formatAgentError(response),
      };
    }

    const result = extractAgentResult(response);
    const summary = result.content || result;

    return {
      success: true,
      summary,
    };
  } catch (error) {
    console.error('[AI] generatePostLessonSummary error:', error);
    return {
      success: false,
      summary: '',
      error: error instanceof Error ? error.message : 'Failed to generate post-lesson summary',
    };
  }
}

// ═══════════════════════════════════════════════════════════
// PHASE 3: Advanced Analytics
// ═══════════════════════════════════════════════════════════

/**
 * Analyze student progress and generate insights
 */
/**
 * Analyze student progress using the standardized Student Progress Insights Agent
 */
export async function analyzeStudentProgress(params: {
  studentId: string;
  timePeriod: string;
}): Promise<{ success: boolean; insights: string; error?: string }> {
  try {
    const response = await analyzeStudentProgressAgent({
      student_ids: [params.studentId],
      time_period: params.timePeriod,
      analysis_focus: 'individual_progress',
    });

    if (!isAgentSuccess(response)) {
      return {
        success: false,
        insights: '',
        error: formatAgentError(response),
      };
    }

    const result = extractAgentResult(response);
    const insights = result.content || result;

    return {
      success: true,
      insights,
    };
  } catch (error) {
    console.error('[AI] analyzeStudentProgress error:', error);
    return {
      success: false,
      insights: '',
      error: error instanceof Error ? error.message : 'Failed to analyze student progress',
    };
  }
}

/**
 * Generate admin dashboard insights using the standardized Admin Dashboard Insights Agent
 */
export async function generateAdminInsights(params: {
  totalStudents: number;
  newStudents: number;
  retentionRate: number;
  avgLessons: number;
  popularSongs: string[];
  revenueData?: string;
  teacherStats?: string;
}): Promise<{ success: boolean; insights: string; error?: string }> {
  try {
    const response = await generateAdminInsightsAgent({
      total_users: params.totalStudents + params.newStudents,
      total_students: params.totalStudents,
      total_teachers: 1, // Default for single teacher system
      total_lessons: Math.round(params.avgLessons * params.totalStudents),
      analysis_period: 'last_30_days',
    });

    if (!isAgentSuccess(response)) {
      return {
        success: false,
        insights: '',
        error: formatAgentError(response),
      };
    }

    const result = extractAgentResult(response);
    const insights = result.content || result;

    return {
      success: true,
      insights,
    };
  } catch (error) {
    console.error('[AI] generateAdminInsights error:', error);
    return {
      success: false,
      insights: '',
      error: error instanceof Error ? error.message : 'Failed to generate admin insights',
    };
  }
}
