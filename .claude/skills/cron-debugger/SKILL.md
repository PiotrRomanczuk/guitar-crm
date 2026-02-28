---
name: cron-debugger
description: Inspect and troubleshoot cron job execution in Strummy. Use when a cron job is failing, you need to test a job locally, check recent execution history, or get an overview of all scheduled jobs and their status.
---

# Cron Debugger

## Overview

Inspect, test, and troubleshoot the 12 cron jobs in Strummy. Supports four actions: list (overview), test (invoke locally), history (recent executions), and diagnose (root-cause analysis for failures).

**Cron architecture**: Jobs are split across Vercel cron (`vercel.json`) and GitHub Actions (`.github/workflows/cron-jobs.yml`). A dispatcher (`/api/cron/dispatcher`) orchestrates daily jobs into a single Vercel cron invocation to work within the Hobby plan limit.

## Usage

```
/cron-debugger list                              # Show all 12 jobs with schedules
/cron-debugger test process-notification-queue    # Invoke a job locally
/cron-debugger history                           # Check recent executions
/cron-debugger history lesson-reminders          # History for specific job
/cron-debugger diagnose weekly-digest            # Root-cause a failing job
```

## Actions

### list

Display all cron jobs in a summary table.

Read these files to build the table:
- `vercel.json` (Vercel cron definitions)
- `.github/workflows/cron-jobs.yml` (GitHub Actions schedules)
- `app/api/cron/dispatcher/route.ts` (dispatcher job registry)

Output a table with columns: #, Job Name, Schedule (cron expression), Human-Readable, Platform (Vercel/GH Actions), Via Dispatcher (Yes/No). Parse schedules from `vercel.json` and `.github/workflows/cron-jobs.yml`. Note that GH Actions handles notification-queue (every 15 min) and admin-monitoring (hourly) due to Vercel Hobby plan limits.

### test

Invoke a single cron job locally via curl and report results.

**Prerequisites:**
- Dev server running (`npm run dev`)
- `CRON_SECRET` available in `.env.local`

**Steps:**

1. Read `CRON_SECRET` from environment:

```bash
# Extract CRON_SECRET from .env.local
grep CRON_SECRET .env.local | cut -d'=' -f2
```

2. Invoke the endpoint:

```bash
curl -s -w "\n%{http_code}\n%{time_total}" \
  -H "Authorization: Bearer <CRON_SECRET>" \
  http://localhost:3000/api/cron/<job-name>
```

3. Parse and report: Show job name, HTTP status, duration, and response JSON. For the dispatcher, show per-job breakdown table (name, status, duration). On failure (4xx/5xx), parse the error and suggest running `/cron-debugger diagnose <job-name>`.

### history

Check recent execution history. Two sources depending on platform:

**Vercel**: Use `npx vercel logs --filter "cron" --since 24h` (requires Vercel CLI).

**GitHub Actions**: Use gh CLI to list recent runs and check failures:

```bash
gh run list --workflow=cron-jobs.yml --limit 20
gh run view <run-id> --log-failed
```

Output a table with: Run ID, Job, Status, Started, Duration. For failures, show error details.

### diagnose

Perform root-cause analysis on a failing cron job.

**Steps:**

1. **Read the route file**:

```bash
# Read the job's route.ts
cat app/api/cron/<job-name>/route.ts
```

2. **Check environment variables** used by the job:

Scan the route file for `process.env.*` references. Verify each is set:

```bash
# Check if required env vars are set (without revealing values)
grep -oP 'process\.env\.(\w+)' app/api/cron/<job-name>/route.ts | sort -u
```

Then verify each exists in `.env.local`:

```bash
grep -c "VAR_NAME" .env.local
```

3. **Check imports and dependencies**:

Trace the import chain to identify missing services:

```
app/api/cron/lesson-reminders/route.ts
  -> lib/services/email-service.ts (SMTP_HOST, SMTP_PORT required)
  -> lib/supabase/admin.ts (SUPABASE_SERVICE_ROLE_KEY required)
  -> lib/logging/notification-logger.ts (logCronStart, logCronComplete, logCronError)
```

4. **Check for common issues**:

| Issue | How to Detect | Fix |
|---|---|---|
| Missing CRON_SECRET | `verifyCronSecret` returns 401/500 | Set `CRON_SECRET` in `.env.local` |
| Missing env var | `process.env.X` is undefined | Add to `.env.local` |
| DB connection failure | Supabase query throws | Check `SUPABASE_SERVICE_ROLE_KEY` |
| Timeout (>60s) | `maxDuration` exceeded | Optimize query or increase limit |
| Import error | Module not found | Check import paths |
| Email service down | SMTP connection refused | Verify SMTP config |
| Rate limit hit | 429 response from external API | Add backoff or reduce frequency |

