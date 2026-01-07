/**
 * Content Generation Agent Specifications
 *
 * Agents focused on educational content creation
 */

import type { AgentSpecification } from '../agent-registry';

// Lesson Notes AI Assistant Agent
export const lessonNotesAgent: AgentSpecification = {
  id: 'lesson-notes-assistant',
  name: 'Lesson Notes AI Assistant',
  description: 'Assists teachers in creating detailed and structured lesson notes',
  version: '1.0.0',

  purpose:
    'Help teachers create comprehensive, structured lesson notes that capture student progress, areas of focus, practice recommendations, and next steps for optimal learning outcomes.',

  targetUsers: ['admin', 'teacher'],

  useCases: [
    'Generate structured lesson notes during or after teaching',
    'Create consistent documentation across all lessons',
    'Provide practice recommendations based on lesson content',
    'Track student progress and areas needing attention',
    'Suggest next lesson topics and goals',
  ],

  limitations: [
    'Cannot observe actual lesson interactions',
    'Relies on teacher input for accuracy',
    'Does not replace teacher judgment and expertise',
    'Cannot access real-time student performance data',
  ],

  systemPrompt: `You are an experienced guitar instructor's assistant, specializing in creating comprehensive lesson documentation. Your role is to help structure lesson notes that are useful for tracking student progress and planning future lessons.

LESSON DOCUMENTATION STYLE:
- Professional and detailed but easy to read
- Structured format for consistency
- Focus on specific techniques, songs, and progress
- Include actionable practice recommendations
- Note areas needing continued focus
- Suggest logical next steps for learning

FORMAT GUIDELINES:
- Create clear sections for different aspects of the lesson
- Use bullet points for easy scanning
- Include specific song references and chord progressions
- Note student strengths and areas for improvement
- Provide concrete practice suggestions
- Maintain encouraging and professional tone`,

  temperature: 0.6,
  maxTokens: 600,

  requiredContext: ['currentUser'],
  optionalContext: ['currentStudent', 'recentLessons'],

  dataAccess: {
    tables: ['lessons', 'songs', 'profiles'],
    permissions: ['read'],
  },

  inputValidation: {
    maxLength: 1500,
    allowedFields: [
      'student_name',
      'lesson_topic',
      'songs_covered',
      'techniques_practiced',
      'student_progress',
      'areas_to_focus',
      'homework_assigned',
      'next_lesson_goals',
    ],
    sensitiveDataHandling: 'allow',
  },

  enableLogging: true,
  enableAnalytics: true,
  successMetrics: ['notes_generated', 'teacher_satisfaction', 'lesson_consistency'],

  uiConfig: {
    category: 'content',
    icon: 'BookOpen',
    placement: ['inline', 'modal'],
    loadingMessage: 'Creating your lesson notes...',
    errorMessage: 'Could not generate lesson notes. Please try again.',
  },
};

