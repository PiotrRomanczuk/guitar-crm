# 🚀 Quick Start: Branch Verification

**TL;DR**: Always run this before coding:

```bash
git branch && git status
```

---

## Before Every Code Session

```bash
# Step 1: Check which branch you're on
git branch

# Expected: * feature/my-feature (has asterisk)
# Wrong: * main (STOP - switch branch first!)

# Step 2: Check if working directory is clean
git status

# Expected: nothing to commit, working tree clean
# Wrong: Changes not staged for commit (COMMIT FIRST!)

# Step 3: THEN open editor
code .
```

---

## If You're on the Wrong Branch

```bash
# Switch to your feature branch
git checkout feature/my-feature

# Or create it if it doesn't exist
git checkout -b feature/my-feature

# Verify
git branch  # Should show: * feature/my-feature
```

---

## If You Have Uncommitted Changes

```bash
# Option 1: Commit them
git add .
git commit -m "feat(scope): describe changes"

# Option 2: Save for later
git stash

# Verify
git status  # Should show: nothing to commit
```

---

## Pro Tips

### Speed Up Verification

Add to `~/.gitconfig`:

```ini
[alias]
  cb = rev-parse --abbrev-ref HEAD
  st = status
```

Then:

```bash
git cb && git st  # Same thing, faster!
```

### Make It a Shell Function

Add to `~/.zshrc`:

```bash
check-branch() {
  echo "Branch:" && git branch
  echo "---"
  echo "Status:" && git status
  echo "✅ Ready to code!" 
}
```

Then:

```bash
check-branch  # Runs both commands
```

---

## Common Scenarios

### ✅ Ready to Code

```
* feature/my-feature
On branch feature/my-feature
Your branch is up to date
nothing to commit, working tree clean
```

### ❌ Wrong Branch

```
* main  ← FIX THIS!
```

**Fix**: `git checkout feature/my-feature`

### ❌ Uncommitted Changes

```
Changes not staged for commit:  ← COMMIT THESE!
```

**Fix**: `git add . && git commit -m "..."`

### ❌ Out of Sync

```
Your branch is behind 'origin/feature/...' by 2 commits  ← UPDATE!
```

**Fix**: `git pull`

---

## One Rule

> **Before writing code: `git branch && git status`**

That's it! 🎉

---

For more details: See `docs/BRANCH_VERIFICATION.md`
