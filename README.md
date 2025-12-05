# Guitar CRM

[![CI/CD Pipeline](https://github.com/PiotrRomanczuk/guitar-crm/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/PiotrRomanczuk/guitar-crm/actions)

A comprehensive Customer Relationship Management system for guitar teachers, built with Next.js, TypeScript, and Supabase.

## 📚 Documentation

Full documentation is available in the [`docs/`](./docs/README.md) folder:

- **[Architecture](./docs/ARCHITECTURE.md)**: System design, tech stack, and database schema.
- **[Development Guide](./docs/DEVELOPMENT.md)**: Setup, git workflow, testing (TDD), and CI/CD.
- **[Features](./docs/FEATURES.md)**: Detailed feature specifications.
- **[Roadmap](./docs/ROADMAP.md)**: Project status and future plans.

## Prerequisites

- **Node.js**: >= 20.9.0 ([Download](https://nodejs.org/))
- **npm**: >= 10.0.0 (comes with Node.js)

## Quick Start

### Initial Setup

```bash
npm run setup        # Set up development environment
npm run setup:db     # Set up Supabase database
npm run seed         # Add sample data
```

### Start Development

```bash
npm run new-feature my-feature-name  # Create feature branch
npm run tdd          # Start test-driven development
# or
npm run dev          # Start development server only
```

## Live Demo

🚀 **Production URL**: https://guitar-pcponxmdu-piotrromanczuks-projects.vercel.app

The application is automatically deployed to Vercel on every push to the `main` branch.

## Project Structure

- `/app` - Next.js 13+ app directory
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/schemas` - Zod validation schemas
- `/types` - TypeScript type definitions
- `/supabase` - Database migrations and configuration
- `/docs` - Project documentation
- `/__tests__` - Test files

## Database

This project uses Supabase as the backend. Database backups and sensitive information are automatically excluded from git commits.

## Testing & TDD

This project follows **Test-Driven Development (TDD)** practices. See the [TDD Guide](./docs/TDD_GUIDE.md) for detailed instructions.

### Testing Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### TDD Workflow

1. 🔴 Write failing test first
2. 🟢 Write minimal code to pass
3. 🔵 Refactor while keeping tests green

**Remember**: Always write tests before implementing features!

<!-- CI Trigger -->
