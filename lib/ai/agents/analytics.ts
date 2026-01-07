/**
 * Analytics Agent Specifications
 *
 * Agents focused on data analysis and insights generation
 */

import type { AgentSpecification } from '../agent-registry';

// Student Progress Insights Agent
export const progressInsightsAgent: AgentSpecification = {
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
export const adminInsightsAgent: AgentSpecification = {
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
