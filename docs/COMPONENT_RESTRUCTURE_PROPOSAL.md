# Component Restructuring Proposal

Based on the analysis of the current `components` directory, we have successfully migrated core domains (`lessons`, `songs`, `assignments`, `users`, `profile`) to the new domain-driven structure. However, there are still inconsistencies with role-based folders (`student`, `teacher`) and the `dashboard` directory.

## Current Issues

1.  **Fragmented Dashboard Logic**: Dashboard components are split between `components/dashboard/{role}` and `components/{role}/dashboard`.
    *   `components/dashboard/student` vs `components/student/dashboard`
    *   `components/dashboard/teacher` vs `components/teacher/dashboard`
2.  **Role-Based vs Domain-Based**: We have top-level `student` and `teacher` directories containing domain logic (e.g., `student/songs`, `student/lessons`). This breaks the domain-driven design where all "Song" logic should be in `components/songs`.

## Proposed Changes

### 1. Consolidate Domain Views
Move role-specific domain views into their respective domain folders. This keeps all logic for a domain in one place.

*   **Songs**:
    *   Move `components/student/songs/*` → `components/songs/student/`
*   **Assignments**:
    *   Move `components/student/assignments/*` → `components/assignments/student/`
*   **Lessons**:
    *   Move `components/student/lessons/*` → `components/lessons/student/`

### 2. Consolidate Dashboard Components
Centralize all dashboard widgets and layouts in `components/dashboard`.

*   **Student Dashboard**:
    *   Move `components/student/dashboard/*` → `components/dashboard/student/`
*   **Teacher Dashboard**:
    *   Move `components/teacher/dashboard/*` → `components/dashboard/teacher/`

### 3. Cleanup
*   Delete top-level `components/student/` directory.
*   Delete top-level `components/teacher/` directory.

## Resulting Structure

```
components/
  assignments/
    form/
    list/
    hooks/
    student/       <-- New (Student views)
  songs/
    form/
    list/
    details/
    student/       <-- New (Student views)
  lessons/
    form/
    list/
    details/
    student/       <-- New (Student views)
  dashboard/
    admin/
    student/       <-- Consolidated
    teacher/       <-- Consolidated
    widgets/       <-- Shared widgets
  ...
```

## Action Plan

1.  Execute file moves.
2.  Update imports across the application.
3.  Verify build and lint.
