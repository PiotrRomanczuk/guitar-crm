---
name: worktree-preview
description: Preview, sync, list, and clean up git worktrees used for isolated development. Start a dev server from any worktree, pull latest main, view worktree status with PR info, or remove merged worktrees. Use when you need to see worktree changes in the browser, manage worktree lifecycle, or keep the main directory in sync.
---

# Worktree Preview

## Overview

Git worktrees (`.claude/worktrees/<name>/`) isolate code changes from the main working directory so VS Code's format-on-save doesn't revert edits. But the dev server typically runs from the main directory, meaning worktree changes aren't visible in the browser until merged. This skill closes that gap.

**4 actions**: `preview`, `sync`, `list`, `cleanup`

## Usage

```
/worktree-preview preview <name> [--port 3001]   # Start dev server from worktree
/worktree-preview sync                            # Pull latest main into main directory
/worktree-preview list                            # Show all worktrees with status
/worktree-preview cleanup                         # Remove merged/closed worktrees

# Short alias
/wt preview mobile-ux-overhaul
/wt list
/wt sync
/wt cleanup
```

## Actions

### preview

Start a Next.js dev server from a worktree so changes are visible in the browser.

**Arguments:**
- `name` (required) -- worktree directory name under `.claude/worktrees/`
- `--port <number>` (optional, default: `3001`) -- port for the dev server

**Steps:**

1. **Validate the worktree exists**:

```bash
# Check worktree directory
ls -d .claude/worktrees/<name>
```

If it doesn't exist, list available worktrees and ask the user to pick one.

2. **Check for an existing server on the target port**:

```bash
lsof -Pi :<port> -sTCP:LISTEN -t
```

If a server is already running on the port:
- If it's the SAME worktree, report that it's already running and show the URL.
- If it's a DIFFERENT process, ask the user whether to kill it or use a different port.

3. **Install dependencies if needed**:

```bash
# Only if node_modules is missing
if [ ! -d ".claude/worktrees/<name>/node_modules" ]; then
  cd .claude/worktrees/<name> && npm install --prefer-offline --no-audit --no-fund
fi
```

4. **Symlink .env.local if missing**:

```bash
# Symlink rather than copy -- stays in sync as secrets rotate
if [ ! -f ".claude/worktrees/<name>/.env.local" ]; then
  ln -sf "$(pwd)/.env.local" ".claude/worktrees/<name>/.env.local"
fi
```

5. **Start the dev server using the helper script**:

```bash
bash .claude/skills/worktree-preview/scripts/wt-server.sh start <name> <port>
```

The script:
- Runs `next dev` directly (not `npm run dev` which adds nodemon -- simpler from worktree paths)
- Sets `NODE_OPTIONS='--max-http-header-size=65536'` (matches `package.json` config)
- Saves PID to `/tmp/wt-<name>-pid` and logs to `/tmp/wt-<name>-log`
- Polls for readiness (15 attempts, 2s each = 30s max)

6. **Report result**:

On success:
```
Server ready at http://localhost:3001
  Worktree: .claude/worktrees/mobile-ux-overhaul
  Branch:   feature/STRUM-42-mobile-ux
  PID:      12345
  Logs:     /tmp/wt-mobile-ux-overhaul-log
```

On failure, show the last 20 lines of the log file for debugging.

7. **Stopping the server** (when user is done):

```bash
bash .claude/skills/worktree-preview/scripts/wt-server.sh stop <name>
```

**Port selection guide:**
| Port | Used by |
|------|---------|
| 3000 | Main dev server (`npm run dev`) |
| 3001 | Worktree preview (default) |
| 54321 | Supabase API |
| 54322 | PostgreSQL |
| 54323 | Supabase Studio |
| 54324 | Supabase Inbucket |

If port 3001 is busy, try 3002, 3003, etc.

### sync

Pull the latest `main` into the main working directory. Useful after merging a worktree PR.

**Steps:**

1. **Check for uncommitted changes in main directory**:

```bash
git status --short
```

2. **Stash if needed**:

```bash
# Only if there are uncommitted changes
git stash push -m "wt-sync: auto-stash before pull"
```

3. **Pull latest main**:

```bash
git checkout main 2>/dev/null || true
git pull origin main
```

4. **Pop stash if we stashed**:

```bash
git stash pop
```

5. **Report what changed**:

```bash
# Show commits pulled
git log --oneline HEAD@{1}..HEAD
```

