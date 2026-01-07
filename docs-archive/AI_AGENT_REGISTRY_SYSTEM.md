# AI Agent Registry System - Complete Documentation

## Overview

The AI Agent Registry System provides a standardized, specification-driven approach to managing AI agents in the Guitar CRM application. Every AI use goes through this unified system, ensuring consistent behavior, proper monitoring, and centralized management.

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Agent Registry System                     │
├─────────────────────────────────────────────────────────────────┤
│  1. Agent Registry (agent-registry.ts)                         │
│     - Central registration and execution system                │
│     - Validation, permissions, context management              │
│     - Monitoring and analytics collection                      │
│                                                                │
│  2. Agent Specifications (agent-specifications.ts)             │
│     - Predefined agent configurations                          │
│     - Purpose, behavior, and constraint definitions            │
│     - UI integration specifications                            │
│                                                                │
│  3. Agent Execution Layer (agent-execution.ts)                 │
│     - Standardized wrapper functions                           │
│     - Context building and error handling                      │
│     - Batch processing capabilities                            │
│                                                                │
│  4. Monitoring Dashboard (AgentMonitoringDashboard.tsx)        │
│     - Real-time analytics and performance monitoring           │
│     - Agent health and usage statistics                       │
│     - Category-based insights                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Flow

```mermaid
graph TD
    A[User Interaction] --> B[Agent Execution Function]
    B --> C[Build Context]
    C --> D[Agent Registry.execute()]
    D --> E{Agent Registered?}
    E -->|No| F[Error: Agent Not Found]
    E -->|Yes| G[Validate Request]
    G --> H[Check Permissions]
    H --> I[Prepare Context Data]
    I --> J[Execute Agent]
    J --> K[AI Provider]
    K --> L[Log Execution]
    L --> M[Return Response]
    M --> N[Format for UI]
```

## Registered Agents

### 1. Email Draft Generator
- **ID**: `email-draft-generator`
- **Purpose**: Generate professional email drafts for student communications
- **Target Users**: Admin, Teacher
- **Templates**: lesson_reminder, progress_report, payment_reminder, milestone_celebration
- **Context Required**: Student information, email type-specific data

### 2. Lesson Notes Assistant
- **ID**: `lesson-notes-assistant`
- **Purpose**: Create structured lesson documentation
- **Target Users**: Admin, Teacher
- **Context Required**: Lesson details, student progress, practice focus
- **Output**: Structured lesson notes with practice recommendations

### 3. Assignment Generator
- **ID**: `assignment-generator`
- **Purpose**: Create detailed practice assignments
- **Target Users**: Admin, Teacher
- **Context Required**: Student level, songs, techniques, duration
- **Output**: Structured assignment with practice guidelines

### 4. Post-Lesson Summary
- **ID**: `post-lesson-summary`
- **Purpose**: Generate concise lesson summaries for students/parents
- **Target Users**: Admin, Teacher
- **Context Required**: Lesson activities, achievements, practice recommendations
- **Output**: Student-friendly lesson summary

### 5. Student Progress Insights
- **ID**: `student-progress-insights`
- **Purpose**: Analyze student learning patterns and provide recommendations
- **Target Users**: Admin, Teacher
- **Context Required**: Student performance data, time period
- **Output**: Analysis and actionable insights

### 6. Admin Dashboard Insights
- **ID**: `admin-dashboard-insights`
- **Purpose**: Business intelligence for school administration
- **Target Users**: Admin only
- **Context Required**: School statistics, operational data
- **Output**: Strategic recommendations and business insights

## Usage Patterns

### Basic Agent Execution

```typescript
import { executeAgent } from '@/lib/ai/agent-execution';

// Execute an agent with full context
const response = await executeAgent('email-draft-generator', {
  template_type: 'lesson_reminder',
  student_name: 'John Doe',
  lesson_date: '2026-01-15',
  lesson_time: '3:00 PM',
}, {
  userId: 'user-id',
  userRole: 'teacher',
  entityId: 'student-id',
  entityType: 'student',
});

if (response.success) {
  console.log(response.result);
} else {
  console.error(response.error);
}
```

### Specialized Agent Functions

```typescript
import {
  generateEmailDraftAgent,
  generateLessonNotesAgent,
  analyzeStudentProgressAgent
} from '@/lib/ai/agent-execution';

// Use specialized functions for type safety
const emailResponse = await generateEmailDraftAgent({
  template_type: 'progress_report',
  student_name: 'Jane Smith',
  student_id: 'student-123',
  // ... other fields
});

const notesResponse = await generateLessonNotesAgent({
  student_name: 'Jane Smith',
  lesson_topic: 'Chord Transitions',
  songs_covered: 'Wonderwall, House of the Rising Sun',
  // ... other fields
});
```

