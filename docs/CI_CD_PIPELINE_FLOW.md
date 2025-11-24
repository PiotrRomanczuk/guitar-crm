# CI/CD Pipeline Flow - Visual Guide

**Updated**: November 21, 2024  
**Version**: 2.0 (Validation-First Approach)

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CI/CD PIPELINE FLOW                           │
│                     (Validation-First Approach)                      │
└─────────────────────────────────────────────────────────────────────┘

STAGE 1: CODE QUALITY (Parallel - No Dependencies)
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ Lint & Type Check   │  │   Unit Tests        │  │  Security Audit     │
│                     │  │                     │  │                     │
│ • ESLint            │  │ • Jest              │  │ • npm audit         │
│ • TypeScript check  │  │ • 70% coverage      │  │ • Secret scanning   │
│ • ~30 seconds       │  │ • ~1-2 minutes      │  │ • ~30 seconds       │
└──────────┬──────────┘  └──────────┬──────────┘  └──────────┬──────────┘
           │                        │                         │
           └────────────┬───────────┘                         │
                        │                                     │
                        ▼                                     │
                                                              │
STAGE 2: BUILD APPLICATION                                    │
┌─────────────────────────────────────────────────────────────┐        │
│                    Build Next.js App                         │        │
│                                                              │        │
│ • Next.js production build                                  │        │
│ • Artifact: .next directory                                 │        │
│ • ~2-3 minutes                                               │        │
└──────────────────────────┬───────────────────────────────────┘        │
                           │                                            │
                           ▼                                            │
                                                                        │
STAGE 3: DATABASE VALIDATION (NEW ORDER!)                              │
┌─────────────────────────────────────────────────────────────┐        │
│            Database Quality & Schema Validation              │        │
│                                                              │        │
│ ✅ Link to remote Supabase                                  │        │
│ ✅ Validate schema integrity (non-blocking)                 │        │
│ ✅ Check test data presence                                 │        │
│ ✅ Verify no production data                                │        │
│ ✅ Validate role flags                                      │        │
│ ❌ Does NOT reset database                                  │        │
│ ❌ Does NOT apply migrations                                │        │
│                                                              │        │
│ • ~1-2 minutes                                               │        │
└──────────────────────────┬───────────────────────────────────┘        │
                           │                                            │
                           ▼                                            │
                                                                        │
STAGE 4: E2E TESTING                                                    │
┌─────────────────────────────────────────────────────────────┐        │
│               E2E Tests (Cypress)                            │        │
│                                                              │        │
│ • Runs against validated database                           │        │
│ • No database reset                                         │        │
│ • Tests use existing data                                   │        │
│ • Screenshots & videos on failure                           │        │
│ • ~3-5 minutes                                               │        │
└──────────────────────────┬───────────────────────────────────┘        │
                           │                                            │
                           └────────────┬───────────────────────────────┘
                                        │
                                        ▼
STAGE 5: QUALITY GATE
┌─────────────────────────────────────────────────────────────┐
│                    Quality Gate Summary                      │
│                                                              │
│ Aggregates results from:                                    │
│ • Lint & Type Check                                         │
│ • Unit Tests                                                │
│ • Build                                                     │
│ • Database Quality                                          │
│ • Security Audit                                            │
│                                                              │
│ All must pass to proceed                                    │
└──────────────────────────┬───────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
┌───────────────────────┐   ┌───────────────────────┐
│ Deploy Production     │   │  Deploy Preview       │
│                       │   │                       │
│ • Only on main branch │   │ • Only on PRs         │
│ • Requires E2E pass   │   │ • Requires quality    │
│ • ~1-2 minutes        │   │   gate pass           │
└───────────────────────┘   └───────────────────────┘
```

---

## Key Changes from Version 1.0

### Job Order Change

```
┌──────────────────────────────────────────────────────────────┐
│ BEFORE (Reset Approach)                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Build → E2E Tests (with DB reset) → Database Quality        │
│         ⬆                                                    │
│         └─ Reset database here                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ AFTER (Validation Approach)                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Build → Database Quality → E2E Tests (no reset)             │
│         ⬆                                                    │
│         └─ Validate database here                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Database Quality Job Changes

