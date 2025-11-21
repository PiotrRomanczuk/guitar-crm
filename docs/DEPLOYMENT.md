# Deployment Guide

## Vercel Deployment

This project is configured for deployment on Vercel with automatic GitHub integration.

### Environment Variables Required

Before deploying, make sure to set these environment variables in your Vercel dashboard:

#### Supabase Configuration

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### App Configuration

```
NEXT_PUBLIC_APP_NAME=Guitar CRM
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

### Deployment Steps

1. **Initial Deployment**

   ```bash
   vercel --prod
   ```

2. **Set Environment Variables**

   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all required environment variables
   - Redeploy to apply changes

3. **Automatic Deployments**
   - All pushes to `main` branch will auto-deploy to production
   - Pull requests will create preview deployments

### Database Setup for Production

**Important:** Database setup (migrations) should be done **manually** or through a dedicated deployment process, NOT automatically in CI/CD on every test run.

1. **Create Production Supabase Project**

   ```bash
   # Create new project in Supabase dashboard
   # Note down the URL and keys
   ```

2. **Run Migrations Manually**

   ```bash
   # Link to production database
   supabase link --project-ref your-project-ref
   
   # Apply migrations to production
   supabase db push
   ```

3. **Seed Production Data** (Optional - First Time Only)
   ```bash
   # Only run if you need sample data in production
   # WARNING: This should only be done on initial setup
   supabase db push --include-seed
   ```

### Database Management in CI/CD

The CI/CD pipeline performs **database quality validation** without modifying the database:

- **Database Quality Check Job**: Validates existing database state
  - Checks schema integrity
  - Validates test data
  - Ensures no production data in test environments
  - Does NOT reset or modify the database

- **E2E Tests**: Run against existing database state
  - Assumes database is already set up with proper schema
  - May add test data during tests
  - Does NOT reset the entire database before tests

**When Database Changes Are Needed:**

1. **During Development**: Developers apply migrations locally
2. **On Main Branch**: Database migrations should be applied manually to production BEFORE merging PRs that depend on them
3. **For Testing**: Test databases should have stable schemas; only test data changes

### Domain Configuration

1. Add custom domain in Vercel dashboard
2. Configure DNS records
3. SSL certificates are automatically managed

### Monitoring and Analytics

- Build logs available in Vercel dashboard
- Function logs for debugging
- Web Analytics automatically enabled

### Production Checklist

Before going live:

- [ ] All environment variables set
- [ ] Database migrations applied **manually** to production
- [ ] Database schema validated
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Test all critical functionality
- [ ] Set up monitoring/alerting

**Note on Database Migrations:**
- Migrations should be applied manually using `supabase db push`
- CI/CD validates database quality but does NOT apply migrations automatically
- This prevents accidental data loss or schema changes during automated testing

### Rollback Strategy

```bash
# Rollback to previous deployment
vercel rollback [deployment-url]

# Or redeploy specific commit
git revert HEAD
git push origin main
```
