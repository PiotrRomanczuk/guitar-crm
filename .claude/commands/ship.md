---
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
argument-hint: [--patch|--minor|--major] [--skip-linear] [--dry-run]
description: Full ship workflow — validate branch & changes, run tests, bump version, update Linear, push, and create PR
---

# Ship Workflow

Execute the complete shipping workflow for the current branch: **$ARGUMENTS**

## Workflow Overview

This is the **full end-to-end release workflow**. It validates the branch and its changes, runs unit tests, bumps the version, updates Linear, pushes (lint + tsc run automatically on push via hooks), and creates a PR — all in one command.

**IMPORTANT**: Execute each phase sequentially. **Stop immediately** if any phase fails and report the failure clearly to the user. Do NOT proceed past a failed gate.

---

## Phase 1: Pre-flight Checks

Run ALL of these checks before proceeding:

1. **Get current branch name** via `git branch --show-current`
2. **If on `main` or `production`** — do NOT abort. Instead, **automatically create a new feature branch**:
   - Detect the domain from uncommitted changed files (e.g., `calendar-actions.ts` → `calendar`)
   - Extract or ask for a Linear ticket ID (use `STRUM-XXX` as placeholder if unknown)
   - Create branch: `git checkout -b feature/STRUM-XXX-{domain}-{short-description}`
   - Continue the workflow on the new branch
3. **Check for uncommitted changes** via `git status --porcelain` — warn the user if there are unstaged or staged changes and ask whether to commit them or abort
4. **Get commits ahead of main** via `git log main..HEAD --oneline` — ABORT if there are zero commits AND no uncommitted changes (nothing to ship)
5. **Extract Linear ticket ID** from branch name (pattern: `STRUM-XXX` or `STRUM-\d+`) — warn if not found but continue

---

## Phase 2: Validate Branch Matches Changes

Verify that the changed files belong to the domain this branch is about. This prevents accidentally shipping work on the wrong branch (e.g., users table UI changes committed on an `ai-testing` branch).

1. **Get changed files**: `git diff main..HEAD --name-only` (plus uncommitted files from `git diff --name-only` and untracked from `git ls-files --others --exclude-standard`)
2. **Extract the domain keyword(s) from the branch name** — the slug after the ticket ID tells you what domain this branch is for:
   - `feature/STRUM-123-ai-generations-history` → domain: **ai**, **generations**
   - `fix/STRUM-456-users-table-sorting` → domain: **users**, **table**
   - `refactor/STRUM-789-lesson-form-cleanup` → domain: **lesson**, **form**

3. **Map changed files to their domains** using the directory/filename:
   - `components/users/UsersTable.tsx` → domain: **users**
   - `lib/ai/providers/openrouter.ts` → domain: **ai**
   - `app/actions/lessons.ts` → domain: **lessons**
   - `components/songs/SongList.tsx` → domain: **songs**
   - Shared files (`types/`, `schemas/`, `lib/supabase/`, config files) are neutral — they belong to any branch

4. **Check for mismatches**: If a significant portion of changed files belong to a domain that does NOT match the branch name, **ABORT and ask the user**:
   - "You're on branch `feature/STRUM-XXX-ai-testing` but 6 of 8 changed files are in `components/users/`. These changes should be on a users-related branch. Continue anyway or abort?"
   - Minor shared/config files (package.json, types/index.ts, CLAUDE.md) should be ignored in this check — they're expected on any branch
   - If ALL changed files are in the branch's domain or are shared files: proceed silently

```
Branch validation:
  Branch:      feature/STRUM-123-ai-generations-history
  Domain:      ai, generations
  Changed files by domain:
    ai/         8 files  ✓ matches branch
    types/      2 files  (shared — OK)
    components/ 2 files  ✓ ai-related components
  Assessment:  ✓ All changes belong to this branch
```

**Mismatch example** (would ABORT):
```
Branch validation:
  Branch:      feature/STRUM-123-ai-testing
  Domain:      ai, testing
  Changed files by domain:
    users/      6 files  ✗ WRONG BRANCH — users changes don't belong here
    ai/         1 file   ✓ matches branch
    types/      1 file   (shared — OK)
  Assessment:  ✗ Most changes are users-related, not ai-related
               → These should be on a branch like fix/STRUM-XXX-users-table-ui
```

---

## Phase 3: Handle Uncommitted Changes

If there are uncommitted changes from Phase 1:

1. Show `git diff --stat` to summarize what changed
2. Ask user: "Stage and commit these changes before shipping?"
   - If yes: stage relevant files (NOT .env or secrets), compose a commit message following the format `type(scope): description [STRUM-XXX]`, and commit
   - If no: ABORT with "Please commit or stash your changes first"

---

## Phase 4: Unit Tests (MANDATORY)

