# Dashboard Launch Roadmap

> **Goal:** Transform the admin dashboard from a feature-heavy development view into a launch-focused, action-oriented dashboard that helps manage the first students and track business health.

## Current State Analysis

### ✅ Components to Keep (Core Value)
- `TodaysAgenda.tsx` - Daily schedule view
- `NotificationsAlertsSection.tsx` - Surfaces problems
- `QuickActionsSection.tsx` - Fast access to common tasks
- `StudentList.tsx` - Student management with filters
- `LessonStatsOverview.tsx` - Basic lesson tracking
- `StatsCard.tsx` - Reusable stats display
- `WelcomeTour.tsx` - Onboarding (keep for now)

### ⚠️ Components to Hide/Move (Premature for Launch)
- `StudentProgressInsights.tsx` - AI feature, needs data
- `AdminDashboardInsights.tsx` - AI feature, needs data
- `EmailDraftGenerator.tsx` - AI feature, can email manually
- `AnalyticsCharts.tsx` - No historical data yet
- `BearerTokenCard.tsx` - Developer tool
- `LessonStatsCharts.tsx` - Detailed charts unnecessary
- `SongStatsCharts.tsx` - Detailed charts unnecessary

### 🚨 Components to Create (Launch-Critical)
- `NeedsAttentionCard.tsx` - Students requiring outreach
- `WeeklySummaryCard.tsx` - Simple weekly stats
- `StudentPipeline.tsx` - Visual funnel tracking
- `StudentHealthTable.tsx` - Retention monitoring

---

## Phase 1: Minimal Viable Dashboard
**Priority:** 🔴 Critical | **Effort:** 2-4 hours | **Goal:** Clean, focused launch view

### TODO List

#### 1.1 Create Settings Page for Developer Tools
- [ ] Create `/app/dashboard/settings/page.tsx`
- [ ] Move `BearerTokenCard` to settings page
- [ ] Add link to Developer Documentation on settings page
- [ ] Add sidebar navigation item for Settings

**Files to modify:**
- Create: `app/dashboard/settings/page.tsx`
- Modify: `components/navigation/Sidebar.tsx` (add Settings link)

#### 1.2 Create "This Week" Summary Card
- [ ] Create `components/dashboard/WeeklySummaryCard.tsx`
- [ ] Fetch weekly stats: lessons completed, new students, songs assigned
- [ ] Create API endpoint `/api/stats/weekly` if needed
- [ ] Simple 3-column card layout

**Component Structure:**
```tsx
interface WeeklySummaryCardProps {
  lessonsCompleted: number;
  newStudents: number;
  songsAssigned: number;
  weekLabel: string; // e.g., "Jan 1-7, 2026"
}
```

#### 1.3 Create "Needs Attention" Card
- [ ] Create `components/dashboard/NeedsAttentionCard.tsx`
- [ ] Query students with no lessons in last 14 days
- [ ] Query students with overdue assignments
- [ ] Query students with no recent activity
- [ ] Create API endpoint `/api/students/needs-attention`
- [ ] Show max 5 items with "View All" link

**Component Structure:**
```tsx
interface AttentionItem {
  id: string;
  studentName: string;
  reason: 'no_recent_lesson' | 'overdue_assignment' | 'inactive';
  daysAgo: number;
  actionUrl: string;
}
```

#### 1.4 Update TeacherDashboardClient Layout
- [ ] Remove AI-Powered Insights section (lines ~195-225)
- [ ] Remove AnalyticsCharts component
- [ ] Remove BearerTokenCard from main view
- [ ] Add WeeklySummaryCard in place of complex analytics
- [ ] Add NeedsAttentionCard to priority zone
- [ ] Reorganize grid layout for cleaner hierarchy

**New Layout Structure:**
```
┌─────────────────────────────────────────────────────┐
│ Welcome Header                                      │
├─────────────────────────────────────────────────────┤
│ NotificationsAlertsSection                          │
├─────────────────────────────────────────────────────┤
│ [LessonStatsOverview 2/3] [TodaysAgenda 1/3]       │
├─────────────────────────────────────────────────────┤
│ [NeedsAttentionCard 1/2]  [WeeklySummaryCard 1/2]  │
├─────────────────────────────────────────────────────┤
│ [StudentList 2/3]         [RecentActivity 1/3]     │
│                           [AssignmentList]          │
├─────────────────────────────────────────────────────┤
│ [SongLibrary]             [ProgressChart]           │
├─────────────────────────────────────────────────────┤
│ Admin Stats (5 cards) - Keep as-is                  │
├─────────────────────────────────────────────────────┤
│ QuickActionsSection (move to floating or sidebar?)  │
└─────────────────────────────────────────────────────┘
```

#### 1.5 Simplify Admin Stats Section
- [ ] Keep the 5 StatsCard components (Users, Teachers, Students, Songs, Lessons)
- [ ] Remove the link to Developer Documentation (moved to Settings)
- [ ] Consider making section collapsible (optional)

---

