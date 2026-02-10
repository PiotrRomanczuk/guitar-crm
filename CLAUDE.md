# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Strummy is a student management system for guitar teachers built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and Supabase (PostgreSQL, Auth, RLS).

**Current Version**: 0.65.0

## Commands

### Development
```bash
npm run dev              # Start dev server (uses nodemon)
npm run build            # Production build
npm run lint             # Run ESLint
```

### Testing
```bash
npm test                 # Run Jest unit tests
npm test -- --watch      # Watch mode
npm test -- SongSchema   # Run specific test file
npm run test:coverage    # With coverage report

# Cypress E2E
npm run cypress:open     # Interactive mode
npm run cypress:run      # Headless
npm run test:smoke       # Smoke tests only
npm run test:e2e:all     # All E2E tests
```

### Database
```bash
npm run setup:db         # Set up Supabase database
npm run seed             # Add sample data
npm run db:inspect       # Inspect database
```

### Version Management
```bash
npm version patch        # 0.65.0 → 0.65.1 (bug fixes)
npm version minor        # 0.65.0 → 0.66.0 (new features)
npm version major        # 0.65.0 → 1.0.0 (breaking changes)
```

## Development Workflow

### ALWAYS Follow This Process

1. **Start with a Linear Ticket** (MANDATORY)
   - All work MUST be tracked in Linear
   - Never start coding without a ticket
   - Ticket ID format: `STRUM-XXX` (e.g., `STRUM-123`)

2. **Create a Feature Branch**
   - ALWAYS work in branches, NEVER commit directly to `main` or `production`
   - Branch naming convention (strict):
     ```bash
     feature/STRUM-XXX-short-description    # New features
     fix/STRUM-XXX-short-description        # Bug fixes
     refactor/STRUM-XXX-short-description   # Code refactoring
     test/STRUM-XXX-short-description       # Test improvements
     docs/STRUM-XXX-short-description       # Documentation
     chore/STRUM-XXX-short-description      # Maintenance tasks
     ```
   - Examples:
     ```bash
     git checkout -b feature/STRUM-123-add-lesson-reminders
     git checkout -b fix/STRUM-124-song-progress-calculation
     git checkout -b refactor/STRUM-125-user-service-cleanup
     ```

3. **Link Everything to Linear**
   - Commit messages MUST reference ticket:
     ```bash
     git commit -m "feat(lessons): add email reminders [STRUM-123]"
     git commit -m "fix(songs): correct progress calculation [STRUM-124]"
     git commit -m "refactor(users): simplify service layer [STRUM-125]"
     ```
   - Commit message format: `type(scope): description [TICKET-ID]`
   - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`

4. **Update Version Frequently**
   - Update `package.json` version for EVERY meaningful change
   - Guidelines:
     - **Patch** (0.65.X): Bug fixes, small improvements, refactoring
     - **Minor** (0.X.0): New features, new components, significant enhancements
     - **Major** (X.0.0): Breaking changes, major rewrites, architecture changes
   - Example workflow:
     ```bash
     # After completing a bug fix
     npm version patch -m "fix: resolve song mastery calculation [STRUM-124]"

     # After adding a feature
     npm version minor -m "feat: add lesson reminder system [STRUM-123]"

     # After a breaking change
     npm version major -m "feat!: redesign authentication flow [STRUM-130]"
     ```
   - This creates better project documentation and changelog

5. **Test Before Committing**
   ```bash
   npm run lint                    # Check code style
   npm test                        # Run unit tests
   npm run test:smoke              # Run smoke tests
   npm run pre-commit              # Full pre-commit checks
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/STRUM-123-add-lesson-reminders
   ```
   - PR title format: `[STRUM-123] Add lesson reminder system`
   - PR description template:
     ```markdown
     ## Linear Ticket
     Closes STRUM-123

     ## Changes
     - Added email reminder service
     - Created notification scheduler
     - Added reminder preferences to user settings

     ## Testing
     - [ ] Unit tests added and passing
     - [ ] E2E tests added and passing
     - [ ] Manually tested on local environment
     - [ ] Tested on mobile devices

     ## Screenshots
     [If UI changes, add screenshots]

     ## Version
     - Bumped from 0.65.0 → 0.66.0
     ```

7. **Code Review Process**
   - Request review from at least one team member
   - Address all comments before merging
   - Ensure all CI checks pass (tests, lint, build)
   - Keep PRs small and focused (ideally < 500 LOC)

8. **Merge Strategy**
   - Use **Squash and Merge** for feature branches
   - Merge to `main` first (creates Preview deployment)
   - Verify on Preview environment
   - Then merge `main` → `production` for release

9. **After Merge**
   - Update Linear ticket status to "Done"
   - Delete feature branch
   - Monitor deployment in Vercel
   - Verify feature in production

### Branch Protection Rules

- **`main` branch**: Protected, requires PR + approval
- **`production` branch**: Protected, requires PR + approval + all checks passing
- **Feature branches**: Can be pushed directly, deleted after merge

### Working with Linear

1. **Ticket States** (must follow):
   - **Backlog** → **Todo** → **In Progress** → **In Review** → **Done**

2. **Update Linear Ticket**:
   - Move to "In Progress" when starting work
   - Add branch name to ticket description
   - Move to "In Review" when PR is created
   - Add PR link to ticket
   - Move to "Done" after merge

3. **Linear Integration with Git**:
   - Linear auto-links commits containing ticket IDs
   - PR descriptions with "Closes STRUM-XXX" auto-close tickets
   - Use Linear's GitHub integration for automatic updates

### Versioning Best Practices

**IMPORTANT**: Update version frequently for better project documentation

- **Every bug fix**: Bump patch version
- **Every feature**: Bump minor version
- **Every breaking change**: Bump major version
- **Keep CHANGELOG.md updated**: Document all changes

Example changelog entry:
```markdown
## [0.66.0] - 2026-02-09
### Added
- Lesson reminder email system [STRUM-123]
- User notification preferences [STRUM-123]
- Scheduler for automated reminders [STRUM-123]