```
┌─────────────────────────────────────────────────────────────┐
│ BEFORE: Database Reset                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Link to remote Supabase                                 │
│ 2. ❌ Reset entire database (supabase db reset --linked)   │
│ 3. Apply all migrations                                    │
│ 4. Seed test data                                          │
│ 5. Run quality checks                                      │
│                                                             │
│ Time: ~5-10 minutes                                        │
│ Risk: High (data loss possible)                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ AFTER: Database Validation                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Link to remote Supabase                                 │
│ 2. ✅ Check schema integrity (supabase db diff)            │
│ 3. ✅ Validate test data presence                          │
│ 4. ✅ Check for data quality issues                        │
│ 5. ✅ Verify role flags                                    │
│                                                             │
│ Time: ~1-2 minutes                                         │
│ Risk: Zero (read-only operations)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Management Workflow

### Manual Migration Application (New Requirement)

```
┌────────────────────────────────────────────────────────────────────┐
│                    DEVELOPER WORKFLOW                               │
└────────────────────────────────────────────────────────────────────┘

Step 1: Create Migration
┌─────────────────────┐
│ supabase migration  │
│ new add_new_table   │
└──────────┬──────────┘
           │
           ▼
Step 2: Apply Locally
┌─────────────────────┐
│ supabase db push    │
│ npm run dev         │
│ (test locally)      │
└──────────┬──────────┘
           │
           ▼
Step 3: Apply to Test DB ⚠️  (NEW MANUAL STEP!)
┌─────────────────────────────────────────┐
│ supabase link --project-ref TEST_ID     │
│ supabase db push                        │
│ npm run db:quality  (verify)            │
└──────────┬──────────────────────────────┘
           │
           ▼
Step 4: Commit & Push
┌─────────────────────────────────────────┐
│ git add supabase/migrations/            │
│ git commit -m "feat(db): add table"     │
│ git push                                │
└──────────┬──────────────────────────────┘
           │
           ▼
Step 5: CI/CD Validates (Automatic)
┌─────────────────────────────────────────┐
│ ✅ Database Quality Check passes        │
│ ✅ E2E tests run successfully           │
│ ✅ All quality gates pass               │
└──────────┬──────────────────────────────┘
           │
           ▼
Step 6: Apply to Production (After PR Approval)
┌─────────────────────────────────────────┐
│ supabase link --project-ref PROD_ID     │
│ supabase db push  (with review!)        │
└─────────────────────────────────────────┘
```

---

## Job Dependencies Diagram

```
                    ┌─────────────────────┐
                    │ lint-and-typecheck  │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
          ┌─────────▼─────────┐  ┌────────▼────────┐
          │   unit-tests      │  │ security-audit  │
          └─────────┬─────────┘  └────────┬────────┘
                    │                     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │       build         │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  database-quality   │ ⚠️ MOVED BEFORE E2E
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │     e2e-tests       │ ⚠️ AFTER VALIDATION
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    quality-gate     │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
     ┌──────────▼──────────┐      ┌──────────▼──────────┐
     │ deploy-production   │      │   deploy-preview    │
     │ (main branch only)  │      │   (PRs only)        │
     └─────────────────────┘      └─────────────────────┘
```

---

## Database State Flow

### Before (Reset Approach)

```
┌─────────────┐        ┌──────────────┐        ┌─────────────┐
│  Unknown    │  Reset │   Fresh      │ Tests  │   Unknown   │
│  State      │───────▶│   State      │───────▶│   State     │
│             │        │ (Migrations  │        │ (Modified   │
│             │        │  + Seed)     │        │  by tests)  │
└─────────────┘        └──────────────┘        └─────────────┘
                       ⬆
                       └─ New setup every time (slow!)