Run unit tests. **STOP on failure.**

```bash
npm test
```

- On failure: Report failing tests and STOP. Do not proceed.
- On success: Report the count.

Note: **Lint and TypeScript checks are NOT run here** — they execute automatically on `git push` via pre-push hooks. If they fail during push (Phase 6), the push will be rejected and you'll need to fix before re-running `/ship`.

```
Quality gates:
  Tests: PASSED (XX suites, XX tests)
  Lint:  runs on push (hook)
  TSC:   runs on push (hook)
```

---

## Phase 5: Version Bump

### Auto-detect bump type from branch prefix (unless overridden via $ARGUMENTS):

| Branch prefix | Bump type | Example |
|---|---|---|
| `feature/` | minor | 0.65.0 → 0.66.0 |
| `feat/` | minor | 0.65.0 → 0.66.0 |
| `fix/` | patch | 0.65.0 → 0.65.1 |
| `refactor/` | patch | 0.65.0 → 0.65.1 |
| `test/` | patch | 0.65.0 → 0.65.1 |
| `chore/` | patch | 0.65.0 → 0.65.1 |
| `docs/` | patch | 0.65.0 → 0.65.1 |
| `perf/` | patch | 0.65.0 → 0.65.1 |

### Override via arguments:
- `--patch` → force patch bump
- `--minor` → force minor bump
- `--major` → force major bump

### Execute:
1. Read current version from `package.json`
2. Run `npm version {type} --no-git-tag-version` to bump without creating a git tag
3. Read the new version
4. Stage `package.json` and `package-lock.json`
5. Commit: `chore: bump version {old} → {new} [STRUM-XXX]`

```
Version bump:
  Type:   minor (auto-detected from feature/ branch)
  Before: 0.65.0
  After:  0.66.0
```

---

## Phase 6: Push to Remote

1. Check if the branch has an upstream: `git rev-parse --abbrev-ref @{upstream} 2>/dev/null`
2. If no upstream: `git push -u origin {branch-name}`
3. If upstream exists: `git push`

**If push fails due to pre-push hooks (lint/tsc)**: Report the errors clearly and STOP. The user must fix lint/tsc issues and re-run `/ship`.

---

## Phase 7: Update Linear (unless `--skip-linear`)

If a `STRUM-XXX` ticket ID was extracted from the branch name:

1. Use Linear MCP `get_issue` to fetch the current issue by the identifier (e.g., `STRUM-123`)
2. If found, use `update_issue` to set state to **"In Review"**
3. After the PR is created (Phase 8), add a comment with the PR link using `create_comment`

If `--skip-linear` was passed, skip this phase entirely.
If no ticket ID was found in the branch name, skip and note it in the summary.

---

## Phase 8: Create Pull Request

### Determine PR metadata:

1. **Title**: `[STRUM-XXX] Short description from branch name`
   - Convert branch slug to readable text: `add-lesson-reminders` → `Add lesson reminders`
   - Example: `[STRUM-123] Add lesson reminders`

2. **Body**: Generate from the commit log since main:
   - Get commits: `git log main..HEAD --pretty=format:"- %s"`
   - Get changed files summary: `git diff main..HEAD --stat`
   - Use the PR template from git-workflow agent

3. **Create the PR**:
```bash
gh pr create --title "{title}" --body "$(cat <<'EOF'
## Linear Ticket
Closes STRUM-XXX

## Changes
{bullet list of commits}

## Files Changed
{diff stat summary}

## Quality Gates
- [x] Unit tests passing
- [x] Version bumped: {old} → {new}
- [x] Lint + TSC checked on push (hooks)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

4. Capture the PR URL from the output.

---

## Phase 9: Post-ship (Linear + Summary)

1. If Linear is enabled and a ticket was found:
   - Add a comment on the Linear issue with the PR URL and change summary
   - Attach the PR as a link on the issue

2. Print final summary:
```
Ship complete!
  Branch:   feature/STRUM-123-add-lesson-reminders
  Version:  0.65.0 → 0.66.0
  PR:       https://github.com/...
  Linear:   STRUM-123 → In Review

  Quality:  tests ✓ | lint ✓ (hook) | tsc ✓ (hook)
```

---

## Dry Run Mode (`--dry-run`)

If `--dry-run` is passed:
- Run Phase 1 (pre-flight), Phase 2 (branch validation), and Phase 4 (unit tests) normally
- For Phase 5-9, only **print what would happen** without executing
- Useful for checking readiness before shipping

---

## Error Recovery

If any phase fails:
- Print exactly which phase failed and why
- Print what was already completed (so the user knows the state)
- Do NOT attempt to rollback completed steps (commits, version bumps) — let the user decide
- Suggest the fix and tell the user they can re-run `/ship` after fixing
