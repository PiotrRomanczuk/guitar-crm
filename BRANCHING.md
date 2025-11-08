# Branching Strategy

## Overview

This document outlines the branching conventions and workflow for the Guitar CRM project. Following these guidelines ensures consistent branch naming, clear intent, and smooth collaboration.

## Branch Naming Conventions

All branches should use descriptive, kebab-case names with a prefix indicating the type of work.

### Branch Prefixes

| Prefix | Purpose | Examples | When to Use |
|--------|---------|----------|-------------|
| `feature/` | New features or enhancements | `feature/lesson-management`<br>`feature/song-crud`<br>`feature/core-crud` | Adding new functionality, implementing user stories, building new components |
| `fix/` | Bug fixes | `fix/lesson-date-validation`<br>`fix/auth-redirect`<br>`fix/ci-passing-tests` | Fixing bugs, addressing issues, resolving errors |
| `chore/` | Maintenance tasks | `chore/update-dependencies`<br>`chore/cleanup-logs`<br>`chore/remove-unused-imports` | Dependency updates, code cleanup, non-functional improvements |
| `refactor/` | Code restructuring | `refactor/extract-hooks`<br>`refactor/split-components`<br>`refactor/simplify-api` | Improving code structure, extracting logic, simplifying without changing behavior |
| `docs/` | Documentation only | `docs/api-endpoints`<br>`docs/update-readme`<br>`docs/add-contributing-guide` | Adding or updating documentation, guides, READMEs |
| `test/` | Test-related work | `test/lesson-schema`<br>`test/add-e2e-suite`<br>`test/improve-coverage` | Adding tests, improving test coverage, test refactoring |

### Branch Naming Guidelines

1. **Use descriptive names**: Branch names should clearly indicate what work is being done
   - ✅ `feature/lesson-scheduling`
   - ❌ `feature/stuff` or `feature/temp`

2. **Keep it concise**: Aim for 2-4 words after the prefix
   - ✅ `fix/auth-redirect-loop`
   - ❌ `fix/that-annoying-bug-where-users-cant-login-after-password-reset`

3. **Use kebab-case**: Separate words with hyphens
   - ✅ `feature/user-profile-settings`
   - ❌ `feature/user_profile_settings` or `feature/userProfileSettings`

4. **Be specific about scope**: Include the domain or component
   - ✅ `feature/songs-crud`, `feature/lessons-analytics`
   - ❌ `feature/crud`, `feature/analytics`

## Workflow

### Creating a New Branch

```bash
# Always start from an up-to-date main branch
git checkout main
git pull origin main

# Create and switch to new branch
git checkout -b feature/your-feature-name

# Or use the npm script for feature branches (shows TDD reminder)
npm run new-feature your-feature-name
```

### Working on a Branch

1. **Follow TDD**: Write tests before implementation
   ```bash
   npm run tdd  # Start Jest in watch mode with coverage
   ```

2. **Commit regularly**: Make small, focused commits with clear messages
   ```bash
   git add .
   git commit -m "feat: add lesson scheduling form"
   ```

3. **Run quality checks before pushing**:
   ```bash
   npm run quality  # Runs lint, type-check, tests, and more
   ```

4. **Push to remote**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Merging to Main

1. **Ensure quality checks pass**:
   ```bash
   npm run quality
   ```

2. **Check for conflicts with main**:
   ```bash
   git fetch origin
   git merge origin/main
   # Resolve any conflicts
   ```

3. **Create Pull Request** (if using PR workflow) or merge directly:
   ```bash
   git checkout main
   git merge feature/your-feature-name
   git push origin main
   ```

4. **Delete branch after merge**:
   ```bash
   # Delete local branch
   git branch -d feature/your-feature-name
   
   # Delete remote branch
   git push origin --delete feature/your-feature-name
   ```

## Branch Lifecycle

### Active Development

- Branch exists locally and remotely
- Regular commits and pushes
- May be rebased on main to stay current

### Ready for Merge

- All tests pass (`npm run quality`)
- Feature/fix is complete
- Documentation updated
- No conflicts with main

