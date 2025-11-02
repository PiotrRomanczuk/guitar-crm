# Branch Verification Checklist - MANDATORY BEFORE CODING

**ALWAYS verify your branch before starting work. This prevents wasted time and merge conflicts.**

## Quick Check (30 seconds)

```bash
git branch           # See current branch (marked with *)
git status           # Verify working directory is clean
npm run tdd           # Start development only after confirming correct branch
```

## Expected Output

```
✅ GOOD:
  $ git branch
  * feature/lesson-real-time-updates
    main
    feature/song-search

  $ git status
  On branch feature/lesson-real-time-updates
  Your branch is up to date with 'origin/feature/lesson-real-time-updates'.
  nothing to commit, working tree clean

❌ BAD - DO NOT CODE:
  $ git branch
  * main  ← WRONG BRANCH!

  $ git status
  Changes not staged for commit:  ← UNCOMMITTED CHANGES!
  Untracked files:                ← UNCLEAN WORKING DIRECTORY!
```

## Fix Common Issues

### Problem 1: On Wrong Branch

```bash
# Problem: You're on main, but meant to work on feature/my-feature
git branch
# Output: * main

# Fix: Switch to correct branch
git checkout feature/my-feature

# If branch doesn't exist, create it:
git checkout -b feature/my-feature

# Verify
git branch
# Output: * feature/my-feature ✅
```

### Problem 2: Uncommitted Changes

```bash
# Problem: You have uncommitted changes
git status
# Output: Changes not staged for commit:

# Fix 1: Commit them (if they belong to this branch)
git add .
git commit -m "feat(feature): add functionality"

# Fix 2: Or stash them (save for later)
git stash

# Verify
git status
# Output: nothing to commit, working tree clean ✅
```

### Problem 3: Branch Not Synced

```bash
# Problem: Your branch is behind main
git status
# Output: Your branch is behind 'origin/...' by 2 commits

# Fix: Pull latest changes
git pull

# Verify
git status
# Output: Your branch is up to date with 'origin/...' ✅
```

## Multi-Feature Development

If working on multiple features:

```bash
# Terminal 1: Feature A
git checkout feature/feature-a
npm run tdd

# Terminal 2: Feature B (NEW TERMINAL WINDOW)
git checkout feature/feature-b
npm run dev

# Don't mix terminals or branches!
```

## Pro Tips

### Use Git Aliases for Speed

Add to `~/.gitconfig`:

```ini
[alias]
  cb = rev-parse --abbrev-ref HEAD
  st = status
```

Then:

```bash
git cb    # Shows: feature/my-feature
git st    # Shows full status
```

### Create a Shell Alias

Add to `~/.zshrc` (for zsh):

```bash
# Quick branch check before coding
alias check-branch="git branch && echo '---' && git status && echo '✅ Ready to code!'"
```

Then:

```bash
check-branch  # Runs both commands
```

### Make It a Habit

**Muscle memory matters:**

1. Open terminal
2. Navigate to project
3. Run: `git branch && git status`
4. Only THEN open editor or start coding

## Integration with Scripts

The project provides helper scripts:

```bash
# Create feature branch correctly
npm run new-feature my-feature
# This automatically:
# ✅ Checks current branch
# ✅ Verifies clean working directory
# ✅ Pulls latest from main
# ✅ Creates feature branch
# ✅ Shows TDD reminders

# Run TDD mode on current branch
npm run tdd
# This automatically:
# ✅ Detects current branch
# ✅ Runs tests for that branch only
# ✅ Watches for changes
```

## Branch Naming Convention

Always use this format:

```
feature/descriptive-name        # New feature
bugfix/short-description        # Bug fix
refactor/component-name         # Code cleanup
docs/what-was-updated           # Documentation
chore/dependency-update         # Maintenance
```

Examples:

```
✅ feature/lesson-real-time-updates
✅ bugfix/song-search-broken
✅ refactor/extract-form-validation
✅ docs/update-api-documentation
✅ chore/upgrade-next-to-17

❌ feature/my-thing
❌ fix
❌ WIP
❌ test123
```

## Before and After Working on a Feature

### Before Starting

```bash
# Terminal commands
git checkout feature/my-feature
git pull
git status

# Expected: ✅ On correct branch, clean working directory
```

### After Finishing

```bash
# Terminal commands
git status
git add .
git commit -m "feat(scope): describe change"
git push origin feature/my-feature

# Then: Create PR on GitHub
```

## Red Flags 🚩

Stop and fix if you see:

- [ ] `git status` shows "On branch main" → Switch to feature branch
- [ ] `git status` shows uncommitted changes → Commit or stash
- [ ] `git branch` shows no asterisk → Run `git branch` to see all branches
- [ ] `git status` shows "untracked files" → Add/commit or delete them
- [ ] Branch name doesn't match your work → You're on wrong branch!
- [ ] Multiple terminals without clear branch assignment → Create new terminal!

## Critical Rule

```
🚫 NEVER code without checking: git branch && git status
✅ ALWAYS verify before opening editor or writing code
```

---

**Last Updated**: October 27, 2025  
**Part of**: Git Workflow Standards  
**Reference**: `.github/git-workflow.instructions.md`
