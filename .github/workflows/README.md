# GitHub Actions CI/CD Pipeline

This directory contains the GitHub Actions workflows for the Guitar CRM project.

## Workflows

### CI/CD Pipeline (`ci-cd.yml`)

Comprehensive continuous integration and deployment workflow that runs on push and pull requests.

#### Triggers

- **Push**: Runs on `main`, `develop`, `feature/**`, and `fix/**` branches
- **Pull Request**: Runs when targeting `main` or `develop` branches

#### Jobs Overview

1. **Lint & Type Check** - ESLint and TypeScript validation
2. **Unit & Integration Tests** - Jest with 70% coverage threshold
3. **Build** - Next.js production build
4. **E2E Tests** - Cypress tests with local Supabase
5. **Database Quality** - Database migration and quality checks
6. **Security Audit** - npm audit and secret scanning
7. **Quality Gate** - Aggregates all results
8. **Deploy Production** - Deploys to Vercel on main branch
9. **Deploy Preview** - Deploys preview for pull requests

#### Required Secrets

Configure these in GitHub repository settings (Settings → Secrets → Actions):

##### Supabase Secrets

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

##### Vercel Secrets (for deployment)

- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

##### Optional Secrets

- `CODECOV_TOKEN` - For uploading coverage reports to Codecov

#### Job Dependencies

```
lint-and-typecheck ─┐
                    ├─→ build ─→ e2e-tests ─┐
unit-tests ─────────┤                       │
                    │                       ├─→ deploy-production
database-quality ───┤                       │
                    ├─→ quality-gate ───────┤
security-audit ─────┘                       │
                                            └─→ deploy-preview (PRs only)
```

#### Coverage Requirements

All unit and integration tests must maintain:

- **70%** statement coverage
- **70%** branch coverage
- **70%** function coverage
- **70%** line coverage

#### Local Supabase in CI

The workflow automatically:

1. Starts a local Supabase instance using Docker
2. Runs all migrations
3. Seeds test data
4. Executes tests against the local instance

#### Artifacts

The following artifacts are saved (retention varies):

- **Build artifacts** (1 day)

  - `.next` directory
  - `public` directory

- **Cypress artifacts** (7 days)

  - Screenshots (on failure)
  - Videos (always)

- **Coverage reports** (uploaded to Codecov)

#### Status Badges

Add these to your README.md:

```markdown
![CI/CD Pipeline](https://github.com/PiotrRomanczuk/guitar-crm/workflows/CI%2FCD%20Pipeline/badge.svg)
```

## Setup Instructions

### 1. Enable GitHub Actions

GitHub Actions should be enabled by default. Verify in:

- Repository → Settings → Actions → General → "Allow all actions"

### 2. Configure Secrets

#### Getting Supabase Credentials

```bash
# For local development values
supabase start
supabase status

# Copy the API URL and anon key
```

For production:

1. Go to your Supabase project dashboard
2. Settings → API
3. Copy Project URL and anon/service_role keys

#### Getting Vercel Credentials

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Get org and project IDs from .vercel/project.json
cat .vercel/project.json
```

Or get from Vercel dashboard:

1. Project Settings → General
2. Copy Project ID and Org ID

#### Adding Secrets to GitHub

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each required secret

### 3. Configure Vercel Project

If deploying to Vercel:

1. Import project in Vercel dashboard
2. Configure environment variables (same as GitHub secrets)
3. Disable auto-deployments (let GitHub Actions handle it):
   - Project Settings → Git → Disable "Deploy Hooks"

### 4. Test the Workflow

Create a test branch and push:

```bash
git checkout -b test/ci-workflow
git push origin test/ci-workflow
```

Monitor the workflow in:

- Repository → Actions tab

## Workflow Customization

### Changing Node Version

Update the `NODE_VERSION` env var in `ci-cd.yml`:

```yaml
env:
  NODE_VERSION: '20' # Change to desired version
```

### Adjusting Coverage Thresholds

Modify the coverage check in the `unit-tests` job:

```yaml
if (( $(echo "$STATEMENTS < 80" | bc -l) )) || \
(( $(echo "$BRANCHES < 80" | bc -l) )) || \
...
```

### Disabling E2E Tests

Comment out or remove the `e2e-tests` job and its dependency in `deploy-production`.

### Adding More Browsers for E2E

Update the matrix strategy:

```yaml
strategy:
  matrix:
    browser: [chrome, firefox, edge]
```

## Troubleshooting

### Build Fails with "Module not found"

Ensure all dependencies are in `package.json` and run:

```bash
npm ci
```

### Supabase Connection Issues

Check that:

1. Supabase CLI is installed correctly
2. Docker is available in the runner
3. Migrations are up to date

### Coverage Threshold Failures

Run locally to identify gaps:

```bash
npm run test:coverage
```

Then check `coverage/lcov-report/index.html`.

### Vercel Deployment Fails

Verify:

1. All Vercel secrets are set correctly
2. Project is linked in Vercel
3. Environment variables are configured

### E2E Tests Timeout

Increase wait-on-timeout:

```yaml
wait-on-timeout: 180 # 3 minutes
```

## Maintenance

### Updating Dependencies

The workflow uses these actions:

- `actions/checkout@v4`
- `actions/setup-node@v4`
- `actions/upload-artifact@v4`
- `actions/download-artifact@v4`
- `cypress-io/github-action@v6`
- `supabase/setup-cli@v1`
- `codecov/codecov-action@v4`

Check for updates quarterly.

### Security Updates

The security-audit job runs on every push. Review warnings and:

```bash
# Update vulnerable packages
npm audit fix

# Or manually update
npm update
```

## Best Practices

1. **Never commit secrets** - Use GitHub secrets only
2. **Keep workflows fast** - Parallelize independent jobs
3. **Cache dependencies** - Already configured with `cache: 'npm'`
4. **Fail fast** - Use `fail-fast: false` only when needed
5. **Monitor costs** - GitHub Actions has usage limits on free tier

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase CI/CD](https://supabase.com/docs/guides/cli/cicd-workflow)
- [Cypress CI](https://docs.cypress.io/guides/continuous-integration/introduction)
- [Vercel CLI](https://vercel.com/docs/cli)