5. **Check dispatcher TODOs** (if job runs through dispatcher):

The dispatcher has 5 documented TODOs that may affect job execution:

```
TODO 1: Extract inline logic into service functions
TODO 2: Add per-job timeout (currently no timeout per job)
TODO 3: Evaluate job frequency (some may not need daily runs)
TODO 4: Add structured logging / Sentry breadcrumbs
TODO 5: Consider moving ALL scheduling to GitHub Actions
```

6. **Output diagnosis**: Show route file info, auth method, env var status ([OK]/[MISSING]), dependency chain status, common issues check, and prioritized recommendations.

## Key Project Files

| File | Role |
|---|---|
| `vercel.json` | Vercel cron schedule definitions (11 jobs) |
| `.github/workflows/cron-jobs.yml` | GH Actions for high-frequency jobs (2 schedules) |
| `app/api/cron/dispatcher/route.ts` | Central dispatcher (orchestrates all daily jobs) |
| `lib/auth/cron-auth.ts` | `verifyCronSecret()` authentication function |
| `lib/logging/notification-logger.ts` | `logCronStart`, `logCronComplete`, `logCronError` |
| `app/api/cron/*/route.ts` | Individual cron job route handlers |

## Cron Job Reference

| Job | Route File | Key Service | Frequency |
|---|---|---|---|
| drive-video-scan | `app/api/cron/drive-video-scan/route.ts` | Google Drive API | Daily 3 AM |
| process-notification-queue | `app/api/cron/process-notification-queue/route.ts` | `notification-queue-processor` | Every 15 min |
| lesson-reminders | `app/api/cron/lesson-reminders/route.ts` | Email service | Daily 10 AM |
| assignment-due-reminders | `app/api/cron/assignment-due-reminders/route.ts` | Email service | Daily 9 AM |
| assignment-overdue-check | `app/api/cron/assignment-overdue-check/route.ts` | Email service | Daily 6 PM |
| daily-report | `app/api/cron/daily-report/route.ts` | `send-admin-report` action | Daily 6 AM |
| weekly-digest | `app/api/cron/weekly-digest/route.ts` | Email service | Sunday 6 PM |
| weekly-insights | `app/api/cron/weekly-insights/route.ts` | `send-weekly-insights` action | Monday 9 AM |
| admin-monitoring | `app/api/cron/admin-monitoring/route.ts` | `notification-monitoring` | Hourly |
| renew-webhooks | `app/api/cron/renew-webhooks/route.ts` | `webhook-renewal` service | Daily midnight |
| update-student-status | `app/api/cron/update-student-status/route.ts` | `student-activity-service` | Daily 2 AM |
| dispatcher | `app/api/cron/dispatcher/route.ts` | All of the above | Daily 6 AM |

## Local Testing Quick Reference

```bash
# Single job
export CRON_SECRET=$(grep CRON_SECRET .env.local | cut -d'=' -f2)
curl -s -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/<job-name> | jq .

# Dispatcher (all daily jobs)
curl -s -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/dispatcher | jq .

# GitHub Actions manual trigger
gh workflow run cron-jobs.yml --field job=notification-queue
```

## Error Handling

| Situation | Action |
|---|---|
| Dev server not running | Print: "Start the dev server first: `npm run dev`" |
| CRON_SECRET not in .env.local | Print: "Add CRON_SECRET=<value> to .env.local" |
| gh CLI not installed | Skip GH Actions history, suggest: `brew install gh` |
| Job returns 401 | CRON_SECRET mismatch between .env.local and request |
| Job returns 500 | Parse error response, run diagnose action |
| Curl timeout | Job likely exceeds maxDuration, suggest optimization |
| Vercel CLI not available | Skip Vercel-specific history, note limitation |

## Examples

### Morning check: are all jobs healthy?

```
/cron-debugger list
/cron-debugger history
```

### A job failed in production

```
/cron-debugger diagnose lesson-reminders
/cron-debugger test lesson-reminders
```

### Testing a new cron job locally before deploy

```
/cron-debugger test my-new-job
```

### Checking if GitHub Actions crons are firing

```
/cron-debugger history
```

Shows the last 20 GH Actions runs with pass/fail status and duration.
