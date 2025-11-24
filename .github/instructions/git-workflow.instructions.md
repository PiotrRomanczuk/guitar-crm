# Git Workflow & Commit Standards

**Status**: Established via discovery Q&A (Q10, Q19)  
**Last Updated**: October 26, 2025  
**Enforced By**: Git hooks (husky), branch protection rules

---

## Purpose

Establish clear Git practices to maintain clean history, enable easy rollbacks, and communicate changes clearly through commit messages.

---

## Core Principles

1. **Conventional Commits**: Standardized message format
2. **Feature Branches**: Never commit directly to `main`
3. **Atomic Commits**: One logical change per commit
4. **Deprecation Period**: Support old + new code in parallel
5. **Clean History**: Rebase before merging

---

## Branch Naming Convention

```
feature/descriptive-name     # New feature
bugfix/short-description     # Bug fix
refactor/component-name      # Code cleanup
docs/what-was-updated        # Documentation
chore/dependency-update      # Maintenance
```

**Examples**:

```
feature/lesson-real-time-updates
bugfix/song-search-broken
refactor/extract-form-validation
docs/update-api-documentation
chore/upgrade-next-to-17
```

**Never**:

```
❌ feature/my-thing
❌ fix
❌ WIP
❌ test123
```

---

## Conventional Commits Format

All commits must follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

| Type       | Usage                   | Example                                         |
| ---------- | ----------------------- | ----------------------------------------------- |
| `feat`     | New feature             | `feat(lessons): add real-time updates`          |
| `fix`      | Bug fix                 | `fix(forms): correct validation error message`  |
| `refactor` | Code cleanup            | `refactor(components): extract form validation` |
| `docs`     | Documentation           | `docs: add deployment guide`                    |
| `test`     | Add/update tests        | `test(schemas): add validation tests`           |
| `chore`    | Dependencies, config    | `chore: upgrade Next.js to v17`                 |
| `perf`     | Performance improvement | `perf(lessons): optimize query with indexing`   |
| `ci`       | CI/CD changes           | `ci: add GitHub Actions workflow`               |

### Scope

Indicates what part of codebase changed:

```
feat(lessons):        # Lesson-related feature
fix(auth):            # Authentication bug
refactor(components): # Component refactoring
docs(api):            # API documentation
test(schemas):        # Schema testing
```

### Subject

- Imperative mood ("add" not "added")
- Lowercase first letter
- No period at end
- Max 50 characters

### Body (Optional)

- Explain **why**, not what
- Wrap at 72 characters
- Leave blank line before footer

### Footer (Optional)

Reference issues or breaking changes:

```
Fixes #123
Closes #456
BREAKING CHANGE: Auth middleware now requires email verification
```

---

## Commit Message Examples

### Simple Feature

```
feat(songs): add difficulty level filter

Users can now filter songs by beginner/intermediate/advanced levels.
This improves lesson planning for teachers with mixed-ability students.
```

### Bug Fix

```
fix(forms): show validation errors after blur

Validation was triggering on every keystroke, annoying users. Now errors
only show after the user leaves a field (blur event), providing better UX.

Fixes #234
```

### Refactoring

```
refactor(components): extract lesson form into smaller pieces

Split StudentLessonForm into:
- StudentLessonForm (composition)
- StudentLessonForm.Header
- StudentLessonForm.SongList
- useStudentLessonForm (hook)

Reduces file size from 450 LOC to 120 LOC and improves testability.
```

### Documentation

```
docs: add form validation standards guide

Documents patterns for:
- Blur + submit validation
- Error display
- Testing forms

References .github/form-validation.instructions.md
```

### Breaking Change

```
feat(auth)!: require email verification on signup

Users must now verify their email before accessing the app.

BREAKING CHANGE: Email-unverified accounts can no longer log in.
Migration: Existing users receive email verification prompt on next login.
```

---

## Workflow: Creating a Feature

### 1. Create Feature Branch

```bash
git checkout -b feature/my-feature
```

### 2. Develop with Atomic Commits

```bash
# Commit 1: Add schema
git commit -m "feat(lessons): add lesson validation schema"

# Commit 2: Add component
git commit -m "feat(lessons): create lesson form component"

# Commit 3: Add tests
git commit -m "test(lessons): add form validation tests"

# Commit 4: Fix UI bug
git commit -m "fix(lessons): correct form label spacing on mobile"
```

**Each commit should**:

- ✅ Have a meaningful message
- ✅ Pass all tests (`npm test`)
- ✅ Be a logically complete unit