### Fixed
- Song progress calculation bug [STRUM-124]
- User dashboard loading state [STRUM-126]
```

### Quick Reference

```bash
# Start new feature
linear issue create                               # Create ticket
git checkout -b feature/STRUM-XXX-description    # Create branch
# ... make changes ...
npm version minor                                # Bump version
npm test && npm run lint                         # Test
git add .                                        # Stage changes
git commit -m "feat(scope): description [STRUM-XXX]"  # Commit
git push origin feature/STRUM-XXX-description    # Push
# ... create PR on GitHub ...
# ... after merge ...
git checkout main && git pull                    # Update main
git branch -d feature/STRUM-XXX-description      # Delete branch
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 App Router, React 19, Tailwind CSS 4, TanStack Query
- **Backend**: Supabase (PostgreSQL with RLS), Server Actions
- **Validation**: Zod schemas in `/schemas`
- **AI**: OpenRouter (cloud) and Ollama (local) via abstraction layer in `/lib/ai`
- **Testing**: Jest (70% unit), Cypress (E2E)

### Directory Structure
- `/app` - Next.js App Router pages, API routes, Server Actions
- `/components` - React components organized by domain (lessons, songs, users, etc.)
- `/lib` - Business logic: `/lib/ai` (AI providers), `/lib/services`, `/lib/supabase`
- `/schemas` - Zod validation schemas
- `/types` - TypeScript type definitions
- `/supabase` - Database migrations

### Role-Based Access Control
Three roles enforced via Supabase RLS: **Admin**, **Teacher**, **Student**. Currently teacher dashboard displays admin view (owner is only teacher).

### Database Connection
Supports dual connections: local Supabase (`127.0.0.1:54321`) for development, remote for production. Configured via `NEXT_PUBLIC_SUPABASE_LOCAL_*` and `NEXT_PUBLIC_SUPABASE_REMOTE_*` env vars.

## Code Conventions

### Component Organization
Domain components use this structure:
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
Always check shadcn/ui first (`npx shadcn@latest add [component]`). Extend existing components rather than building from scratch.

### Form Validation
- Validate on blur, not on every keystroke
- Use Zod schemas from `/schemas`
- Clear errors when user starts typing

### Styling
Mobile-first with Tailwind breakpoints. Always include `dark:` variants.

## Testing

**TDD workflow**: Write failing test → Implement → Refactor

**Pyramid**: 70% unit (Jest), 20% integration, 10% E2E (Cypress)

**Coverage threshold**: 70% minimum

Tests live in `/__tests__` mirroring source structure.

## Deployment

### Environments

- **`main` branch** → Preview/Staging (Vercel)
  - Automatic deployment on push
  - URL: `https://strummy-preview.vercel.app`
  - Used for QA and testing before production

- **`production` branch** → Production (Vercel)
  - Requires manual merge from `main`
  - URL: `https://strummy.app`
  - Only merge after verifying on Preview

### Release Process

1. **Merge feature → `main`**
   ```bash
   # Create PR: feature/STRUM-XXX → main
   # After approval and CI passes
   # Use "Squash and Merge"
   ```

2. **Verify on Preview**
   - Wait for Vercel deployment (~2-3 min)
   - Test on Preview environment
   - Check Vercel logs for errors
   - Verify database migrations (if any)

3. **Deploy to Production**
   ```bash
   # Create PR: main → production
   # After final verification
   git checkout production
   git merge main
   git push origin production
   ```

4. **Post-Deployment**
   - Monitor Vercel deployment logs
   - Check Sentry for errors
   - Verify critical user flows
   - Update Linear ticket to "Done"
   - Announce release in team channel

### Deployment Checklist

