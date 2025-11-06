# GitHub Actions CI/CD - Go-Live Checklist

This checklist ensures your GitHub Actions CI/CD pipeline is properly configured and ready for production.

## ✅ Pre-Launch Checklist

### 1. Files & Configuration

- [x] `.github/workflows/ci-cd.yml` exists
- [x] `scripts/setup-github-actions.sh` exists and is executable
- [x] `docs/GITHUB_ACTIONS_SETUP.md` exists
- [x] `docs/CI_CD_STATUS.md` exists
- [x] `.github/workflows/README.md` exists
- [x] CI badge added to `README.md`
- [x] Jest configuration fixed (`jest.setup.js`)

### 2. Local Environment

- [ ] `.env.local` configured with Supabase credentials
- [ ] `.vercel` directory exists (run `vercel link` if missing)
- [ ] `node_modules` installed (`npm ci`)
- [ ] Local quality checks pass (`npm run quality`)

### 3. GitHub Secrets

Configure these in GitHub repository settings:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`
- [ ] `CODECOV_TOKEN` (optional)

**Quick Setup:** Run `./scripts/setup-github-actions.sh`

### 4. Vercel Configuration

- [ ] Vercel account created
- [ ] Project linked locally (`vercel link`)
- [ ] Environment variables set in Vercel dashboard
- [ ] Auto-deployments disabled (GitHub Actions will handle)

### 5. Repository Settings

- [ ] GitHub Actions enabled (Settings → Actions → General)
- [ ] Workflow permissions set to "Read and write permissions"
- [ ] Branch protection rules configured (optional but recommended)

## 🚀 Launch Steps

### Step 1: Run Verification Script

```bash
./scripts/verify-ci-setup.sh
```

**Expected Output:** All critical checks passing ✅

### Step 2: Commit GitHub Actions Files

```bash
git add .github/workflows/ci-cd.yml
git add .github/workflows/README.md
git add scripts/setup-github-actions.sh
git add scripts/verify-ci-setup.sh
git add docs/GITHUB_ACTIONS_SETUP.md
git add docs/CI_CD_STATUS.md
git add docs/GITHUB_ACTIONS_IMPLEMENTATION.md
git add jest.setup.js
git add README.md

git commit -m "feat: Add GitHub Actions CI/CD pipeline

- Complete workflow with 9 automated jobs
- Automated secret configuration script
- Comprehensive documentation
- Status badge in README
- Jest configuration fixes

Closes #[issue-number]"
```

### Step 3: Push to GitHub

```bash
# Push to feature branch first (recommended)
git checkout -b feat/github-actions-ci-cd
git push origin feat/github-actions-ci-cd

# Or push directly to main
git push origin main
```

### Step 4: Configure GitHub Secrets

**Option A: Automated (Recommended)**
```bash
./scripts/setup-github-actions.sh
```

**Option B: Manual**
1. Go to GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each required secret

### Step 5: Monitor First Workflow Run

1. Go to https://github.com/PiotrRomanczuk/guitar-crm/actions
2. Click on the latest workflow run
3. Watch jobs execute in real-time
4. Verify all jobs pass ✅

### Step 6: Create Test Pull Request

```bash
git checkout -b test/verify-ci
git commit --allow-empty -m "test: Verify CI/CD pipeline"
git push origin test/verify-ci

