# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Strummy is a student management system for guitar teachers built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and Supabase (PostgreSQL, Auth, RLS).

**Current Version**: 0.65.0

## Commands

```bash
# Development
npm run dev              # Start dev server (uses nodemon)
npm run build            # Production build
npm run lint             # Run ESLint

# Testing
npm test                 # Run Jest unit tests
npm test -- --watch      # Watch mode
npm run test:coverage    # With coverage report
npm run test:integration # Run Jest integration tests
npm run test:all         # Run unit + integration tests
npx playwright test      # Run E2E tests (Playwright)

# Database
npm run setup:db         # Set up Supabase database
npm run seed             # Add sample data

# Version Management (automated post-merge via GitHub Action)
# Branch prefix determines bump type: feature/ → minor, fix/ → patch, etc.
# Override with PR labels: version:major, version:minor, version:patch
# Manual bump only needed for hotfixes to production branch
```

## Development Workflow (Summary)

> Full details: `.claude/agents/git-workflow.md`

1. **Start with a Linear ticket** -- all work tracked as `STRUM-XXX`
2. **Branch from `main`** -- `feature/STRUM-XXX-description`, `fix/...`, `refactor/...`
3. **Commit format** -- `type(scope): description [STRUM-XXX]`
4. **Test before push** -- `npm run lint && npm test`
5. **Version bumps automatically on merge** -- patch (fix), minor (feature), major (label override)
6. **Create PR** -- title `[STRUM-XXX] Description`, link Linear ticket
7. **Squash and Merge** to `main` → verify on Preview → merge to `production`

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 App Router, React 19, Tailwind CSS 4, TanStack Query
- **Backend**: Supabase (PostgreSQL with RLS), Server Actions
- **Validation**: Zod schemas in `/schemas`
- **AI**: OpenRouter (cloud) and Ollama (local) via abstraction layer in `/lib/ai`
- **Testing**: Jest (unit + integration), Playwright (E2E)

### Directory Structure
- `/app` -- Next.js App Router pages, API routes, Server Actions
- `/components` -- React components organized by domain (lessons, songs, users, etc.)
- `/lib` -- Business logic: `/lib/ai` (AI providers), `/lib/services`, `/lib/supabase`
- `/schemas` -- Zod validation schemas
- `/types` -- TypeScript type definitions
- `/supabase` -- Database migrations
- `.claude/agents/` -- Specialized AI agent configurations

### Role-Based Access Control
Three roles enforced via Supabase RLS: **Admin**, **Teacher**, **Student**. Currently teacher dashboard displays admin view (owner is only teacher).

### Database Connection
Dual connections: local Supabase (`127.0.0.1:54321`) for development, remote for production. Configured via `NEXT_PUBLIC_SUPABASE_LOCAL_*` and `NEXT_PUBLIC_SUPABASE_REMOTE_*` env vars.

## Agents Architecture

Specialized AI agents live in `.claude/agents/`. Each agent has a focused responsibility, defined tools, and quality standards.

### Agent Catalog

#### Core Development
| Agent | File | Purpose |
|-------|------|---------|
| **Feature Developer** | `feature-developer.md` | New features: Next.js/React/Supabase patterns, RSC-optimized, Zod validation |
| **UI Engineer** | `ui-engineer.md` | UI: shadcn/ui, Radix UI, Tailwind CSS 4, Framer Motion, mobile-first |
| **Refactoring Specialist** | `refactoring-specialist.md` | Split oversized files, eliminate `any` types, enforce SRP |
| **Test Engineer** | `test-engineer.md` | Unit (Jest), integration (Jest), E2E (Playwright) |
| **Git Workflow** | `git-workflow.md` | Branching, commits, Linear linking, versioning, PR lifecycle |

#### Database & Supabase
| Agent | File | Purpose |
|-------|------|---------|
| **Database Ops** | `database-ops.md` | Schema changes, migrations, RLS policies, query optimization |
| **Supabase Schema Architect** | `supabase-schema-architect.md` | Schema design (3NF+), migration management, RLS architecture |
| **Supabase Realtime Optimizer** | `supabase-realtime-optimizer.md` | WebSocket connections, subscriptions, message batching |

