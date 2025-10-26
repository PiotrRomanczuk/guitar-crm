# Development Scripts Guide

This directory contains utility scripts to streamline the development workflow for the Guitar CRM project.

## 🚀 Quick Start Scripts

### Initial Setup

```bash
npm run setup        # Set up development environment
npm run setup:db     # Set up Supabase database
npm run seed         # Populate database with sample data
```

### Daily Development

```bash
npm run new-feature  # Create new feature branch (with TDD reminder)
npm run tdd          # Start test-driven development mode
npm run dev:server   # Manage development servers
npm run quality      # Run code quality checks
```

## 📋 Script Reference

### `setup-env.sh`

**Purpose**: Initial project setup and environment configuration
**Usage**: `npm run setup` or `./scripts/setup-env.sh`

**What it does**:

- Checks Node.js version compatibility (18+)
- Installs all npm dependencies
- Creates `.env.local` template with Supabase configuration
- Creates necessary directories (`logs`, `temp`, `uploads`)
- Provides next steps guidance

**When to use**: First time setting up the project, or after cloning the repository

---

### `setup-db.sh`

**Purpose**: Set up and start Supabase local development environment
**Usage**: `npm run setup:db` or `./scripts/setup-db.sh`

**What it does**:

- Installs Supabase CLI if not present
- Checks Docker availability (required for Supabase)
- Starts Supabase local development stack
- Applies database migrations
- Displays connection details and API keys

**Prerequisites**: Docker Desktop must be running

---

### `new-feature.sh`

**Purpose**: Create feature branches with TDD workflow reminders
**Usage**: `npm run new-feature <feature-name>` or `./scripts/new-feature.sh user-authentication`

**What it does**:

- Switches to main branch and pulls latest changes
- Creates new feature branch (`feature/<name>`)
- Displays TDD workflow reminder
- Shows commands for testing and merging

**TDD Integration**: Automatically reminds developers about Red-Green-Refactor cycle

---

### `tdd-reminder.sh`

**Purpose**: Display TDD guidelines and best practices
**Usage**: `./scripts/tdd-reminder.sh` (automatically called by `npm run tdd`)

**What it displays**:

- TDD cycle explanation (Red-Green-Refactor)
- Testing commands and file locations
- Links to documentation

---

### `dev-server.sh`

**Purpose**: Manage development services (Next.js and Supabase)
**Usage**: `npm run dev:server <command> [service]` or `./scripts/dev-server.sh start all`

**Commands**:

- `start [all|next|db]` - Start services
- `stop [all|next|db]` - Stop services
- `restart [all|next|db]` - Restart services
- `status` - Show running services
- `logs [db]` - Show service logs

**Examples**:

```bash
./scripts/dev-server.sh start     # Start everything
./scripts/dev-server.sh start next   # Start only Next.js
./scripts/dev-server.sh stop db      # Stop only database
./scripts/dev-server.sh status       # Check what's running
```

---

### `quality-check.sh`

**Purpose**: Comprehensive code quality validation
**Usage**: `npm run quality` or `./scripts/quality-check.sh`

**Checks performed**:

- TypeScript type checking
- ESLint code style validation
- All tests execution
- TODO/FIXME comment detection
- Bundle size analysis (if built)

**Exit codes**: 0 = all checks pass, 1 = issues found

---

### `pre-commit.sh`

**Purpose**: Pre-commit hook for code quality assurance
**Usage**: `./scripts/pre-commit.sh` (automatically via Git hooks)

**Validations**:

- ESLint on staged files only
- TypeScript type checking
- Tests for changed files
- Forbidden patterns detection (console.log, debugger, etc.)
- Commit message format validation

**Setup as Git hook**:

```bash
echo '#!/bin/sh\n./scripts/pre-commit.sh' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

### `backup-db.sh`

**Purpose**: Create secure database backups without sensitive data
**Usage**: `npm run backup` or `./scripts/backup-db.sh`

**Creates**:

- Schema-only backup (`schema_backup.sql`)
- Anonymized data export script
- Backup documentation with usage instructions

**Security**: Removes all personal information (emails, names, etc.)

---

### `seed-db.sh`

**Purpose**: Populate database with sample development data
**Usage**: `npm run seed` or `./scripts/seed-db.sh`

**What it does**:

- Checks Supabase availability
- Runs database seed script
- Displays summary of seeded data
- Provides next steps guidance

---

### `deploy-check.sh`

**Purpose**: Production readiness validation
**Usage**: `npm run deploy:check` or `./scripts/deploy-check.sh`

**Comprehensive checks**:

- Environment variables validation
- Security vulnerability scan
- Production build test
- Full test suite execution
- Test coverage verification
- Bundle optimization analysis
- Database migration status
- Security pattern detection
- Performance analysis

**Output**: Detailed report with pass/fail status for each check

## 🔄 Recommended Workflow

### Starting Development

```bash
# Initial setup (once)
npm run setup
npm run setup:db
npm run seed

# Daily workflow
npm run new-feature my-feature
npm run tdd  # Start TDD mode
```

### Before Committing

```bash
npm run quality  # Check code quality
# Git hooks will run pre-commit.sh automatically
```

### Before Deployment

```bash
npm run deploy:check  # Comprehensive production check
```

## 🛠️ Customization

### Adding New Scripts

1. Create script in `scripts/` directory
2. Make executable: `chmod +x scripts/new-script.sh`
3. Add npm shortcut in `package.json`
4. Document in this README

### Environment Variables

Scripts respect these environment variables:

- `NODE_ENV` - Development/production mode
- `CI` - Continuous integration detection
- `SKIP_PREFLIGHT_CHECK` - Skip environment checks

### Debugging Scripts

Add `set -x` at the top of any script to enable debug mode:

```bash
#!/bin/bash
set -x  # Enable debug output
set -e  # Exit on error
```

## 🔗 Integration Points

### With TDD Workflow

- `new-feature.sh` reminds about TDD practices
- `tdd-reminder.sh` provides guidance
- All scripts support test-first development

### With Git Workflow

- `pre-commit.sh` ensures code quality
- `new-feature.sh` manages branches
- `backup-db.sh` excludes sensitive data

### With CI/CD

- `deploy-check.sh` validates production readiness
- `quality-check.sh` can run in CI pipeline
- All scripts support headless execution

## 📚 Additional Resources

- [TDD Guide](../docs/TDD_GUIDE.md) - Complete TDD documentation
- [Project Overview](../PROJECT_OVERVIEW.md) - Architecture and structure
- [Contributing Guidelines](../CONTRIBUTING.md) - Development standards