## Phase 2: Student Pipeline Tracking
**Priority:** 🟡 High | **Effort:** 4-6 hours | **Goal:** Visualize student journey and conversion

### TODO List

#### 2.1 Database Schema Updates
- [ ] Add `student_status` enum to profiles or create new table
- [ ] Possible values: `lead`, `trial`, `active`, `inactive`, `churned`
- [ ] Add `status_changed_at` timestamp
- [ ] Add `lead_source` field (optional: how did they find you?)
- [ ] Create migration file

**Migration SQL:**
```sql
-- Create enum type
CREATE TYPE student_status AS ENUM ('lead', 'trial', 'active', 'inactive', 'churned');

-- Add columns to profiles
ALTER TABLE profiles 
ADD COLUMN student_status student_status DEFAULT 'lead',
ADD COLUMN status_changed_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN lead_source TEXT;

-- Create index for quick filtering
CREATE INDEX idx_profiles_student_status ON profiles(student_status);
```

#### 2.2 Create Student Pipeline Component
- [ ] Create `components/dashboard/StudentPipeline.tsx`
- [ ] Visual funnel with 4-5 stages
- [ ] Click on stage to filter student list
- [ ] Show count and percentage at each stage
- [ ] Add conversion rate between stages

**Component Structure:**
```tsx
interface PipelineStage {
  id: 'lead' | 'trial' | 'active' | 'inactive' | 'churned';
  label: string;
  count: number;
  color: string;
  icon: LucideIcon;
}

interface StudentPipelineProps {
  stages: PipelineStage[];
  onStageClick: (stageId: string) => void;
}
```

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ 📊 Student Pipeline                                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐          │
│  │  3  │ →  │  2  │ →  │  8  │    │  1  │          │
│  │Leads│    │Trial│    │Active│   │Risk │          │
│  └─────┘    └─────┘    └─────┘    └─────┘          │
│                                                     │
│  Conversion: Lead→Trial: 67% | Trial→Active: 75%   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### 2.3 Create API Endpoints
- [ ] Create `/api/students/pipeline` - Get counts by status
- [ ] Create `/api/students/[id]/status` - Update student status
- [ ] Add status filter to existing `/api/users` endpoint

#### 2.4 Create Status Change Actions
- [ ] Create server action `updateStudentStatus`
- [ ] Add status dropdown to student detail page
- [ ] Log status changes in activity log
- [ ] Optional: Trigger notification when student goes "inactive"

#### 2.5 Integrate Pipeline into Dashboard
- [ ] Add StudentPipeline component above StudentList
- [ ] Wire up stage click to filter StudentList
- [ ] Add pipeline stats to admin overview section

---

## Phase 3: Student Health Dashboard
**Priority:** 🟢 Medium | **Effort:** 6-8 hours | **Goal:** Proactive retention monitoring

### TODO List

#### 3.1 Define Health Score Algorithm
- [ ] Create `lib/utils/studentHealth.ts`
- [ ] Define scoring criteria and weights

**Health Score Calculation:**
```typescript
interface HealthFactors {
  daysSinceLastLesson: number;      // Weight: 30%
  lessonsPerMonth: number;           // Weight: 25%
  assignmentCompletionRate: number;  // Weight: 20%
  daysSinceLastContact: number;      // Weight: 15%
  totalLessonsCompleted: number;     // Weight: 10%
}

type HealthStatus = 'excellent' | 'good' | 'needs_attention' | 'at_risk' | 'critical';

// Score thresholds:
// 80-100: Excellent (green)
// 60-79: Good (light green)
// 40-59: Needs Attention (yellow)
// 20-39: At Risk (orange)
// 0-19: Critical (red)
```

#### 3.2 Create Student Health API
- [ ] Create `/api/students/health` endpoint
- [ ] Calculate health score for each student
- [ ] Return sorted by health score (worst first)
- [ ] Include recommended action for each student

**API Response:**
```typescript
interface StudentHealth {
  id: string;
  name: string;
  email: string;
  healthScore: number;
  healthStatus: HealthStatus;
  lastLesson: Date | null;
  lessonsThisMonth: number;
  overdueAssignments: number;
  recommendedAction: string;
}
```

#### 3.3 Create Student Health Table Component
- [ ] Create `components/dashboard/StudentHealthTable.tsx`
- [ ] Sortable columns (health, last lesson, lessons/month)
- [ ] Color-coded health indicators
- [ ] Quick action buttons (schedule lesson, send message)
- [ ] Expandable row for details