```

### After (Validation Approach)

```
┌─────────────┐        ┌──────────────┐        ┌─────────────┐
│  Known      │Validate│   Verified   │ Tests  │   Known     │
│  State      │───────▶│   State      │───────▶│   State     │
│ (Manually   │        │ (Schema +    │        │ (Predictable│
│  prepared)  │        │  Data OK)    │        │  changes)   │
└─────────────┘        └──────────────┘        └─────────────┘
                       ⬆
                       └─ Same state every time (fast!)
```

---

## Success Criteria Comparison

### Before

```
✅ Code builds
✅ Tests pass (70% coverage)
✅ Database resets successfully
✅ Migrations apply
✅ Seed data loads
✅ E2E tests pass
✅ Database quality check passes (after tests)
```

### After

```
✅ Code builds
✅ Tests pass (70% coverage)
✅ Database schema is valid (informational)
✅ Database quality check passes (before tests)
✅ Test data is present
✅ E2E tests pass (against validated DB)
✅ No accidental data modifications
```

---

## Time Savings

### Pipeline Duration

```
BEFORE:
├─ Lint & Type: ~30s
├─ Unit Tests: ~1-2 min
├─ Build: ~2-3 min
├─ E2E + DB Reset: ~8-15 min  ⚠️ SLOW!
├─ DB Quality: ~1-2 min
└─ Total: ~13-23 minutes

AFTER:
├─ Lint & Type: ~30s
├─ Unit Tests: ~1-2 min
├─ Build: ~2-3 min
├─ DB Quality: ~1-2 min  ⚡ FAST!
├─ E2E Tests: ~3-5 min   ⚡ FAST!
└─ Total: ~8-13 minutes

⏱️ SAVINGS: 5-10 minutes per run
```

---

## Required Secrets

### Before (3 secrets)
```
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY
```

### After (6 secrets)
```
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY
✓ SUPABASE_PROJECT_ID          ← NEW
✓ SUPABASE_DB_PASSWORD          ← NEW
✓ SUPABASE_ACCESS_TOKEN         ← NEW
```

---

## Environment Separation

```
┌──────────────────────────────────────────────────────────────┐
│                    DATABASE ENVIRONMENTS                      │
└──────────────────────────────────────────────────────────────┘

Development (Local)
├─ Location: Developer's machine
├─ Purpose: Feature development
├─ Reset: As needed (safe)
└─ Access: Developer only

Test/Staging (Remote)
├─ Location: Cloud (separate project)
├─ Purpose: CI/CD validation
├─ Reset: Manual only (deliberate)
├─ Access: CI/CD + Developers
└─ ⚠️  Configured in GitHub secrets

Production (Remote)
├─ Location: Cloud (production project)
├─ Purpose: Live application
├─ Reset: NEVER
├─ Access: Authorized personnel only
└─ ⚠️  Never accessed by CI/CD
```

---

## Quick Reference

### When Database Quality Check Fails

```bash
# 1. Check what's wrong
npm run db:quality

# 2. If schema mismatch
supabase link --project-ref TEST_PROJECT_REF
supabase db push

# 3. If missing test data
supabase db push --include-seed

# 4. Verify fix
npm run db:quality
```

### When to Reset Database

```bash
# NEVER in CI/CD!
# Only manually when:
# - Test database is corrupted
# - Too much test data accumulated
# - Major schema refactoring

supabase link --project-ref TEST_PROJECT_REF
supabase db reset --linked
```

---

## Documentation Links

- **Complete Guide**: [DATABASE_CI_CD_GUIDE.md](./DATABASE_CI_CD_GUIDE.md)
- **Changes Summary**: [CI_CD_DATABASE_CHANGES_SUMMARY.md](./CI_CD_DATABASE_CHANGES_SUMMARY.md)
- **Setup Guide**: [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)
- **Quick Status**: [CI_CD_STATUS.md](./CI_CD_STATUS.md)

---

**Remember**: The CI/CD pipeline **validates** database quality but does NOT reset or modify it. Database migrations must be applied manually.
