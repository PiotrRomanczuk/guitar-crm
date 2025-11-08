# GitHub Actions CI/CD - Complete Setup Guide

This guide will help you set up and configure GitHub Actions for the Guitar CRM project.

## 🚀 Quick Start

1. **Push the workflow file** (already created):

   ```bash
   git add .github/workflows/ci-cd.yml
   git commit -m "Add GitHub Actions CI/CD workflow"
   git push
   ```

2. **Configure secrets** using the setup script:

   ```bash
   ./scripts/setup-github-actions.sh
   ```

3. **Monitor the workflow**:
   - Go to your repository on GitHub
   - Click "Actions" tab
   - Watch your first workflow run

## 📋 Prerequisites

### Required Tools

- **GitHub CLI** (`gh`):

  ```bash
  brew install gh
  gh auth login
  ```

- **Vercel CLI** (for deployment):

  ```bash
  npm i -g vercel
  vercel login
  vercel link
  ```

- **Supabase CLI** (for local testing):
  ```bash
  brew install supabase/tap/supabase
  ```

### Required Accounts

- GitHub account with repository access
- Supabase project (https://supabase.com)
- Vercel account (https://vercel.com)
- Optional: Codecov account (https://codecov.io)

## 🔐 Secrets Configuration

### Method 1: Automated Setup (Recommended)

Run the setup script:

```bash
chmod +x scripts/setup-github-actions.sh
./scripts/setup-github-actions.sh
```

This script will:

- ✅ Read values from `.env.local`
- ✅ Extract Vercel project IDs from `.vercel/project.json`
- ✅ Prompt for missing values
- ✅ Automatically set all GitHub secrets

### Method 2: Manual Setup

#### Step 1: Get Supabase Credentials

**For Production:**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

**For Local Development (Testing):**

```bash
supabase start
supabase status
```

#### Step 2: Get Vercel Credentials

**Option A: Using Vercel CLI**

```bash
vercel link
cat .vercel/project.json
```

**Option B: From Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → General
4. Copy:

   - **Project ID** → `VERCEL_PROJECT_ID`
   - **Team/Org ID** → `VERCEL_ORG_ID`

5. Go to Account Settings → Tokens
6. Create a new token → `VERCEL_TOKEN`

#### Step 3: Add Secrets to GitHub

**Via GitHub CLI:**

```bash
# Supabase
gh secret set NEXT_PUBLIC_SUPABASE_URL
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY
gh secret set SUPABASE_SERVICE_ROLE_KEY

# Vercel
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID

# Optional: Codecov
gh secret set CODECOV_TOKEN
```

**Via GitHub Web UI:**

1. Go to your repository on GitHub
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with its value

### Secrets Summary

| Secret Name                     | Required    | Where to Get             | Purpose             |
| ------------------------------- | ----------- | ------------------------ | ------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅ Yes      | Supabase Dashboard → API | Database connection |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes      | Supabase Dashboard → API | Public API key      |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✅ Yes      | Supabase Dashboard → API | Admin operations    |
| `VERCEL_TOKEN`                  | ✅ Yes      | Vercel Account → Tokens  | Deployment auth     |
| `VERCEL_ORG_ID`                 | ✅ Yes      | `.vercel/project.json`   | Vercel organization |
| `VERCEL_PROJECT_ID`             | ✅ Yes      | `.vercel/project.json`   | Vercel project      |
| `CODECOV_TOKEN`                 | ⚪ Optional | codecov.io               | Coverage reports    |

## 🔄 Workflow Overview

### Workflow Triggers

The CI/CD pipeline runs on:

- **Push to branches:**

  - `main` - Full pipeline + production deploy
  - `develop` - Full pipeline
  - `feature/**` - Full pipeline
  - `fix/**` - Full pipeline

- **Pull requests to:**
  - `main` - Full pipeline + preview deploy
  - `develop` - Full pipeline + preview deploy

### Pipeline Stages

```
Stage 1: Code Quality (Parallel)
├─ Lint & Type Check
├─ Unit Tests (with coverage)
├─ Database Quality
└─ Security Audit
         ↓
Stage 2: Build & Test
├─ Build Next.js App
└─ E2E Tests (Cypress)
         ↓
Stage 3: Quality Gate
└─ Aggregate Results
         ↓
Stage 4: Deploy
├─ Production (main branch only)
└─ Preview (pull requests)
```

### Job Details

| Job                   | Duration | Purpose                  | Artifacts           |
| --------------------- | -------- | ------------------------ | ------------------- |
| **Lint & Type Check** | ~30s     | ESLint + TypeScript      | None                |
| **Unit Tests**        | ~1-2min  | Jest with 70% coverage   | Coverage reports    |
| **Build**             | ~2-3min  | Next.js production build | .next directory     |
| **E2E Tests**         | ~3-5min  | Cypress with Supabase    | Screenshots, videos |
| **Database Quality**  | ~1-2min  | Schema validation        | None                |
| **Security Audit**    | ~30s     | npm audit + secrets scan | None                |
| **Quality Gate**      | ~10s     | Aggregate results        | None                |
| **Deploy**            | ~1-2min  | Vercel deployment        | Deployment URL      |

**Total Pipeline Time:** ~8-12 minutes

## 🎯 Running Locally (Before Push)

### Pre-commit Checks

Always run quality checks before committing:

```bash
npm run quality
```

This runs:

- ✅ ESLint
- ✅ TypeScript type checking
- ✅ Jest tests with coverage
- ✅ TODO validation

### Test Specific Parts

```bash
# Lint only
npm run lint

# Type check only
npx tsc --noEmit

# Unit tests
npm run test:ci

# E2E tests (requires Supabase running)
npm run e2e

# Database quality
npm run db:quality
```

### Full Local Pipeline Simulation

```bash
# 1. Start Supabase
supabase start

# 2. Run all checks
npm run quality

# 3. Build
npm run build

# 4. E2E tests
npm run e2e

# 5. Database checks
npm run db:quality
```

## 📊 Monitoring & Debugging

### View Workflow Runs

1. Go to https://github.com/YOUR_USERNAME/guitar-crm/actions
2. Click on a workflow run
3. Expand individual jobs to see logs

### Common Issues & Solutions

#### ❌ Build Fails: "Module not found"

**Cause:** Missing dependencies
**Solution:**

```bash
npm ci
git add package-lock.json
git commit -m "Update dependencies"
```

#### ❌ Tests Fail: "Coverage below threshold"

**Cause:** Test coverage < 70%
**Solution:**

```bash
npm run test:coverage
# Check coverage/lcov-report/index.html
# Add more tests
```

#### ❌ E2E Fails: "Supabase connection timeout"

**Cause:** Supabase not starting in CI
**Solution:** Check `.github/workflows/ci-cd.yml`:

```yaml
wait-on-timeout: 180 # Increase timeout
```

#### ❌ Deploy Fails: "Invalid token"

**Cause:** Wrong or expired Vercel token
**Solution:**

```bash
vercel login
vercel token create
gh secret set VERCEL_TOKEN
```

#### ❌ Security Audit Fails: "High vulnerabilities"

**Cause:** Vulnerable dependencies
**Solution:**

```bash
npm audit
npm audit fix
# Or update specific packages
npm update
```

### Debugging Steps

1. **Check the logs:**

   - Actions tab → Click failed run → Expand job → View logs

2. **Reproduce locally:**

   ```bash
   # Run the exact command that failed
   npm run test:ci  # or whatever failed
   ```

3. **Check secrets:**

   ```bash
   gh secret list  # View all secrets
   ```

4. **Re-run workflow:**
   - Actions tab → Click run → Re-run failed jobs

## 🎨 Customization

### Change Node Version

Edit `.github/workflows/ci-cd.yml`:

```yaml
env:
  NODE_VERSION: '20' # Change from 18 to 20
```

### Adjust Coverage Thresholds

Edit `.github/workflows/ci-cd.yml` in the `unit-tests` job:

```yaml
if (( $(echo "$STATEMENTS < 80" | bc -l) )) || \
(( $(echo "$BRANCHES < 80" | bc -l) )) || \
(( $(echo "$FUNCTIONS < 80" | bc -l) )) || \
(( $(echo "$LINES < 80" | bc -l) )); then
```

### Disable Jobs

Comment out or remove jobs you don't need:

```yaml
# jobs:
#   e2e-tests:  # Disable E2E tests
#     name: E2E Tests
#     ...
```

Don't forget to remove from dependencies:

```yaml
deploy-production:
  needs: [quality-gate] # Remove e2e-tests from here
```

### Add More Test Browsers

Edit the E2E job matrix:

```yaml
strategy:
  matrix:
    browser: [chrome, firefox, edge]
```

### Environment-Specific Deployments

Add staging environment:

```yaml
deploy-staging:
  name: Deploy to Staging
  if: github.ref == 'refs/heads/develop'
  environment:
    name: staging
    url: https://staging.guitar-crm.vercel.app
  steps:
    - name: Deploy to Staging
      run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }}
```

## 📈 Best Practices

### Commits

- ✅ Always run `npm run quality` before committing
- ✅ Write descriptive commit messages
- ✅ Keep commits small and focused
- ✅ Reference issues in commits: `fix: resolve login issue (#123)`

### Branches

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `chore/task-name` - Maintenance tasks

### Pull Requests

- ✅ Link related issues
- ✅ Add description of changes
- ✅ Request reviews
- ✅ Wait for CI to pass
- ✅ Check preview deployment

### Performance

- ✅ Cache dependencies (already configured)
- ✅ Run jobs in parallel when possible
- ✅ Use artifacts for build outputs
- ✅ Keep test suite fast (< 10 min total)

## 🆘 Getting Help

### Resources

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Vercel Deployment:** https://vercel.com/docs/cli
- **Supabase CI/CD:** https://supabase.com/docs/guides/cli/cicd-workflow
- **Cypress CI:** https://docs.cypress.io/guides/continuous-integration

### Project-Specific

- **Scripts Documentation:** `/scripts/README.md`
- **Database Setup:** `/docs/guides/SEEDING_GUIDE.md`
- **Deployment Guide:** `/docs/DEPLOYMENT.md`
- **Project Overview:** `/docs/PROJECT_OVERVIEW.md`

### Support

- **Create an issue:** https://github.com/PiotrRomanczuk/guitar-crm/issues
- **Check Actions logs:** https://github.com/PiotrRomanczuk/guitar-crm/actions
- **Review recent changes:** `git log --oneline`

## ✅ Verification Checklist

Before considering setup complete:

- [ ] All secrets configured in GitHub
- [ ] `.github/workflows/ci-cd.yml` exists
- [ ] Workflow runs on push to main
- [ ] All jobs pass (green checkmarks)
- [ ] Vercel deployment successful
- [ ] Preview deployments work on PRs
- [ ] Coverage reports uploaded to Codecov (optional)
- [ ] Status badge added to README (optional)

## 🎉 Success!

Once setup is complete:

1. ✅ Every push triggers automated tests
2. ✅ Pull requests get preview deployments
3. ✅ Main branch deploys to production automatically
4. ✅ Coverage is tracked and enforced
5. ✅ Security issues are caught early

Your CI/CD pipeline is now protecting your code quality! 🚀