// Assignment Description Generator Agent
export const assignmentGeneratorAgent: AgentSpecification = {
  id: 'assignment-generator',
  name: 'Assignment Description Generator',
  description:
    'Creates detailed assignment descriptions with clear objectives and practice guidelines',
  version: '1.0.0',

  purpose:
    'Generate comprehensive assignment descriptions that provide students with clear practice objectives, specific techniques to focus on, and structured guidance for independent learning between lessons.',

  targetUsers: ['admin', 'teacher'],

  useCases: [
    'Create practice assignments for specific songs',
    'Generate technique-focused practice routines',
    'Provide structured practice guidance between lessons',
    'Create level-appropriate challenges for students',
    'Assign homework with clear success criteria',
  ],

  limitations: [
    'Cannot assess individual student skill level in real-time',
    'Requires teacher input for customization',
    'Does not replace personalized instruction',
    'Limited to general practice methodologies',
  ],

  systemPrompt: `You are a guitar education specialist creating practice assignments for students. Your role is to provide clear, structured, and achievable practice goals that help students progress effectively between lessons.

ASSIGNMENT CREATION PRINCIPLES:
- Clear, specific objectives and outcomes
- Appropriate difficulty for student level
- Structured practice methodology
- Time-based practice recommendations
- Include both technical and musical elements
- Provide success criteria and self-assessment tips

FORMATTING GUIDELINES:
- Start with clear assignment objectives
- Break down into specific practice steps
- Include time estimates for each activity
- Provide technique tips and common pitfalls
- Suggest practice schedule and frequency
- End with success indicators`,

  temperature: 0.6,
  maxTokens: 700,

  requiredContext: ['currentUser'],
  optionalContext: ['currentStudent', 'assignmentSong'],

  dataAccess: {
    tables: ['songs', 'assignments', 'profiles'],
    permissions: ['read'],
  },

  inputValidation: {
    maxLength: 1000,
    allowedFields: [
      'student_name',
      'student_level',
      'song_title',
      'song_artist',
      'assignment_focus',
      'duration_weeks',
      'specific_techniques',
      'difficulty_level',
    ],
    sensitiveDataHandling: 'allow',
  },

  enableLogging: true,
  enableAnalytics: true,
  successMetrics: ['assignments_created', 'student_completion_rate', 'practice_effectiveness'],

  uiConfig: {
    category: 'content',
    icon: 'FileText',
    placement: ['inline', 'modal'],
    loadingMessage: 'Creating assignment description...',
    errorMessage: 'Failed to generate assignment. Please try again.',
  },
};

// Post-Lesson Summary Generator Agent
export const postLessonSummaryAgent: AgentSpecification = {
  id: 'post-lesson-summary',
  name: 'Post-Lesson Summary Generator',
  description: 'Creates concise summaries of lesson activities and student progress',
  version: '1.0.0',

  purpose:
    'Generate concise, informative lesson summaries that capture key achievements, areas worked on, and recommendations for continued practice, suitable for sharing with students and parents.',

  targetUsers: ['admin', 'teacher'],

  useCases: [
    'Create lesson summaries for student records',
    'Generate reports for parents and students',
    'Document lesson achievements and progress',
    'Provide practice recommendations post-lesson',
    'Track learning milestones and next steps',
  ],

  limitations: [
    'Based on teacher-provided information only',
    'Cannot capture nuanced in-lesson interactions',
    'Requires accurate input for meaningful output',
    'Does not replace detailed lesson notes',
  ],

  systemPrompt: `You are a guitar instructor creating concise lesson summaries for students and their families. Your role is to highlight achievements, document learning progress, and provide clear guidance for continued practice.

SUMMARY WRITING PRINCIPLES:
- Start with positive achievements and progress made
- Be specific about songs, techniques, and skills covered
- Include clear practice recommendations
- Mention areas that need continued focus
- End with encouragement and next lesson preview
- Keep tone positive and motivational

FORMAT REQUIREMENTS:
- Brief opening highlighting lesson highlights
- Bullet points for specific topics covered
- Clear practice recommendations with time estimates
- Areas for continued focus (constructively framed)
- Encouraging conclusion with next steps`,

  temperature: 0.7,
  maxTokens: 500,

  requiredContext: ['currentUser'],
  optionalContext: ['currentStudent', 'lessonDetails'],

  dataAccess: {
    tables: ['lessons', 'profiles'],
    permissions: ['read'],
  },

  inputValidation: {
    maxLength: 1200,
    allowedFields: [
      'student_name',
      'lesson_date',
      'songs_practiced',
      'techniques_covered',
      'achievements',
      'challenges',
      'practice_recommendations',
      'next_focus',
    ],
    sensitiveDataHandling: 'allow',
  },

  enableLogging: true,
  enableAnalytics: true,
  successMetrics: ['summaries_generated', 'parent_engagement', 'practice_follow_through'],

  uiConfig: {
    category: 'content',
    icon: 'FileEdit',
    placement: ['modal', 'inline'],
    loadingMessage: 'Summarizing lesson activities...',
    errorMessage: 'Could not create lesson summary. Please try again.',
  },
};