### Batch Processing

```typescript
import { executeBatchAgents } from '@/lib/ai/agent-execution';

const requests = [
  {
    agentId: 'email-draft-generator',
    input: { template_type: 'lesson_reminder', student_name: 'Student 1' },
    entityId: 'student-1',
  },
  {
    agentId: 'email-draft-generator', 
    input: { template_type: 'lesson_reminder', student_name: 'Student 2' },
    entityId: 'student-2',
  },
];

const results = await executeBatchAgents(requests);
```

## Agent Specification Schema

### Required Fields

```typescript
interface AgentSpecification {
  // Identity
  id: string;                    // Unique agent identifier
  name: string;                  // Human-readable name
  description: string;           // Brief description
  version: string;               // Version for tracking
  
  // Purpose & Scope
  purpose: string;               // What problem it solves
  targetUsers: string[];         // Who can use it
  useCases: string[];           // Specific scenarios
  limitations: string[];        // What it cannot do
  
  // Behavior
  systemPrompt: string;         // AI system instructions
  temperature: number;          // AI creativity level
  maxTokens?: number;          // Response length limit
  
  // Context & Data
  requiredContext: string[];    // Must-have context data
  optionalContext: string[];    // Nice-to-have context
  dataAccess: {                // Database access requirements
    tables?: string[];
    permissions: string[];
  };
  
  // Validation & Safety
  inputValidation: {
    maxLength: number;          // Input size limits
    allowedFields: string[];    // Accepted input fields
    sensitiveDataHandling: string;
  };
  
  // Monitoring
  enableLogging: boolean;       // Log executions
  enableAnalytics: boolean;     // Collect analytics
  successMetrics: string[];     // How to measure success
  
  // UI Integration
  uiConfig: {
    category: string;           // UI grouping
    icon: string;              // Display icon
    placement: string[];       // Where it appears
    loadingMessage?: string;   // Loading text
    errorMessage?: string;     // Error text
  };
}
```

## Context Management

### Standard Context Fields

- **userId**: Current user identifier
- **userRole**: User's role (admin/teacher/student)
- **sessionId**: Session identifier for tracking
- **entityId**: ID of related entity (student, lesson, etc.)
- **entityType**: Type of related entity
- **contextData**: Additional context information

### Context Builders

The system automatically fetches context data based on agent requirements:

- **currentUser**: Profile information for the executing user
- **currentStudent**: Student details when working with student data
- **recentLessons**: Recent lesson history for context
- Additional context fetchers can be added to the registry

## Monitoring and Analytics

### Available Metrics

- **Execution Count**: Total number of agent executions
- **Success Rate**: Percentage of successful executions
- **Average Execution Time**: Response time performance
- **Error Distribution**: Types and frequency of errors
- **Usage Patterns**: Popular agents and peak usage times

### Monitoring Dashboard

Access real-time monitoring at `/dashboard/admin/agent-monitoring` (admin only):

- **Overview Cards**: Key performance indicators
- **Agent Performance**: Individual agent statistics
- **Category Analysis**: Usage by agent category
- **Recent Activity**: Latest execution logs

### Database Logging

Executions are logged to `agent_execution_logs` table:
- Agent and request identification
- User context and permissions
- Execution time and success status
- Error codes and debugging information

## Error Handling

### Error Types

- **EXECUTION_FAILED**: AI service unavailable
- **VALIDATION_ERROR**: Invalid input data
- **PERMISSION_DENIED**: Insufficient user permissions
- **RATE_LIMITED**: Too many requests

### User-Friendly Messages

The system provides friendly error messages:
```typescript
import { formatAgentError } from '@/lib/ai/agent-execution';

if (!response.success) {
  const userMessage = formatAgentError(response);
  // Display to user instead of technical error
}
```

## Security and Permissions

### Role-Based Access

- **Admin**: Access to all agents including business intelligence
- **Teacher**: Access to educational and communication agents
- **Student**: No direct agent access (future feature)

### Data Protection

- **Input Validation**: All inputs validated against agent specifications
- **Sensitive Data Handling**: Configurable handling (block/sanitize/allow)
- **Row Level Security**: Database access respects user permissions
- **Audit Logging**: All executions logged for compliance

## Extending the System

