# Guitar CRM

[![CI/CD Pipeline](https://github.com/PiotrRomanczuk/guitar-crm/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/PiotrRomanczuk/guitar-crm/actions)

A comprehensive Customer Relationship Management system for guitar teachers, built with Next.js, TypeScript, and Supabase.

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

## Getting Started

For detailed setup instructions, see [Scripts Guide](./scripts/README.md).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Live Demo

🚀 **Production URL**: https://guitar-pcponxmdu-piotrromanczuks-projects.vercel.app

The application is automatically deployed to Vercel on every push to the `main` branch.

## Deployment

The project is configured for automatic deployment on Vercel. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions and environment variable setup.

### Quick Deploy

```bash
vercel --prod  # Deploy to production
```

## Development Workflow

### Starting a New Feature

This project uses a feature branch workflow. To start working on a new feature:

```bash
# Use the helper script
./scripts/new-feature.sh your-feature-name

# Or manually:
git checkout main
git pull origin main  # (when remote is configured)
git checkout -b feature/your-feature-name
```

### Completing a Feature

```bash
# Add and commit your changes
git add .
git commit -m "feat: add your feature description"

# Switch back to main and merge
git checkout main
git merge feature/your-feature-name

# Clean up the feature branch
git branch -d feature/your-feature-name

# Push to remote (when configured)
git push origin main
```

### Git Setup

If you haven't set up a remote repository yet:

```bash
# Add your remote repository
git remote add origin <your-repository-url>

# Push for the first time
git push -u origin main
```

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

### Quick Start

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
