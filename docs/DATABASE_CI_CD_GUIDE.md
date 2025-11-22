# Database Management in CI/CD Pipeline

**Status**: Current approach as of November 2024  
**Last Updated**: November 21, 2024

---

## Overview

This guide explains how the Guitar CRM CI/CD pipeline handles database operations, specifically addressing the distinction between **database validation** and **database setup/reset**.

## Core Principle

**The CI/CD pipeline VALIDATES the existing database state; it does NOT reset or modify it.**

This approach provides several benefits:
- **Safety**: Prevents accidental data loss during automated testing
- **Consistency**: All test runs use the same database state
- **Explicitness**: Database changes are manual and trackable
- **Separation of Concerns**: Testing is separate from database administration

---

## Pipeline Database Flow

### 1. Database Quality Check (Job 4)

**Purpose**: Validate that the remote database is in a good state for testing

**What it does**:
- ✅ Checks database connectivity
- ✅ Validates schema integrity (compares with migrations)
- ✅ Verifies test data presence (users, songs, lessons)
- ✅ Detects data quality issues (orphaned records, missing roles)
- ✅ Ensures no production data in test environment

**What it does NOT do**:
- ❌ Reset the database
- ❌ Apply migrations
- ❌ Modify existing data
- ❌ Create or delete records

**Configuration**:
```yaml
database-quality:
  runs-on: ubuntu-latest
  needs: [build]
  steps:
    - name: Setup Supabase CLI
    - name: Link to Remote Supabase
    - name: Check Database Schema Integrity
      # Non-blocking schema diff check
      continue-on-error: true
    - name: Run Database Quality Checks
      # Validates test data and structure
```

**Key Script**: `scripts/database/maintenance/check-db-quality.sh`

### 2. E2E Tests (Job 5)

**Purpose**: Run end-to-end tests against the existing database

**What it does**:
- ✅ Runs Cypress tests
- ✅ Uses existing database state
- ✅ May create test records during tests
- ✅ Tests user workflows

**What it does NOT do**:
- ❌ Reset database before tests
- ❌ Clean up test data automatically
- ❌ Apply migrations

**Dependencies**:
```yaml
e2e-tests:
  needs: [database-quality]
  # Runs AFTER database validation passes
```

---

## Database Setup vs. Validation

### Setup (Manual - NOT in CI/CD)

Database setup should be done **manually** by developers or administrators:

```bash
# Link to test/staging database
supabase link --project-ref YOUR_TEST_PROJECT_REF

# Apply all migrations
supabase db push

# Seed with test data (first time only)
supabase db push --include-seed
```

**When to do manual setup:**
- Initial test database creation
- After adding new migrations
- When database quality checks indicate schema mismatch
- When test data needs to be refreshed

### Validation (Automatic - IN CI/CD)

The pipeline automatically validates the database:

```yaml
# 1. Schema validation (informational only)
supabase db diff --linked --use-migra

# 2. Data quality checks
./scripts/database/maintenance/check-db-quality.sh
```

**When validation runs:**
- On every push to main, develop, feature branches
- On every pull request
- Before E2E tests execute

---

## Required Secrets for Database Operations

The CI/CD pipeline needs these secrets for database validation:

| Secret                    | Purpose                          | Where to Get                |
| ------------------------- | -------------------------------- | --------------------------- |
| `SUPABASE_PROJECT_ID`     | Identifies the test database     | Supabase Dashboard → URL    |
| `SUPABASE_DB_PASSWORD`    | Direct PostgreSQL access         | Supabase Dashboard → Database Settings |
| `SUPABASE_ACCESS_TOKEN`   | Supabase CLI authentication      | Supabase Dashboard → Account Settings |

**Important**: These should point to a **test/staging database**, NOT production!

---

## Common Scenarios

### Scenario 1: New Migration Created

**What happens:**
1. Developer creates new migration file
2. Developer applies migration locally: `supabase db push`
3. Developer commits migration file to Git
4. **Before pushing to GitHub**: Manually apply to test database
   ```bash
   # Link to test DB
   supabase link --project-ref TEST_PROJECT_REF
   
   # Apply migration
   supabase db push
   ```
5. Push code to GitHub
6. CI/CD validates the schema is correct
7. E2E tests run against updated schema

**Why manual?** Ensures migration is tested and reviewed before automated tests run.

### Scenario 2: Database Quality Check Fails

**Symptoms:**
- CI/CD job "Database Quality" fails
- Error messages about missing test data or schema issues

**Resolution:**
```bash
# Check what's wrong
npm run db:quality

# If schema mismatch:
supabase db push

# If missing test data:
supabase db push --include-seed

# Or manually run seed scripts
npm run seed:remote
```

### Scenario 3: Schema Drift Detected

**Symptoms:**
- "Check Database Schema Integrity" step shows differences
- Message: "Database schema differs from migrations"

**Resolution:**
```bash
# View differences
supabase db diff --linked

# If migrations are correct, apply them:
supabase db push

# If migrations need updating:
# 1. Review schema changes
# 2. Create new migration if needed
# 3. Apply to test database
```