### Merged and Deleted

- Work is merged to main
- Branch deleted locally and remotely
- No longer needed

## Branch Maintenance

### Regular Cleanup

Periodically review and clean up branches:

```bash
# List all branches
git branch -a

# Check if branch is fully merged
git log --oneline main..branch-name | wc -l
# If output is 0, branch is fully merged

# Delete merged branches
git branch -d branch-name           # Local
git push origin --delete branch-name  # Remote
```

### When to Keep Branches

- **Active work in progress**: Feature not yet complete
- **Long-running features**: Complex features spanning weeks
- **Experimental work**: Trying new approaches, may not merge

### When to Delete Branches

- **Fully merged**: All commits are in main
- **Abandoned work**: Feature cancelled or no longer needed
- **Outdated approaches**: Better solution implemented
- **Test/experimental**: One-off testing that's complete

## Multiple Related Branches

### When to Consolidate

If you have multiple branches working on related functionality:

```bash
# Example: Consolidating song-crud branches
git checkout feature/song-crud
git merge feature/song-crud-implementation
git branch -d feature/song-crud-implementation

# Rename if needed
git branch -m feature/song-crud feature/core-crud
```

### When to Keep Separate

- Working on independent aspects of the same feature
- Different team members working in parallel
- Breaking large features into reviewable chunks

## Best Practices

1. **One branch, one purpose**: Keep branches focused on a single feature or fix
2. **Keep branches short-lived**: Aim to merge within days, not weeks
3. **Stay current with main**: Regularly pull main and merge into your branch
4. **Delete after merge**: Clean up merged branches promptly
5. **Use descriptive commit messages**: Follow conventional commits format
6. **Run quality checks**: Always run `npm run quality` before merging
7. **Document significant changes**: Update relevant docs in the same branch
8. **Follow TDD**: Write tests first, then implement

## Special Cases

### Hotfixes

For urgent production fixes:

```bash
git checkout -b fix/urgent-auth-bug main
# Make minimal changes to fix the issue
# Test thoroughly
git checkout main
git merge fix/urgent-auth-bug
git push origin main
git branch -d fix/urgent-auth-bug
```

### Long-Running Features

For features spanning weeks:

```bash
git checkout -b feature/complex-analytics

# Periodically sync with main
git fetch origin
git merge origin/main

# Consider breaking into smaller features if possible
```

### Experimental Work

For trying new approaches:

```bash
git checkout -b experiment/new-ui-library

# If successful, rename to feature/ and merge
git branch -m experiment/new-ui-library feature/new-ui-library

# If unsuccessful, delete without merging
git checkout main
git branch -D experiment/new-ui-library
```

## Current Branch Status

As of November 8, 2025:

### Active Branches

- `main` - Production branch, always stable
- `feature/core-crud` - Core CRUD operations (songs, lessons, assignments)

### Recently Cleaned Up

- ✅ feature/authorization - Merged and deleted
- ✅ feature/phase-1-2-completion - Merged and deleted
- ✅ feature/lesson-crud - Consolidated into core-crud
- ✅ feature/lesson-management - Merged and deleted
- ✅ feature/user-management - Merged and deleted
- ✅ feature/admin-user-management - Merged and deleted
- ✅ feature/logging - Merged and deleted
- ✅ feature/logging-scripts - Merged and deleted
- ✅ feature/mail-manager - Merged and deleted
- ✅ feature/ui-shadcn-conversion - Merged and deleted
- ✅ structure-refactoring - Merged and deleted
- ✅ testing - Deleted
- ✅ fix/ci-passing-tests - Merged and deleted

## Related Documentation

- [TDD Guide](docs/TDD_GUIDE.md) - Testing practices
- [CRUD Standards](docs/CRUD_STANDARDS.md) - CRUD implementation patterns
- [Scripts README](scripts/README.md) - Development commands
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Project architecture

## Questions?

If you're unsure about branching strategy:

1. Check this document first
2. Look at recent branch history: `git log --oneline --graph --all --decorate`
3. Follow the pattern of similar recent work
4. When in doubt, use `feature/` prefix for new work
