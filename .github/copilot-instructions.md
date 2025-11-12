# Guitar CRM - Copilot AI Development Guide

**Quick Navigation:**
- 📚 **All Standards**: [`instructions/STANDARDS-INDEX.md`](./instructions/STANDARDS-INDEX.md)
- 📖 **Folder Guide**: [`.github/README.md`](./README.md)
- 🚀 **Getting Started**: [`instructions/DEVELOPMENT-STANDARDS.md`](./instructions/DEVELOPMENT-STANDARDS.md)
- 🤖 **AI Agents**: See section below
- ⚡ **Slash Commands**: See "Slash Commands" section below

---

## Project Overview

Guitar CRM is a **Next.js 16 + TypeScript** application for guitar teachers to manage students, lessons, songs, and progress tracking.

**Stack**: Next.js 16 | React 19 | TypeScript | Tailwind CSS 4 | Supabase | Jest | TanStack Query

**Status**: ~45% complete - Core schemas & foundation implemented. Auth, UI, lesson management pending.

---

## Development Standards

All development standards documented separately for easy reference:

| Topic | File | Read Time |
|-------|------|-----------|
| **Getting Started** | [`instructions/DEVELOPMENT-STANDARDS.md`](./instructions/DEVELOPMENT-STANDARDS.md) | 5 min |
| **Quick Reference** | [`instructions/STANDARDS-INDEX.md`](./instructions/STANDARDS-INDEX.md) | 3 min |
| **Component Architecture** | [`instructions/component-architecture.instructions.md`](./instructions/component-architecture.instructions.md) | 15 min |
| **API & Data Fetching** | [`instructions/api-data-fetching.instructions.md`](./instructions/api-data-fetching.instructions.md) | 20 min |
| **Error Handling** | [`instructions/error-handling-logging.instructions.md`](./instructions/error-handling-logging.instructions.md) | 15 min |
| **Forms & Validation** | [`instructions/form-validation.instructions.md`](./instructions/form-validation.instructions.md) | 20 min |
| **State Management** | [`instructions/state-management.instructions.md`](./instructions/state-management.instructions.md) | 10 min |
| **Testing (TDD)** | [`instructions/testing-standards.instructions.md`](./instructions/testing-standards.instructions.md) | 15 min |
| **Git & Commits** | [`instructions/git-workflow.instructions.md`](./instructions/git-workflow.instructions.md) | 10 min |
| **Naming Conventions** | [`instructions/naming-conventions.instructions.md`](./instructions/naming-conventions.instructions.md) | 10 min |
| **Performance & Mobile** | [`instructions/performance-optimization.instructions.md`](./instructions/performance-optimization.instructions.md) | 15 min |

**Total**: ~2 hours for full understanding

---

## 🤖 AI Agents (Use with `@agent-name`)

### Architecture & Planning

#### **@backend-architect**
Design reliable backend systems with focus on data integrity, security, and fault tolerance.

**Use for:**
- Backend system design and API development
- Database design and optimization
- Security, reliability, and performance requirements
- Server-side architecture and scalability

**See**: [`agents/backend-architect.md`](./agents/backend-architect.md)

---

#### **@frontend-architect**
Create accessible, performant user interfaces with focus on user experience.

**Use for:**
- UI component development and design system
- Accessibility compliance and WCAG implementation
- Performance optimization and Core Web Vitals
- Responsive design and mobile-first development

**See**: [`agents/frontend-architect.md`](./agents/frontend-architect.md)

---

#### **@system-architect**
Design scalable system architecture with focus on maintainability and long-term technical decisions.

**Use for:**
- System architecture design and scalability analysis
- Architectural pattern evaluation and technology selection
- Dependency management and component boundaries
- Long-term technical strategy and migration planning

**See**: [`agents/system-architect.md`](./agents/system-architect.md)

---

#### **@tech-stack-researcher**
Research technology options and provide recommendations for architecture decisions.

**Use for:**
- Deciding between technology options for new features
- Planning real-time capabilities
- Evaluating new libraries or frameworks
- Choosing build vs. buy approaches

**See**: [`agents/tech-stack-researcher.md`](./agents/tech-stack-researcher.md)

---

#### **@requirements-analyst**
Transform ambiguous project ideas into concrete specifications through systematic requirements discovery.

**Use for:**
- Starting new major features
- Clarifying ambiguous requirements
- Creating PRDs and user stories
- Defining success criteria and acceptance conditions

**See**: [`agents/requirements-analyst.md`](./agents/requirements-analyst.md)

---

### Code Quality & Performance

#### **@refactoring-expert**
Improve code quality and reduce technical debt through systematic refactoring.

**Use for:**
- Addressing technical debt before adding features
- Simplifying complex components or functions
- Applying SOLID principles
- Eliminating code duplication