**Note**: This check is informational and doesn't fail the build.

### Scenario 4: Starting Fresh

**When needed:**
- Test database is corrupted
- Too much test data accumulated
- Major schema refactoring

**How to do it:**
```bash
# Connect to test database
supabase link --project-ref TEST_PROJECT_REF

# DANGER: This wipes everything!
supabase db reset --linked

# This re-applies all migrations + seed data
```

**Important**: Do this manually, NOT in CI/CD!

---

## Environment Separation

### Test/Staging Database (for CI/CD)
- Used by CI/CD pipeline
- Contains test data only
- Can be reset without consequences
- Schema should match production

### Production Database
- Never accessed by CI/CD pipeline
- Migrations applied manually with review
- Protected by strict access controls
- Monitored and backed up regularly

---

## Migration Strategy

### Development Flow

```
1. Developer creates migration locally
   └─> supabase migration new <name>

2. Developer applies migration locally
   └─> supabase db push

3. Developer tests changes locally
   └─> npm run dev

4. Developer applies to test database
   └─> supabase link --project-ref TEST_PROJECT_REF
   └─> supabase db push

5. Developer commits migration
   └─> git add supabase/migrations/
   └─> git commit -m "feat(db): add new table"

6. CI/CD validates (no modifications)
   └─> Database Quality Check passes
   └─> E2E tests use new schema

7. After PR approval, apply to production
   └─> supabase link --project-ref PROD_PROJECT_REF
   └─> supabase db push  # With careful review!
```

### Why Not Automatic?

We don't automatically apply migrations in CI/CD because:
- **Safety**: Prevents accidental schema changes
- **Review**: Migrations should be reviewed before production
- **Rollback**: Manual application allows for easier rollback
- **Control**: Separates testing from database administration
- **Auditability**: Manual application creates clear audit trail

---

## Troubleshooting

### "Database Quality Check Failed"

**Check:**
1. Is the test database accessible?
2. Are migrations applied?
3. Is test data seeded?
4. Are role flags set correctly on profiles?

**Fix:**
```bash
# Validate connectivity
npm run db:quality

# Check schema
supabase db diff --linked

# Re-seed if needed
supabase db push --include-seed
```

### "E2E Tests Can't Find Data"

**Likely cause**: Test database not seeded

**Fix:**
```bash
# Seed test data
supabase db push --include-seed

# Or use remote seed script
npm run seed:remote
```

### "Schema Validation Shows Differences"

**This is informational**, not an error. It means:
- Your migrations directory has changes not yet in the test database
- Or the test database has manual changes not reflected in migrations

**Resolution:**
```bash
# Review differences
supabase db diff --linked

# Apply migrations if correct
supabase db push

# Or create migration from database changes
supabase db diff --linked | supabase migration new <name>
```

---

## Best Practices

### ✅ DO:
- Apply migrations manually to test database before pushing code
- Keep test database schema in sync with migrations
- Use separate databases for test and production
- Run `npm run db:quality` locally before committing
- Document migration dependencies in PR descriptions

### ❌ DON'T:
- Reset database in CI/CD workflows
- Automatically apply migrations in CI/CD
- Use production database for testing
- Bypass database quality checks
- Leave test database in unknown state

---

## Scripts Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `npm run db:quality` | Run database quality checks locally | Before committing |
| `supabase db push` | Apply migrations to linked database | After creating migrations |
| `supabase db push --include-seed` | Apply migrations + seed data | First-time setup |
| `supabase db reset --linked` | Reset database completely | When starting fresh |
| `supabase db diff --linked` | Show schema differences | Debugging schema issues |
| `npm run seed:remote` | Interactive remote seeding | Adding test data |

---

## Related Documentation

- **CI/CD Setup**: `docs/GITHUB_ACTIONS_SETUP.md`
- **CI/CD Status**: `docs/CI_CD_STATUS.md`
- **Deployment Guide**: `docs/DEPLOYMENT.md`
- **Database Quality Script**: `scripts/database/maintenance/check-db-quality.sh`

---

## FAQ

**Q: Why not reset the database on every test run?**  
A: Resetting is expensive (time-consuming) and unnecessary. Validating the existing state is faster and safer.

**Q: What if E2E tests pollute the database with test data?**  
A: Acceptable for test databases. Reset manually when needed. Production databases are never touched by CI/CD.

**Q: How do I know if migrations need to be applied?**  
A: The "Database Schema Integrity" check will show differences. It's informational only.

**Q: Can I apply migrations automatically in CI/CD?**  
A: You could, but we explicitly don't for safety and control. Migrations should be reviewed and applied deliberately.

**Q: What if the test database gets corrupted?**  
A: Reset it manually with `supabase db reset --linked`. CI/CD doesn't auto-recover.

**Q: Should I create a migration for every schema change?**  
A: Yes! Never make manual schema changes. Always use migrations for version control and deployability.

---

**Summary**: The CI/CD pipeline validates database quality but never modifies it. Database setup and migration application are manual, deliberate operations performed by developers and administrators. This approach prioritizes safety, control, and auditability over automation.