- [ ] All tests passing (unit + E2E)
- [ ] Version bumped in `package.json`
- [ ] CHANGELOG.md updated
- [ ] Linear ticket linked in PR
- [ ] Code reviewed and approved
- [ ] Feature verified on Preview
- [ ] No errors in Vercel logs
- [ ] Database migrations tested (if applicable)
- [ ] Environment variables updated (if needed)

## Common Workflows

### Starting a New Feature

```bash
# 1. Create Linear ticket (or get assigned one): STRUM-XXX
# 2. Create and checkout feature branch
git checkout main
git pull origin main
git checkout -b feature/STRUM-XXX-add-lesson-reminders

# 3. Make your changes (follow TDD!)
npm test -- --watch

# 4. Run quality checks
npm run lint
npm test
npm run test:smoke

# 5. Bump version and update changelog
npm version minor -m "feat: add lesson reminder system [STRUM-XXX]"
# Edit CHANGELOG.md to add your changes

# 6. Commit with proper format
git add .
git commit -m "feat(lessons): add email reminder system [STRUM-XXX]"

# 7. Push and create PR
git push origin feature/STRUM-XXX-add-lesson-reminders
# Create PR on GitHub, link Linear ticket, request review

# 8. After merge, clean up
git checkout main
git pull origin main
git branch -d feature/STRUM-XXX-add-lesson-reminders
```

### Fixing a Bug

```bash
# 1. Create Linear ticket: STRUM-XXX (if not exists)
# 2. Create fix branch
git checkout -b fix/STRUM-XXX-song-progress-calculation

# 3. Write failing test first (TDD!)
npm test -- SongProgress --watch

# 4. Fix the bug
# 5. Verify all tests pass
npm test
npm run test:smoke

# 6. Bump patch version
npm version patch -m "fix: resolve song progress calculation [STRUM-XXX]"

# 7. Update CHANGELOG.md
# 8. Commit and push
git add .
git commit -m "fix(songs): correct progress calculation logic [STRUM-XXX]"
git push origin fix/STRUM-XXX-song-progress-calculation

# 9. Create PR, link ticket, request review
```

### Refactoring Code

```bash
# 1. Create Linear ticket: STRUM-XXX
# 2. Create refactor branch
git checkout -b refactor/STRUM-XXX-simplify-user-service

# 3. Ensure all existing tests pass BEFORE refactoring
npm test

# 4. Refactor code (behavior should NOT change)
# 5. Ensure all tests STILL pass
npm test

# 6. Bump patch version (refactoring = patch)
npm version patch -m "refactor: simplify user service layer [STRUM-XXX]"

# 7. Update CHANGELOG.md
# 8. Commit and push
git add .
git commit -m "refactor(users): simplify service layer [STRUM-XXX]"
git push origin refactor/STRUM-XXX-simplify-user-service
```

### Hotfix to Production

```bash
# 1. Create critical bug ticket: STRUM-XXX
# 2. Create hotfix from production branch
git checkout production
git pull origin production
git checkout -b fix/STRUM-XXX-critical-auth-bug

# 3. Write test, fix bug, verify
npm test
npm run test:smoke

# 4. Bump patch version
npm version patch -m "fix!: resolve critical auth bug [STRUM-XXX]"

# 5. Update CHANGELOG.md
# 6. Commit
git add .
git commit -m "fix(auth)!: resolve critical security bug [STRUM-XXX]"

# 7. Push and create PR to production
git push origin fix/STRUM-XXX-critical-auth-bug
# Create PR: fix/STRUM-XXX → production
# After merge, also merge production → main to sync
```

### Release to Production

```bash
# 1. Ensure all features on main are tested on Preview
# 2. Create release PR
git checkout main
git pull origin main

# 3. Review CHANGELOG.md, ensure all changes documented
# 4. Create PR: main → production
# 5. After approval, merge
git checkout production
git pull origin production
git merge main
git push origin production

# 6. Monitor deployment
# - Check Vercel logs
# - Verify on production URL
# - Monitor Sentry for errors

# 7. Tag the release
git tag -a v0.66.0 -m "Release v0.66.0: Lesson reminders and notifications"
git push origin v0.66.0

# 8. Update Linear tickets to "Done"
```

## Resources

### Documentation
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS 4 Docs](https://tailwindcss.com/docs)

### Tools
- [Linear](https://linear.app) - Project management and issue tracking
- [Vercel](https://vercel.com) - Deployment and hosting
- [Sentry](https://sentry.io) - Error monitoring
- [GitHub](https://github.com) - Source control

### Internal Resources
- `.github/instructions/` - Detailed development standards
- `.github/agents/` - AI agent configurations
- `scripts/` - Utility scripts for development

## Dev Credentials (Local Only)
```
Admin: p.romanczuk@gmail.com / test123_admin
Teacher: teacher@example.com / test123_teacher
Student: student@example.com / test123_student
```
Seed with: `npm run seed`

---

**Remember**: Always use Linear, always create branches, always bump versions. This creates excellent project documentation and makes collaboration smoother!