**Output example:**
```
Synced main (3 new commits):
  abc1234 feat(lessons): add bulk reschedule [STRUM-42]
  def5678 fix(auth): handle expired refresh tokens [STRUM-43]
  ghi9012 chore: bump version 0.104.0 -> 0.105.0

Restored stashed changes (2 files modified)
```

**Error handling:**
| Situation | Action |
|-----------|--------|
| Merge conflicts after pull | Report conflicts, do NOT auto-resolve. Ask user. |
| Stash pop conflicts | Report, leave stash intact. User resolves manually. |
| Not on main | Switch to main first, then pull |
| No remote changes | Report "Already up to date" |

### list

Show all worktrees with branch info, last commit, modified files, and PR status.

**Steps:**

1. **Find all worktrees**:

```bash
ls -1 .claude/worktrees/
```

2. **For each worktree, gather info using `git -C`** (no `cd` needed):

```bash
# Branch name
git -C .claude/worktrees/<name> branch --show-current

# Last commit (short)
git -C .claude/worktrees/<name> log -1 --format="%h %s (%cr)"

# Modified files count
git -C .claude/worktrees/<name> status --short | wc -l

# Uncommitted changes
git -C .claude/worktrees/<name> status --short
```

3. **Check PR status** (requires `gh` CLI):

```bash
# Get branch name, then check for PR
BRANCH=$(git -C .claude/worktrees/<name> branch --show-current)
gh pr list --head "$BRANCH" --json number,state,title,url --limit 1
```

4. **Check if a dev server is running**:

```bash
bash .claude/skills/worktree-preview/scripts/wt-server.sh status <name>
```

5. **Output a formatted table**:

```
WORKTREES (3)

Name                  Branch                              Last Commit                    Modified  PR         Server
----                  ------                              -----------                    --------  --         ------
mobile-ux-overhaul    feature/STRUM-42-mobile-ux          abc1234 fix nav (2h ago)       3 files   #87 OPEN   :3001
fix-ci-p0-p1          fix/STRUM-50-ci-failures            def5678 fix tests (1d ago)     0 files   #92 MERGED --
landing-page-lovable  feature/STRUM-55-landing             ghi9012 add hero (3h ago)     1 file    --         --
```

**If no worktrees exist**, print:
```
No worktrees found in .claude/worktrees/
Create one with: EnterWorktree(name="my-feature")
```

### cleanup

Remove worktrees whose PRs have been merged or closed. Skips worktrees with uncommitted changes.

**Steps:**

1. **List all worktrees** (same as `list` action).

2. **For each worktree, determine if removable**:

A worktree is removable if ALL of these are true:
- Its PR is MERGED or CLOSED (checked via `gh pr list`)
- It has NO uncommitted changes (`git status --short` is empty)
- No dev server is running for it

3. **Show removal plan and ask for confirmation**:

```
CLEANUP PLAN

Will remove:
  fix-ci-p0-p1 (PR #92 MERGED, 0 uncommitted files)

Will keep:
  mobile-ux-overhaul (PR #87 OPEN)
  landing-page-lovable (no PR, 1 uncommitted file)

Estimated disk space freed: ~450 MB

Proceed? [y/N]
```

4. **Remove confirmed worktrees**:

```bash
# Remove the worktree directory
rm -rf .claude/worktrees/<name>

# Clean up any git worktree references
git worktree prune

# Stop server if somehow still running
bash .claude/skills/worktree-preview/scripts/wt-server.sh stop <name> 2>/dev/null || true
```

5. **Report results**:

```
Cleaned up 1 worktree:
  fix-ci-p0-p1 (freed ~230 MB)

Remaining worktrees: 2
```

**Safety rules:**
- NEVER remove a worktree with uncommitted changes without explicit user confirmation
- NEVER remove a worktree whose PR is still OPEN
- ALWAYS show the plan and ask before removing anything
- If `gh` CLI is not available, skip PR status check and only remove worktrees the user explicitly names

## Helper Script

The shell script at `.claude/skills/worktree-preview/scripts/wt-server.sh` manages the dev server lifecycle.

**Subcommands:**

| Command | Description |
|---------|-------------|
| `start <name> [port]` | Start Next.js dev server from worktree (default port: 3001) |
| `stop <name>` | Stop the dev server and clean up PID/log files |
| `status <name>` | Check if server is running, show PID |
| `logs <name>` | Show last 50 lines of server output |
| `help` | Show usage |

**File locations:**
- PID file: `/tmp/wt-<name>-pid` (auto-cleaned on reboot)
- Log file: `/tmp/wt-<name>-log` (auto-cleaned on reboot)

