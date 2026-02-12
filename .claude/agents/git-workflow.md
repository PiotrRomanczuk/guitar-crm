---
name: git-workflow
description: "Manages git branching, commit conventions, Linear ticket linking, version bumping, PR lifecycle, and common development workflows (feature, bug fix, refactor, hotfix, release)."
tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# Git Workflow Agent

## Core Principles

1. **NEVER commit directly to `main` or `production`** -- always use feature branches
2. **ALWAYS link to Linear** -- every commit and PR must reference a `STRUM-XXX` ticket
3. **ALWAYS test before committing** -- `npm run lint && npm test`
4. **ALWAYS bump version** -- patch for fixes/refactors, minor for features, major for breaking changes

---

## Branch Naming Convention

```
feature/STRUM-XXX-short-description    # New features
fix/STRUM-XXX-short-description        # Bug fixes
refactor/STRUM-XXX-short-description   # Code refactoring
test/STRUM-XXX-short-description       # Test improvements
docs/STRUM-XXX-short-description       # Documentation
chore/STRUM-XXX-short-description      # Maintenance tasks
```

Examples:
```bash
git checkout -b feature/STRUM-123-add-lesson-reminders
git checkout -b fix/STRUM-124-song-progress-calculation
git checkout -b refactor/STRUM-125-user-service-cleanup
```

### Branch Protection Rules

- **`main`**: Protected, requires PR + approval
- **`production`**: Protected, requires PR + approval + all checks passing
- **Feature branches**: Can be pushed directly, deleted after merge

---

## Commit Message Format

Format: `type(scope): description [TICKET-ID]`

```bash
git commit -m "feat(lessons): add email reminders [STRUM-123]"
git commit -m "fix(songs): correct progress calculation [STRUM-124]"
git commit -m "refactor(users): simplify service layer [STRUM-125]"
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`

---

## Version Bumping

Update `package.json` version for EVERY meaningful change:

| Change Type | Bump | Example |
|---|---|---|
| Bug fix, small improvement, refactor | `npm version patch` | 0.65.0 → 0.65.1 |
| New feature, new component | `npm version minor` | 0.65.0 → 0.66.0 |
| Breaking change, major rewrite | `npm version major` | 0.65.0 → 1.0.0 |

```bash
npm version patch -m "fix: resolve song mastery calculation [STRUM-124]"
npm version minor -m "feat: add lesson reminder system [STRUM-123]"
npm version major -m "feat!: redesign authentication flow [STRUM-130]"
```

### CHANGELOG.md Format

```markdown
## [0.66.0] - 2026-02-09
### Added
- Lesson reminder email system [STRUM-123]
- User notification preferences [STRUM-123]

### Fixed
- Song progress calculation bug [STRUM-124]
```

---

## Working with Linear

### Ticket States (must follow)

**Backlog** → **Todo** → **In Progress** → **In Review** → **Done**

### Linear Updates at Each Stage

| Event | Linear Action |
|---|---|
| Start working | Move to "In Progress", add branch name to description |
| PR created | Move to "In Review", add PR link |
| PR merged | Move to "Done" |
| PR closed without merge | Move back to "Backlog" + comment why |

### Auto-Linking

- Linear auto-links commits containing `[STRUM-XXX]`
- PR descriptions with `Closes STRUM-XXX` auto-close tickets
- Use Linear's GitHub integration for automatic updates

---

## PR Conventions

### PR Title Format

`[STRUM-123] Add lesson reminder system`

### PR Description Template

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

### Code Review Process

- Request review from at least one team member
- Address all comments before merging
- Ensure all CI checks pass (tests, lint, build)
- Keep PRs small and focused (ideally < 500 LOC)

### Merge Strategy

- Use **Squash and Merge** for feature branches
- Merge to `main` first (creates Preview deployment)
- Verify on Preview environment
- Then merge `main` → `production` for release

### After Merge

- Update Linear ticket status to "Done"
- Delete feature branch
- Monitor deployment in Vercel
- Verify feature in production

---

## Quality Gates (MANDATORY before push)

```bash
npm run lint                    # Check code style
npm test                        # Run unit tests
npm run test:smoke              # Run smoke tests
npm run pre-commit              # Full pre-commit checks
```

---

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

# 6. Commit with proper format
git add .
git commit -m "feat(lessons): add email reminder system [STRUM-XXX]"

# 7. Push and create PR
git push origin feature/STRUM-XXX-add-lesson-reminders

# 8. After merge, clean up
git checkout main && git pull origin main
git branch -d feature/STRUM-XXX-add-lesson-reminders
```

### Fixing a Bug

```bash
git checkout -b fix/STRUM-XXX-song-progress-calculation

# Write failing test first (TDD!)
npm test -- SongProgress --watch

# Fix the bug, verify all tests pass
npm test && npm run test:smoke

# Bump patch version
npm version patch -m "fix: resolve song progress calculation [STRUM-XXX]"

# Commit and push
git add .
git commit -m "fix(songs): correct progress calculation logic [STRUM-XXX]"
git push origin fix/STRUM-XXX-song-progress-calculation
```

### Refactoring Code

```bash
git checkout -b refactor/STRUM-XXX-simplify-user-service

# Ensure all existing tests pass BEFORE refactoring
npm test

# Refactor (behavior should NOT change)
# Ensure all tests STILL pass
npm test

# Bump patch version
npm version patch -m "refactor: simplify user service layer [STRUM-XXX]"

git add .
git commit -m "refactor(users): simplify service layer [STRUM-XXX]"
git push origin refactor/STRUM-XXX-simplify-user-service
```

### Hotfix to Production

```bash
# Create hotfix from production branch
git checkout production
git pull origin production
git checkout -b fix/STRUM-XXX-critical-auth-bug

# Write test, fix bug, verify
npm test && npm run test:smoke

# Bump patch version
npm version patch -m "fix!: resolve critical auth bug [STRUM-XXX]"

git add .
git commit -m "fix(auth)!: resolve critical security bug [STRUM-XXX]"
git push origin fix/STRUM-XXX-critical-auth-bug
# Create PR: fix/STRUM-XXX → production
# After merge, also merge production → main to sync
```

### Release to Production

```bash
# Ensure all features on main are tested on Preview
git checkout main && git pull origin main

# Review CHANGELOG.md, create PR: main → production
git checkout production
git pull origin production
git merge main
git push origin production

# Tag the release
git tag -a v0.66.0 -m "Release v0.66.0: Lesson reminders and notifications"
git push origin v0.66.0

# Update Linear tickets to "Done"
```

---

## Deployment Checklist

- [ ] All tests passing (unit + E2E)
- [ ] Version bumped in `package.json`
- [ ] CHANGELOG.md updated
- [ ] Linear ticket linked in PR
- [ ] Code reviewed and approved
- [ ] Feature verified on Preview
- [ ] No errors in Vercel logs
- [ ] Database migrations tested (if applicable)
- [ ] Environment variables updated (if needed)

---

## Quick Reference

```bash
# Full workflow in one go
git checkout main && git pull origin main
git checkout -b feature/STRUM-XXX-description
# ... make changes ...
npm version minor
npm test && npm run lint
git add .
git commit -m "feat(scope): description [STRUM-XXX]"
git push origin feature/STRUM-XXX-description
# ... create PR on GitHub ...
# ... after merge ...
git checkout main && git pull
git branch -d feature/STRUM-XXX-description
```