**See**: [`agents/refactoring-expert.md`](./agents/refactoring-expert.md)

---

#### **@performance-engineer**
Optimize system performance through measurement-driven analysis and bottleneck elimination.

**Use for:**
- Analyzing Core Web Vitals and performance metrics
- Optimizing slow API endpoints
- Reducing bundle size or load times
- Improving database query performance

**See**: [`agents/performance-engineer.md`](./agents/performance-engineer.md)

---

#### **@security-engineer**
Identify security vulnerabilities and ensure compliance with security standards.

**Use for:**
- Reviewing authentication/authorization implementations
- Assessing API endpoint security
- Evaluating data protection measures
- Identifying potential vulnerabilities

**See**: [`agents/security-engineer.md`](./agents/security-engineer.md)

---

### Documentation & Research

#### **@technical-writer**
Create clear, comprehensive documentation for features and systems.

**Use for:**
- Writing API documentation
- Creating feature documentation
- Documenting architectural decisions
- Writing code comments and examples

**See**: [`agents/technical-writer.md`](./agents/technical-writer.md)

---

#### **@learning-guide**
Teach programming concepts progressively and explain complex topics.

**Use for:**
- Understanding how features work in the codebase
- Learning new technologies or patterns
- Explaining why certain decisions were made
- Understanding complex algorithms or systems

**See**: [`agents/learning-guide.md`](./agents/learning-guide.md)

---

#### **@deep-research-agent**
Conduct comprehensive research with adaptive strategies and evidence-based findings.

**Use for:**
- Researching new technologies for adoption
- Investigating complex problems or edge cases
- Gathering best practices from the community
- Understanding industry standards and patterns

**See**: [`agents/deep-research-agent.md`](./agents/deep-research-agent.md)

---

## ⚡ Slash Commands

### Development Commands

#### `/new-task`
Analyze code for performance issues and suggest optimizations.

**See**: [`commands/new-task.md`](./commands/new-task.md)

#### `/code-explain`
Generate detailed code explanations.

**See**: [`commands/misc/code-explain.md`](./commands/misc/code-explain.md)

#### `/code-optimize`
Optimize code for performance.

**See**: [`commands/misc/code-optimize.md`](./commands/misc/code-optimize.md)

#### `/code-cleanup`
Clean up and refactor code.

**See**: [`commands/misc/code-cleanup.md`](./commands/misc/code-cleanup.md)

#### `/feature-plan`
Plan new feature implementation.

**See**: [`commands/misc/feature-plan.md`](./commands/misc/feature-plan.md)

#### `/lint`
Run linting and fix issues.

**See**: [`commands/misc/lint.md`](./commands/misc/lint.md)

#### `/docs-generate`
Generate documentation.

**See**: [`commands/misc/docs-generate.md`](./commands/misc/docs-generate.md)

---

### API Commands

#### `/api-new`
Create new API endpoint.

**See**: [`commands/api/api-new.md`](./commands/api/api-new.md)

#### `/api-test`
Test API endpoints.

**See**: [`commands/api/api-test.md`](./commands/api/api-test.md)

#### `/api-protect`
Add protection & validation to API.

**See**: [`commands/api/api-protect.md`](./commands/api/api-protect.md)

---

### UI Commands

#### `/component-new`
Create React component.

**See**: [`commands/ui/component-new.md`](./commands/ui/component-new.md)

#### `/page-new`
Create Next.js page.

**See**: [`commands/ui/page-new.md`](./commands/ui/page-new.md)

---

### Supabase Commands

#### `/types-gen`
Generate TypeScript types from Supabase schema.

**See**: [`commands/supabase/types-gen.md`](./commands/supabase/types-gen.md)

#### `/edge-function-new`
Create Edge Function.

**See**: [`commands/supabase/edge-function-new.md`](./commands/supabase/edge-function-new.md)

---

## Critical Workflows

### TDD Workflow (MANDATORY)

Strictly follow **Test-Driven Development**:

```bash
npm run new-feature feature-name  # Create branch + TDD reminder
npm run tdd                        # Watch mode with coverage

# TDD cycle: 🔴 Red → 🟢 Green → 🔵 Refactor
```

📖 **Full Guide**: [`instructions/testing-standards.instructions.md`](./instructions/testing-standards.instructions.md)

---

### Quality Checks (MANDATORY)

**Always run before committing:**

```bash
npm run quality  # Linting, types, tests, coverage

# All must pass:
# ✅ npm run lint
# ✅ npm run typecheck
# ✅ npm run test (70% coverage minimum)
# ✅ npm run check:todos
```

---

### Git Workflow

```bash
git checkout -b feature/feature-name
# Make changes following standards
npm run quality
git add . && git commit -m "type(scope): message"  # Conventional Commits
git push
```

📖 **Full Guide**: [`instructions/git-workflow.instructions.md`](./instructions/git-workflow.instructions.md)