# Create PR on GitHub
gh pr create --title "Test: Verify CI/CD Pipeline" --body "Testing automated workflows"
```

**Expected Results:**
- ✅ All CI checks pass
- ✅ Preview deployment created
- ✅ Comment added to PR with preview URL

### Step 7: Merge to Main

Once the test PR passes:

```bash
gh pr merge --squash --delete-branch
```

**Expected Results:**
- ✅ Production deployment triggered
- ✅ New version deployed to Vercel

## 🔍 Verification Tests

### Test 1: Lint Check
```bash
npm run lint
```
**Expected:** No errors (warnings are OK)

### Test 2: Type Check
```bash
npx tsc --noEmit
```
**Expected:** No type errors

### Test 3: Unit Tests
```bash
npm run test:ci
```
**Expected:** All tests pass, coverage ≥ 70%

### Test 4: Build
```bash
npm run build
```
**Expected:** Successful build, `.next` directory created

### Test 5: E2E Tests (Local)
```bash
supabase start
npm run e2e
```
**Expected:** All Cypress tests pass

## 📊 Success Indicators

After launching, you should see:

### GitHub Actions Tab
- ✅ Workflow runs appear automatically
- ✅ All jobs have green checkmarks
- ✅ Build artifacts are preserved
- ✅ Total pipeline time: 8-12 minutes

### Pull Requests
- ✅ Automated checks appear on PRs
- ✅ Preview deployments created
- ✅ PR comments with deployment URLs

### Vercel Dashboard
- ✅ Production deployments from main branch
- ✅ Preview deployments from PRs
- ✅ Deployment logs available

### Codecov (Optional)
- ✅ Coverage reports uploaded
- ✅ Coverage trends visible
- ✅ PR comments with coverage diff

## 🐛 Troubleshooting

### Issue: Workflow doesn't trigger

**Solution:**
1. Check GitHub Actions are enabled
2. Verify workflow file syntax (YAML formatting)
3. Push to a watched branch (main, develop, feature/*)

### Issue: Secrets not found

**Solution:**
```bash
gh secret list  # Verify secrets exist
./scripts/setup-github-actions.sh  # Re-run setup
```

### Issue: Build fails in CI but works locally

**Solution:**
1. Check Node.js version matches (currently 18)
2. Run `npm ci` instead of `npm install`
3. Check for missing environment variables

### Issue: Vercel deployment fails

**Solution:**
1. Verify Vercel token is valid: `vercel whoami`
2. Check project is linked: `cat .vercel/project.json`
3. Regenerate token if needed: `vercel login`

### Issue: E2E tests timeout

**Solution:**
1. Increase `wait-on-timeout` in workflow
2. Check Supabase starts successfully in CI logs
3. Verify test data seeds correctly

## 📚 Documentation Reference

- **Complete Setup:** `docs/GITHUB_ACTIONS_SETUP.md`
- **Quick Reference:** `docs/CI_CD_STATUS.md`
- **Workflow Details:** `.github/workflows/README.md`
- **Implementation Summary:** `docs/GITHUB_ACTIONS_IMPLEMENTATION.md`

## 🎉 Post-Launch

Once everything is working:

### Update README
Add more badges (optional):
```markdown
[![codecov](https://codecov.io/gh/PiotrRomanczuk/guitar-crm/branch/main/graph/badge.svg)](https://codecov.io/gh/PiotrRomanczuk/guitar-crm)
```

### Set Up Notifications
Configure GitHub notifications for failed workflows:
- Repository → Settings → Notifications
- Enable email notifications for workflow failures

### Configure Branch Protection
Recommended rules for `main` branch:
- Require status checks to pass
- Require up-to-date branches
- Include administrators
- Allow force pushes: No
- Allow deletions: No

### Schedule Regular Maintenance
Quarterly tasks:
- [ ] Update GitHub Actions versions
- [ ] Review and update dependencies
- [ ] Check for security advisories
- [ ] Review workflow performance

## ✨ You're Live!

Congratulations! Your CI/CD pipeline is now:
- ✅ Automatically testing all code changes
- ✅ Enforcing quality standards
- ✅ Deploying to production safely
- ✅ Creating preview environments for PRs
- ✅ Catching bugs early

**Next Developer Experience:**
1. Developer creates feature branch
2. Developer commits code
3. CI runs automatically (8-12 min)
4. Developer creates PR
5. Preview deployment created
6. Team reviews code + preview
7. PR merged to main
8. Production deployed automatically

**Zero manual steps required!** 🚀

---

**Checklist Last Updated:** November 6, 2025  
**Version:** 1.0  
**Status:** Ready for Production ✅
