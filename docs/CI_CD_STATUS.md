# CI/CD Status & Quick Reference

## 🚦 Status Badges

Add these to your main README.md:

```markdown
[![CI/CD Pipeline](https://github.com/PiotrRomanczuk/guitar-crm/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/PiotrRomanczuk/guitar-crm/actions)
[![codecov](https://codecov.io/gh/PiotrRomanczuk/guitar-crm/branch/main/graph/badge.svg)](https://codecov.io/gh/PiotrRomanczuk/guitar-crm)
```

## ⚡ Quick Commands

### Before Committing

```bash
npm run quality                 # Run all quality checks
npm run lint                    # Lint only
npx tsc --noEmit               # Type check only
npm run test:ci                # Tests with coverage
```

### Local Testing

```bash
npm run dev                     # Start dev server
npm run build                   # Build for production
npm run test:watch             # Watch mode tests
npm run e2e                    # E2E tests (requires Supabase)
```

### GitHub Actions Setup

```bash
./scripts/setup-github-actions.sh    # Auto-configure secrets
gh secret list                       # View all secrets
gh run list                          # View recent workflow runs
gh run view                          # View latest run details
```

### Debugging Failed Workflow

```bash
gh run list --limit 5                      # List recent runs
gh run view <run-id>                       # View specific run
gh run view <run-id> --log-failed         # Show failed job logs
gh run rerun <run-id>                      # Rerun a workflow
gh run rerun <run-id> --failed            # Rerun only failed jobs
```

## 📊 Pipeline Statistics

| Metric              | Target   | Current   |
| ------------------- | -------- | --------- |
| Total Pipeline Time | < 15 min | ~8-12 min |
| Lint & Type Check   | < 1 min  | ~30s      |
| Unit Tests          | < 3 min  | ~1-2 min  |
| Build Time          | < 3 min  | ~2-3 min  |
| E2E Tests           | < 5 min  | ~3-5 min  |
| Coverage Threshold  | ≥ 70%    | 70%       |

## 🎯 Success Criteria

### ✅ All Jobs Must Pass

- [x] Lint & Type Check
- [x] Unit Tests (with 70% coverage)
- [x] Build (Next.js production)
- [x] Database Quality (validates existing DB without modifying)
- [x] E2E Tests (Cypress with existing database state)
- [x] Security Audit
- [x] Quality Gate

### 🗄️ Database Handling

**Important:** The CI/CD pipeline **validates** database quality but does NOT reset or modify it.

- Database migrations must be applied **manually** before tests
- E2E tests run against existing database state
- Database quality check validates schema integrity and test data
- No automatic `supabase db reset` in CI/CD

**Rationale:** This approach:
- Prevents accidental data loss
- Makes database changes explicit and trackable  
- Separates testing from database administration
- Ensures consistent state across test runs

### 🚀 Deployment Conditions

**Production (main branch):**

- All jobs pass ✅
- Push to `main` branch
- Auto-deploys to Vercel

**Preview (pull requests):**

- All jobs pass ✅
- PR to `main` or `develop`
- Deploys preview to Vercel
- Comment added to PR with URL

## 🔧 Troubleshooting

### Common Failures

| Error                     | Cause                  | Fix                                      |
| ------------------------- | ---------------------- | ---------------------------------------- |
| "Module not found"        | Missing deps           | `npm ci && git add package-lock.json`    |
| "Coverage below 70%"      | Low test coverage      | Add more tests, check coverage report    |
| "Lint errors"             | ESLint violations      | `npm run lint -- --fix`                  |
| "Type errors"             | TypeScript issues      | `npx tsc --noEmit` to find errors        |
| "Database quality fails"  | DB state invalid       | Check test data, apply migrations        |
| "DB schema differs"       | Migrations not applied | `supabase db push` to apply migrations   |
| "Vercel deploy failed"    | Invalid token          | Regenerate `VERCEL_TOKEN` secret         |
| "E2E test timeout"        | Slow tests             | Increase `wait-on-timeout`               |

### Quick Fixes

```bash
# Fix lint issues
npm run lint -- --fix

# Update all dependencies
npm update

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Reset Supabase
supabase stop
supabase start
```

## 📝 Workflow Files

| File                              | Purpose                     |
| --------------------------------- | --------------------------- |
| `.github/workflows/ci-cd.yml`     | Main CI/CD pipeline         |
| `scripts/setup-github-actions.sh` | Auto-configure secrets      |
| `docs/GITHUB_ACTIONS_SETUP.md`    | Complete setup guide        |
| `docs/CI_CD_STATUS.md`            | This file - quick reference |

## 🔐 Required Secrets

| Secret                          | Source                    | Required For           |
| ------------------------------- | ------------------------- | ---------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase Dashboard        | All jobs               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard        | All jobs               |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase Dashboard        | Admin operations       |
| `SUPABASE_PROJECT_ID`           | Supabase Dashboard → URL  | Database quality check |
| `SUPABASE_DB_PASSWORD`          | Supabase Database Settings| Database quality check |
| `SUPABASE_ACCESS_TOKEN`         | Supabase Account Settings | CLI operations         |
| `VERCEL_TOKEN`                  | Vercel Account            | Deployment             |
| `VERCEL_ORG_ID`                 | .vercel/project.json      | Deployment             |
| `VERCEL_PROJECT_ID`             | .vercel/project.json      | Deployment             |
| `CODECOV_TOKEN`                 | codecov.io                | Coverage (optional)    |

## 🎓 Learning Resources

- **GitHub Actions:** https://docs.github.com/en/actions
- **GitHub CLI:** https://cli.github.com/manual/
- **Vercel Deployment:** https://vercel.com/docs/deployments
- **Supabase CI/CD:** https://supabase.com/docs/guides/cli/cicd-workflow
- **Cypress Best Practices:** https://docs.cypress.io/guides/references/best-practices

## 📞 Getting Help

1. **Check workflow logs:** Repository → Actions → Click failed run
2. **Run locally:** Reproduce the exact failing command
3. **Check docs:** `/docs/GITHUB_ACTIONS_SETUP.md`
4. **Search issues:** Might be a known problem
5. **Create issue:** If all else fails

---

**Last Updated:** November 6, 2025
**Workflow Version:** 1.0
**Status:** ✅ Active