**Not**:

- ❌ `git commit -m "wip"` or `"updates"`
- ❌ Mix multiple concerns in one commit
- ❌ Commit broken code

### 3. Pre-Commit Checks

```bash
npm run quality
```

This runs:

- ESLint
- TypeScript compiler
- Jest tests (coverage 70%+)
- TODO checker

**Don't push if this fails.**

### 4. Push and Create PR

```bash
git push origin feature/my-feature
```

Then create Pull Request on GitHub.

### 5. Code Review

Before merging to `main`:

- ✅ At least 1 approval
- ✅ All CI checks pass
- ✅ No conflicts with main
- ✅ Conventional commits used

### 6. Merge Strategy

Use **Squash & Merge** for clean history:

```bash
# Before merge (keep atomic commits):
git checkout feature/my-feature
git rebase main
git push -f origin feature/my-feature

# On GitHub: Use "Squash and merge" button
# Final commit on main: "feat(lessons): add real-time updates"
```

---

## Deprecation: Supporting Old Code

When changing APIs, support both versions:

```typescript
/**
 * @deprecated Use `useLessonData` instead. Will be removed in v2.0.
 * @see useLessonData
 */
export function fetchLessonData() {
	console.warn('fetchLessonData is deprecated. Use useLessonData instead.');
	return useLessonData();
}

// New approach
export function useLessonData() {
	// Implementation
}
```

### Deprecation Timeline

1. **v1.5.0**: Add new function, mark old as `@deprecated`
2. **v1.6.0 - v1.9.0**: Support both, encourage migration
3. **v2.0.0**: Remove old function

**Commit message**:

```
refactor(hooks): deprecate fetchLessonData in favor of useLessonData

Old: fetchLessonData() - deprecated
New: useLessonData() - recommended

Deprecation period: v1.5.0 through v1.9.0
Removal: v2.0.0

Developers should migrate now. See migration guide in docs/MIGRATION.md
```

---

## Common Mistakes & Fixes

### ❌ Mistake 1: Vague Commit Messages

```
❌ "fix stuff"
❌ "updates"
❌ "wip"
❌ "final version"

✅ "fix(forms): correct email validation regex"
✅ "feat(songs): add difficulty level filter"
```

### ❌ Mistake 2: Multiple Changes in One Commit

```
❌ "feat: add lessons, fix forms, update docs"

✅ Three separate commits:
  - feat(lessons): add lesson creation form
  - fix(forms): correct blur validation
  - docs: update form validation guide
```

### ❌ Mistake 3: Committing Broken Code

```
❌ Commit that fails tests
❌ Merge that breaks `npm run quality`

✅ Always run: npm run quality before pushing
✅ Tests must pass for all commits
```

### ❌ Mistake 4: Forgetting Issue References

```
❌ "fix validation error"

✅ "fix(forms): correct email regex

   Fixes #234"
```

---

## Reverting Commits

If you need to undo a commit:

```bash
# Undo last commit, keep changes
git reset --soft HEAD~1

# Undo last commit, discard changes
git reset --hard HEAD~1

# Revert a commit (creates new commit that undoes it)
git revert <commit-hash>

# Revert last commit
git revert HEAD
```

---

## Useful Git Aliases

Add to `~/.gitconfig`:

```bash
[alias]
  cm = commit -m
  co = checkout
  br = branch
  st = status
  log-oneline = log --oneline --graph --all
  last = log -1 HEAD
  unstage = reset HEAD --
  discard = checkout --
```

**Usage**:

```bash
git co -b feature/my-feature
git cm "feat(songs): add level filter"
git log-oneline  # See tree
```

---

## Pre-Commit Hook (Husky)

Automatically run checks before commit:

```bash
# Create hook (one time)
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run quality"

# Now every git commit runs npm run quality
# If it fails, commit is blocked
```

---

## Commit Message Checklist

Before `git push`:

- [ ] Type is one of: feat, fix, refactor, docs, test, chore, perf, ci
- [ ] Scope clearly describes what changed
- [ ] Subject is imperative mood ("add" not "added")
- [ ] Subject is < 50 characters
- [ ] Body explains WHY, not what
- [ ] Footer references issues with "Fixes #123"
- [ ] All tests pass (`npm test`)
- [ ] ESLint clean (`npm run lint`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Not mixing multiple concerns

---

## Resources

- Conventional Commits: https://www.conventionalcommits.org/
- Git docs: https://git-scm.com/docs
- Husky (git hooks): https://typicode.github.io/husky/