#### DevOps & Quality
| Agent | File | Purpose |
|-------|------|---------|
| **Deployment Ops** | `deployment-ops.md` | Vercel deployments, CI/CD, cron health, incident response (P0-P3) |
| **PR Manager** | `pr-manager.md` | Creates PRs, links to Linear, quality gates, version bumps |
| **PR Reviewer** | `pr-reviewer.md` | 10-pass code review: quality, security, testing, performance |
| **Security Reviewer** | `security-reviewer.md` | Security audits, auth flows, secret detection, RLS review |
| **Observability Engineer** | `observability-engineer.md` | Monitoring, logging, Sentry, health checks, Vercel Analytics |

#### Project Management & Domain
| Agent | File | Purpose |
|-------|------|---------|
| **Linear Coordinator** | `linear-coordinator.md` | Issue lifecycle, sprint planning, milestone tracking |
| **Instagram API Specialist** | `instagram-api-specialist.md` | Instagram Graph API, publishing flow, token management |

### Agent Selection Guide

```
New feature?            → feature-developer + ui-engineer
Database change?        → database-ops or supabase-schema-architect
Writing tests?          → test-engineer
Code too large/messy?   → refactoring-specialist
Git/branching/version?  → git-workflow
Creating a PR?          → pr-manager
Reviewing a PR?         → pr-reviewer
Security concern?       → security-reviewer
Deploy/CI issue?        → deployment-ops
Monitoring/logging?     → observability-engineer
Realtime subscriptions? → supabase-realtime-optimizer
Linear tickets/sprints? → linear-coordinator
Instagram API?          → instagram-api-specialist
```

### Agent Conventions
- All agents enforce **<150 LOC per file** and **no `any` types**
- All agents follow the Linear ticket workflow (`[STRUM-XXX]` in commits)
- Database agents enforce **RLS on all tables**
- All agents require **tests before merging** (70% coverage minimum)

## Code Conventions

### Component Organization
```
components/<domain>/<Feature>/
├── index.ts              # Re-exports
├── Feature.tsx           # Main component
├── Feature.Header.tsx    # Sub-components use Parent.Section.tsx naming
├── useFeature.ts         # Custom hook
└── feature.helpers.ts    # Pure utility functions
```

### Naming
- **Components/Types**: PascalCase (`StudentLesson.tsx`)
- **Functions/Variables**: camelCase (`fetchLessons()`)
- **Booleans**: `is/has/can` prefix (`isLoading`)
- **Hooks**: `use` prefix (`useStudentLesson`)
- **Sub-components**: `Parent.Section.tsx` (`StudentLesson.Song.tsx`)

### Size Limits (Enforced)
- Component file: Max 200 LOC
- Hook file: Max 150 LOC
- Function body: Max 50 LOC

### UI Components
**MANDATORY**: When creating or modifying ANY UI component, ALWAYS use the shadcn MCP server (configured in `.mcp.json`) to look up available components, check their APIs, and install new ones. Never guess at shadcn/ui component APIs or props -- query the MCP server first. Extend existing components rather than building from scratch.

### Form Validation
- Validate on blur, not on every keystroke
- Use Zod schemas from `/schemas`
- Clear errors when user starts typing

### Styling
Mobile-first with Tailwind breakpoints. Always include `dark:` variants.

## Testing

**TDD workflow**: Write failing test → Implement → Refactor

**Pyramid**: 70% unit (Jest), 20% integration (Jest), 10% E2E (Playwright)

- **Unit tests**: `npm test` — runs ~60 suites, ~1100+ tests
- **Integration tests**: `npm run test:integration` — uses `jest.config.integration.ts`
- **E2E tests**: `npx playwright test` — 5 core journey specs
- **All Jest tests**: `npm run test:all`

Integration test helpers live in `lib/testing/integration-helpers.ts`.
Tests live in `/__tests__` mirroring source structure.

## Deployment

- **`main`** → Preview/Staging (`https://strummy-preview.vercel.app`)
- **`production`** → Production (`https://strummy.app`)

> Full release process, checklist, and incident response: `.claude/agents/deployment-ops.md` and `.claude/agents/git-workflow.md`

## Dev Credentials (Local Only)
```
Admin: p.romanczuk@gmail.com / test123_admin
Teacher: teacher@example.com / test123_teacher
Student: student@example.com / test123_student
```
Seed with: `npm run seed`