**Usage from command line:**

```bash
bash .claude/skills/worktree-preview/scripts/wt-server.sh start mobile-ux-overhaul 3001
bash .claude/skills/worktree-preview/scripts/wt-server.sh status mobile-ux-overhaul
bash .claude/skills/worktree-preview/scripts/wt-server.sh logs mobile-ux-overhaul
bash .claude/skills/worktree-preview/scripts/wt-server.sh stop mobile-ux-overhaul
```

## Key Design Decisions

### Why `next dev` directly instead of `npm run dev`?
The project's `npm run dev` wraps Next.js in `nodemon` for auto-restart. From a worktree context, running `next dev` directly is simpler and more predictable -- nodemon's file watching can interfere with the worktree's isolated filesystem.

### Why symlink `.env.local` instead of copying?
Symlinks stay in sync when secrets rotate. A copy would drift out of date, causing hard-to-debug auth failures in the worktree preview.

### Why PID/log files in `/tmp/`?
- Auto-cleaned on reboot (no stale files accumulating)
- Outside the git tree (no `.gitignore` noise)
- Standard Unix convention for ephemeral process state

### Why `git -C <path>` instead of `cd`?
Works from any directory without subshell state management. Cleaner for scripting and avoids `cd` side effects.

### Why port 3001 as default?
- Port 3000: main dev server
- Ports 54321-54324: Supabase services
- Port 3001: safe default, no conflicts

## Project Files

| File | Role |
|------|------|
| `.claude/skills/worktree-preview/SKILL.md` | This skill definition |
| `.claude/skills/worktree-preview/scripts/wt-server.sh` | Dev server lifecycle manager |
| `.claude/worktrees/` | Directory containing all git worktrees |
| `scripts/development/dev-server.sh` | Main dev server manager (reference) |
| `package.json` | `NODE_OPTIONS` value, `npm run dev` definition |

## Error Handling

| Situation | Action |
|-----------|--------|
| Worktree doesn't exist | List available worktrees, ask user to pick |
| Port already in use | Show what's using it, offer to kill or pick another port |
| `node_modules` missing | Auto-install with `npm install --prefer-offline` |
| `.env.local` missing in main dir | Warn: "No .env.local found -- server may fail to connect to services" |
| `gh` CLI not installed | Skip PR status checks, note limitation |
| Server fails to start | Show last 20 lines of log, suggest checking for port conflicts or build errors |
| Merge conflicts on sync | Report conflicts, do NOT auto-resolve. Ask user |
| Stash pop fails | Leave stash intact, report the issue |
| Worktree has uncommitted changes | Skip during cleanup, warn user |
| `git worktree prune` fails | Non-fatal, continue with cleanup |

## Examples

### Preview a worktree to test mobile changes

```
/wt preview mobile-ux-overhaul
```

Opens a dev server at http://localhost:3001 serving the mobile-ux-overhaul worktree. Test the changes in the browser while the main dev server stays on port 3000.

### Preview on a custom port

```
/wt preview landing-page-lovable --port 3002
```

Useful when port 3001 is already occupied by another worktree preview.

### Check what worktrees are active

```
/wt list
```

Shows all worktrees with branch names, last commit, uncommitted file counts, PR status, and whether a dev server is running.

### Pull latest main after merging a PR

```
/wt sync
```

Safely stashes any uncommitted work, pulls latest main, and restores the stash. Reports what commits were pulled.

### Clean up after a sprint

```
/wt cleanup
```

Finds worktrees whose PRs are merged or closed, shows a removal plan, and asks for confirmation before deleting. Reports disk space freed.

### Full workflow: create, preview, and clean up

```
# 1. Create a worktree (built-in Claude Code feature)
EnterWorktree(name="my-feature")

# 2. Make changes, commit, push, create PR
# ... (normal development)

# 3. Preview changes in browser
/wt preview my-feature

# 4. After PR is merged, sync main and clean up
/wt sync
/wt cleanup
```

### Stop a running preview server

```
# Via the script directly
bash .claude/skills/worktree-preview/scripts/wt-server.sh stop mobile-ux-overhaul
```

Or just tell Claude: "Stop the worktree preview for mobile-ux-overhaul"

### Debug a failing preview server

```
# Check server status
bash .claude/skills/worktree-preview/scripts/wt-server.sh status mobile-ux-overhaul

# View server logs
bash .claude/skills/worktree-preview/scripts/wt-server.sh logs mobile-ux-overhaul
```
