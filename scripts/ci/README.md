# CI Scripts

This directory contains scripts for continuous integration, deployment, and quality checks in the Guitar CRM project.

## Available Scripts

### Quality Checks

- `quality-check.sh` - Run comprehensive code quality validation (includes E2E tests)
  - TypeScript type checking
  - ESLint validation
  - Jest tests with coverage
  - Cypress E2E tests (headless)
  - Database quality checks
  - Lighthouse performance audits
- `pre-commit.sh` - Git pre-commit hook for code quality

### Performance Testing

- `lighthouse-audit.sh` - Run Lighthouse performance audits
- `lighthouse-ci.sh` - Lighthouse CI integration

### Deployment

- `deploy-check.sh` - Validate production readiness