**Component Structure:**
```tsx
interface StudentHealthTableProps {
  students: StudentHealth[];
  onScheduleLesson: (studentId: string) => void;
  onSendMessage: (studentId: string) => void;
  onViewProfile: (studentId: string) => void;
}
```

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🏥 Student Health Monitor                        [Export CSV]   │
├──────────┬──────────┬────────────┬───────────┬─────────────────┤
│ Student  │ Health   │ Last Lesson│ Lessons/Mo│ Actions         │
├──────────┼──────────┼────────────┼───────────┼─────────────────┤
│ Sarah M. │ 🔴 23    │ 14 days    │ 1         │ [📅] [✉️] [👤] │
│ Mike T.  │ 🟡 45    │ 7 days     │ 2         │ [📅] [✉️] [👤] │
│ John D.  │ 🟢 85    │ 2 days     │ 4         │ [📅] [✉️] [👤] │
└──────────┴──────────┴────────────┴───────────┴─────────────────┘
```

#### 3.4 Add Health Alerts
- [ ] Create `components/dashboard/HealthAlertsBanner.tsx`
- [ ] Show prominent banner if any student is "critical"
- [ ] Auto-hide after viewing/dismissing
- [ ] Link to full health dashboard

#### 3.5 Create Health Dashboard Page
- [ ] Create `/app/dashboard/health/page.tsx`
- [ ] Full-page health monitoring view
- [ ] Filters by health status
- [ ] Bulk actions (send reminder to all at-risk)
- [ ] Historical health trend chart (optional)

#### 3.6 Integrate Health Summary into Main Dashboard
- [ ] Add small health summary widget
- [ ] Show: X healthy, Y need attention, Z at risk
- [ ] Click through to full health page

---

## Implementation Order

### Week 1: Phase 1 (MVP Dashboard)
| Day | Task | Hours |
|-----|------|-------|
| 1 | Create Settings page, move BearerToken | 1h |
| 1 | Create WeeklySummaryCard component | 1h |
| 2 | Create NeedsAttentionCard + API | 2h |
| 2 | Update TeacherDashboardClient layout | 2h |
| 3 | Testing and polish | 1h |

### Week 2: Phase 2 (Pipeline)
| Day | Task | Hours |
|-----|------|-------|
| 1 | Database migration for student_status | 1h |
| 1-2 | Create StudentPipeline component | 2h |
| 2 | Create pipeline API endpoints | 1.5h |
| 3 | Integrate into dashboard | 1.5h |
| 3 | Testing and polish | 1h |

### Week 3: Phase 3 (Health)
| Day | Task | Hours |
|-----|------|-------|
| 1 | Create health score algorithm | 1.5h |
| 1-2 | Create health API endpoint | 1.5h |
| 2 | Create StudentHealthTable component | 2h |
| 3 | Create health dashboard page | 2h |
| 3 | Integrate into main dashboard | 1h |

---

## File Structure After Implementation

```
components/dashboard/
├── admin/
│   ├── ... (existing AI tools - keep but don't show on main dashboard)
├── health/
│   ├── StudentHealthTable.tsx      (NEW - Phase 3)
│   ├── HealthAlertsBanner.tsx      (NEW - Phase 3)
│   └── HealthScoreIndicator.tsx    (NEW - Phase 3)
├── pipeline/
│   ├── StudentPipeline.tsx         (NEW - Phase 2)
│   ├── PipelineStage.tsx           (NEW - Phase 2)
│   └── ConversionMetrics.tsx       (NEW - Phase 2)
├── NeedsAttentionCard.tsx          (NEW - Phase 1)
├── WeeklySummaryCard.tsx           (NEW - Phase 1)
├── ... (existing components)

app/dashboard/
├── health/
│   └── page.tsx                    (NEW - Phase 3)
├── settings/
│   └── page.tsx                    (NEW - Phase 1)
├── ... (existing pages)

lib/utils/
├── studentHealth.ts                (NEW - Phase 3)

app/api/
├── stats/
│   └── weekly/
│       └── route.ts                (NEW - Phase 1)
├── students/
│   ├── needs-attention/
│   │   └── route.ts                (NEW - Phase 1)
│   ├── pipeline/
│   │   └── route.ts                (NEW - Phase 2)
│   └── health/
│       └── route.ts                (NEW - Phase 3)
```

---

## Success Metrics

### Phase 1 Success
- [ ] Dashboard loads in under 2 seconds
- [ ] All critical info visible without scrolling (on desktop)
- [ ] "Needs Attention" shows accurate data
- [ ] Developer tools no longer clutter main view

### Phase 2 Success
- [ ] Can track a student from lead to active
- [ ] Conversion rates are visible
- [ ] Can filter students by pipeline stage
- [ ] Status changes are logged

### Phase 3 Success
- [ ] Health scores update daily
- [ ] At-risk students are immediately visible
- [ ] Can take action directly from health table
- [ ] Retention improves (measure after 30 days)

---

## Notes

### Design Considerations
- Use shadcn/ui components for consistency
- Keep mobile responsiveness in mind
- Use skeleton loaders for async data
- Add empty states for each component

### Future Enhancements (Post-Launch)
- [ ] Email automation for at-risk students
- [ ] Revenue tracking and forecasting
- [ ] Student goal tracking
- [ ] Lesson feedback/ratings
- [ ] Calendar integration (Google Calendar sync)
- [ ] SMS notifications
- [ ] Re-enable AI insights after 20+ students

### Technical Debt to Address
- [ ] Consider using React Query for all dashboard data
- [ ] Add error boundaries around each card
- [ ] Add analytics/telemetry for dashboard usage
- [ ] Create dashboard E2E tests