---

## Project Structure

```
/app                 ← Next.js App Router pages
/components          ← React components (organized by entity)
/lib                 ← Utilities, Supabase client, API client
/schemas             ← Zod validation schemas
/types               ← TypeScript definitions + generated DB types
/__tests__           ← Test files (mirror source structure)
/supabase            ← Migrations, seeds, backups
/scripts             ← Automation scripts
.github/
  ├── copilot-instructions.md    ← This file
  ├── agents/                    ← AI Agent definitions
  ├── commands/                  ← Slash Commands
  ├── instructions/              ← Development standards
  ├── deployment/                ← Deployment guides
  └── workflows/                 ← CI/CD
```

---

## Essential Commands

```bash
# Development
npm run dev                # Start Next.js dev server
npm run tdd               # Jest watch mode with coverage
npm run quality           # Pre-commit checks

# Database
npm run setup:db          # Start local Supabase
npm run seed              # Populate sample data
npm run backup            # Create anonymized backup

# Deployment
npm run deploy:check      # Production readiness validation
```

See `scripts/README.md` for complete reference.

---

## Setup & Configuration

### Environment Variables

Create `.env.local` (gitignored):

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### First-Time Setup

```bash
npm run setup             # Install deps, create env
npm run setup:db         # Start Supabase (Docker required)
npm run seed             # Add sample data
npm run dev              # Start development
```

---

## Key Concepts

### Type Safety
- **Database types**: Generated in `types/database.types.ts`
- **Zod schemas**: Runtime validation in `schemas/`
- **Pattern**: Always use Zod + TypeScript together

### Components
- **Small files**: Each file ~80 lines max
- **Structure**: List/Form/Detail + hooks + services
- **Separation**: UI, business logic, utilities

### Data Fetching
- **TanStack Query**: All data fetching uses TanStack Query v5
- **Caching**: Automatic with smart invalidation
- **Hooks**: Custom hooks for queries + mutations

### State Management
- **Context API**: Feature-level state
- **TanStack Query**: Server state
- **Zustand**: Global state
- **Rules**: Minimal, co-located, testable

📖 **Full Guide**: [`instructions/state-management.instructions.md`](./instructions/state-management.instructions.md)

---

## User Roles & Permissions

Users can have **multiple roles simultaneously**:

- **Admin** (`isAdmin=true`) - Full system access
- **Teacher** (`isTeacher=true`) - Student/lesson/song management
- **Student** (`isStudent=true`) - View assigned lessons/songs

All role checks are server-side with Supabase RLS policies.

---

## Key Constraints

- **TDD is mandatory** - Write tests before implementation
- **No console.log in production** - Caught by pre-commit
- **Quality checks required** - Always run `npm run quality` before committing
- **Mobile-first required** - Design for mobile first, then scale up
- **Small components** - Keep files < 300 lines, functions < 80 lines
- **Type safety** - Never use `any` types
- **Test coverage** - Minimum 70% (branches, functions, lines, statements)

---

## Quick Reference

**Building UI?**
→ `/component-new` command or [`instructions/component-architecture.instructions.md`](./instructions/component-architecture.instructions.md)

**Fetching data?**
→ [`instructions/api-data-fetching.instructions.md`](./instructions/api-data-fetching.instructions.md)

**Writing tests?**
→ [`instructions/testing-standards.instructions.md`](./instructions/testing-standards.instructions.md)

**Creating API?**
→ `/api-new` command or [`instructions/api-data-fetching.instructions.md`](./instructions/api-data-fetching.instructions.md)

**Need help?**
→ Use relevant AI agent or slash command above

**Looking up standards?**
→ [`instructions/STANDARDS-INDEX.md`](./instructions/STANDARDS-INDEX.md)

**Deploying?**
→ [`deployment/DEPLOYMENT_SETUP.md`](./deployment/DEPLOYMENT_SETUP.md)

---

## Resources

- 📖 **Full Documentation**: `instructions/` folder
- 🚀 **Deployment**: `deployment/DEPLOYMENT_SETUP.md`
- 💾 **Database**: `supabase/migrations/`
- 🔄 **CI/CD**: `workflows/` folder
- 🤖 **AI Agents**: `agents/` folder
- ⚡ **Commands**: `commands/` folder
- 🧪 **Examples**: `components/songs/`, `schemas/`

---

## When In Doubt

1. **Check relevant standards** in `instructions/` folder
2. **Use STANDARDS-INDEX.md** for quick lookup
3. **Run `npm run quality`** to catch issues early
4. **Reference existing patterns** in codebase
5. **Use AI agents** for planning and design
6. **Use slash commands** for specific tasks

---

**Last Updated**: November 12, 2025  
**Version**: 3.0 (Integrated agents & commands, external links)
