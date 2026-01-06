/**
 * Agent Specifications Registry
 *
 * This file contains the standardized specifications for all AI agents
 * in the Guitar CRM system. Each agent must be registered here with
 * complete specifications before it can be used.
 */

import { agentRegistry, type AgentSpecification } from './agent-registry';

// Email Draft Generator Agent
const emailDraftAgent: AgentSpecification = {
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

// Lesson Notes AI Assistant Agent
const lessonNotesAgent: AgentSpecification = {
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
const assignmentGeneratorAgent: AgentSpecification = {
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
const postLessonSummaryAgent: AgentSpecification = {
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

// Student Progress Insights Agent
const progressInsightsAgent: AgentSpecification = {
  id: 'student-progress-insights',
  name: 'Student Progress Insights Analyzer',
  description: 'Analyzes student data to provide actionable insights and recommendations',
  version: '1.0.0',

  purpose:
    'Analyze student learning patterns, progress trends, and performance data to provide teachers and administrators with actionable insights for improving instruction and student outcomes.',

  targetUsers: ['admin', 'teacher'],

  useCases: [
    'Analyze student progress across different time periods',
    'Identify learning patterns and trends',
    'Provide recommendations for struggling students',
    'Highlight successful teaching approaches',
    'Generate insights for curriculum improvements',
  ],

  limitations: [
    'Analysis limited to available data in system',
    'Cannot replace human observation and intuition',
    'Insights are suggestions, not definitive assessments',
    'Requires sufficient data history for meaningful analysis',
  ],

  systemPrompt: `You are an educational data analyst specializing in music education insights. Your role is to analyze student progress data and provide actionable insights that help teachers and administrators make informed decisions about instruction and student support.

ANALYSIS PRINCIPLES:
- Focus on actionable insights and recommendations
- Identify both positive trends and areas needing attention
- Provide context for data patterns observed
- Suggest specific interventions when appropriate
- Maintain encouraging tone while being realistic
- Consider individual learning differences

INSIGHT CATEGORIES:
- Learning pace and progression patterns
- Engagement levels and participation trends
- Skill development across different areas
- Comparison to typical learning milestones
- Recommendations for personalized support
- Celebration of achievements and growth`,

  temperature: 0.6,
  maxTokens: 800,

  requiredContext: ['currentUser'],
  optionalContext: ['studentData', 'lessonHistory', 'assignmentHistory'],

  dataAccess: {
    tables: ['profiles', 'lessons', 'assignments', 'songs'],
    permissions: ['read'],
  },

  inputValidation: {
    maxLength: 1500,
    allowedFields: [
      'student_ids',
      'time_period',
      'analysis_focus',
      'lesson_data',
      'assignment_data',
      'progress_metrics',
    ],
    sensitiveDataHandling: 'sanitize',
  },

  enableLogging: true,
  enableAnalytics: true,
  successMetrics: ['insights_generated', 'recommendation_adoption', 'student_improvement'],

  uiConfig: {
    category: 'analysis',
    icon: 'TrendingUp',
    placement: ['dashboard', 'modal'],
    loadingMessage: 'Analyzing student progress data...',
    errorMessage: 'Could not generate progress insights. Please try again.',
  },
};

// Admin Dashboard Insights Agent
const adminInsightsAgent: AgentSpecification = {
  id: 'admin-dashboard-insights',
  name: 'Admin Dashboard Business Intelligence',
  description: 'Provides business intelligence and operational insights for school administration',
  version: '1.0.0',

  purpose:
    'Analyze school-wide data to provide administrators with strategic insights, operational recommendations, and business intelligence for making informed decisions about school management and growth.',

  targetUsers: ['admin'],

  useCases: [
    'Generate monthly business performance insights',
    'Analyze enrollment trends and patterns',
    'Identify operational efficiency opportunities',
    'Provide strategic recommendations for growth',
    'Monitor teacher performance and workload distribution',
  ],

  limitations: [
    'Based on available system data only',
    'Cannot include external market factors',
    'Insights are analytical suggestions, not business advice',
    'Requires sufficient operational history for trends',
  ],

  systemPrompt: `You are a music school business analyst providing strategic insights for school administrators. Your role is to analyze operational data and provide actionable business intelligence that helps with decision-making, growth planning, and operational optimization.

ANALYSIS FRAMEWORK:
- Student enrollment and retention patterns
- Revenue and financial performance indicators
- Teacher utilization and effectiveness metrics
- Popular programs and growth opportunities
- Operational efficiency recommendations
- Strategic growth suggestions

INSIGHT DELIVERY:
- Lead with key findings and trends
- Provide specific, actionable recommendations
- Include relevant metrics and comparisons
- Highlight both opportunities and concerns
- Suggest concrete next steps for improvement
- Maintain professional business analysis tone`,

  temperature: 0.5,
  maxTokens: 900,

  requiredContext: ['currentUser'],
  optionalContext: ['schoolStats', 'enrollmentData', 'revenueData'],

  dataAccess: {
    tables: ['profiles', 'lessons', 'user_roles', 'songs'],
    permissions: ['read'],
  },

  inputValidation: {
    maxLength: 1000,
    allowedFields: [
      'total_users',
      'total_students',
      'total_teachers',
      'total_lessons',
      'recent_users',
      'analysis_period',
    ],
    sensitiveDataHandling: 'sanitize',
  },

  enableLogging: true,
  enableAnalytics: true,
  successMetrics: ['insights_generated', 'recommendations_implemented', 'business_improvement'],

  uiConfig: {
    category: 'analysis',
    icon: 'BarChart3',
    placement: ['dashboard'],
    loadingMessage: 'Analyzing business performance data...',
    errorMessage: 'Could not generate business insights. Please try again.',
  },
};

// Register all agents
export function registerAllAgents(): void {
  agentRegistry.register(emailDraftAgent);
  agentRegistry.register(lessonNotesAgent);
  agentRegistry.register(assignmentGeneratorAgent);
  agentRegistry.register(postLessonSummaryAgent);
  agentRegistry.register(progressInsightsAgent);
  agentRegistry.register(adminInsightsAgent);

  console.log('[AgentSpecs] All agents registered successfully');
}

// Export individual specifications for reference
export {
  emailDraftAgent,
  lessonNotesAgent,
  assignmentGeneratorAgent,
  postLessonSummaryAgent,
  progressInsightsAgent,
  adminInsightsAgent,
};
