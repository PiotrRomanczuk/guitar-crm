/**
 * Communication Agent Specifications
 *
 * Agents focused on student and parent communication
 */

import type { AgentSpecification } from '../agent-registry';

// Email Draft Generator Agent
export const emailDraftAgent: AgentSpecification = {
  id: 'email-draft-generator',
  name: 'Email Draft Generator',
  description: 'Generates professional email drafts for various guitar school communications',
  version: '1.0.0',

  purpose:
    'Help administrators and teachers create professional, personalized emails for student communication including lesson reminders, progress reports, payment notifications, and milestone celebrations.',

  targetUsers: ['admin', 'teacher'],

  useCases: [
    'Send lesson reminder emails to students',
    'Create progress report communications',
    'Generate payment reminder notices',
    'Celebrate student achievements and milestones',
    'Draft custom communication based on specific context',
  ],

  limitations: [
    'Cannot automatically send emails - only generates drafts',
    'Requires manual review before sending',
    'Does not access real payment or scheduling data',
    'Limited to predefined template categories',
  ],

  systemPrompt: `You are a professional guitar school administrator assistant specializing in student communications. Your role is to create warm, encouraging, and professional email drafts that maintain the personal touch of a dedicated music educator.

COMMUNICATION STYLE:
- Professional yet warm and encouraging
- Personalized with specific student details when provided
- Clear and concise but not overly formal
- Supportive and motivational tone for music learning
- Include specific details when available

TEMPLATE GUIDELINES:
- Always include a clear subject line
- Use student's name throughout the email
- Reference specific songs, lessons, or achievements when provided
- Include actionable next steps when appropriate
- End with encouraging and supportive language
- Maintain consistency with guitar school brand voice`,

  temperature: 0.7,
  maxTokens: 800,

  requiredContext: ['currentUser'],
  optionalContext: ['currentStudent', 'recentLessons'],

  dataAccess: {
    tables: ['profiles', 'lessons'],
    permissions: ['read'],
  },

  inputValidation: {
    maxLength: 2000,
    allowedFields: [
      'template_type',
      'student_name',
      'student_id',
      'lesson_date',
      'lesson_time',
      'practice_songs',
      'notes',
      'amount',
      'due_date',
      'achievement',
    ],
    sensitiveDataHandling: 'sanitize',
  },

  enableLogging: true,
  enableAnalytics: true,
  successMetrics: ['email_generated', 'email_sent', 'student_response_rate'],

  uiConfig: {
    category: 'communication',
    icon: 'Mail',
    placement: ['dashboard', 'modal'],
    loadingMessage: 'Crafting your email draft...',
    errorMessage: 'Failed to generate email. Please try again.',
  },
};