### Adding New Agents

1. **Define Specification**: Create agent spec in `agent-specifications.ts`
2. **Register Agent**: Add to `registerAllAgents()` function
3. **Create Wrapper**: Add execution function to `agent-execution.ts`
4. **Update Actions**: Create server action in `app/actions/ai.ts`
5. **Build UI**: Create user interface component
6. **Add Tests**: Write tests for the new agent

### Example New Agent

```typescript
const myNewAgent: AgentSpecification = {
  id: 'practice-plan-generator',
  name: 'Practice Plan Generator',
  description: 'Creates personalized practice schedules',
  version: '1.0.0',
  purpose: 'Help students create structured practice routines',
  targetUsers: ['admin', 'teacher'],
  useCases: ['Weekly practice planning', 'Skill-focused routines'],
  limitations: ['Cannot track actual practice time'],
  systemPrompt: 'Create structured practice plans...',
  temperature: 0.6,
  requiredContext: ['currentUser'],
  optionalContext: ['currentStudent'],
  dataAccess: { tables: ['profiles'], permissions: ['read'] },
  inputValidation: {
    maxLength: 1000,
    allowedFields: ['student_name', 'focus_areas', 'duration'],
    sensitiveDataHandling: 'allow'
  },
  enableLogging: true,
  enableAnalytics: true,
  successMetrics: ['plans_generated', 'student_satisfaction'],
  uiConfig: {
    category: 'content',
    icon: 'Calendar',
    placement: ['modal'],
    loadingMessage: 'Creating practice plan...',
  }
};
```

## Migration from Legacy System

All existing AI actions have been refactored to use the new agent system while maintaining backward compatibility:

- ✅ `generateEmailDraft` → Uses Email Draft Agent
- ✅ `generateLessonNotes` → Uses Lesson Notes Agent  
- ✅ `generateAssignment` → Uses Assignment Generator Agent
- ✅ `generatePostLessonSummary` → Uses Post-Lesson Summary Agent
- ✅ `analyzeStudentProgress` → Uses Progress Insights Agent
- ✅ `generateAdminInsights` → Uses Admin Insights Agent

## Best Practices

### For Developers

1. **Always use agent system**: New AI features must go through the registry
2. **Define clear specifications**: Complete agent specs before implementation
3. **Handle errors gracefully**: Use provided error formatting functions
4. **Monitor performance**: Check agent analytics regularly
5. **Test thoroughly**: Validate all input scenarios and edge cases

### For Administrators

1. **Monitor usage patterns**: Use the monitoring dashboard to understand usage
2. **Review error rates**: Investigate agents with high failure rates
3. **Manage permissions**: Ensure appropriate role-based access
4. **Plan for scale**: Monitor execution times and plan for growth
5. **Regular audits**: Review agent specifications and update as needed

## Troubleshooting

### Common Issues

**Agent Not Found**
- Verify agent is registered in `agent-specifications.ts`
- Check agent ID spelling and case

**Permission Denied**
- Verify user role matches agent's `targetUsers`
- Check database permissions for required tables

**Validation Errors**
- Review input against agent's `allowedFields`
- Check input length against `maxLength`

**Poor Performance**
- Monitor execution times in dashboard
- Consider adjusting AI model or temperature
- Review context data fetching efficiency

### Debug Mode

Enable detailed logging by setting environment variable:
```bash
DEBUG_AI_AGENTS=true
```

This provides detailed execution logs for troubleshooting.

## Future Enhancements

### Planned Features

1. **Agent Versioning**: Support for multiple agent versions
2. **A/B Testing**: Compare different agent configurations
3. **Auto-scaling**: Dynamic resource allocation based on usage
4. **Custom Agents**: UI for creating agents without coding
5. **Integration APIs**: External system integration capabilities

### Roadmap

- **Q1 2026**: Agent versioning and A/B testing
- **Q2 2026**: Performance optimizations and caching
- **Q3 2026**: Custom agent builder UI
- **Q4 2026**: External API integrations

## Support and Maintenance

### Monitoring Alerts

Set up alerts for:
- Agent failure rates exceeding 5%
- Execution times exceeding 10 seconds
- High error volumes (>10 errors/hour)

### Regular Maintenance

- **Weekly**: Review agent performance metrics
- **Monthly**: Update agent specifications as needed
- **Quarterly**: Performance optimization review
- **Annually**: Security and compliance audit

---

*This documentation is maintained alongside the codebase. For questions or issues, consult the monitoring dashboard or review execution logs for specific error details.*