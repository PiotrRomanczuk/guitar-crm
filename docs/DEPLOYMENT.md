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

1. **Create Production Supabase Project**

   ```bash
   # Create new project in Supabase dashboard
   # Note down the URL and keys
   ```

2. **Run Migrations**

   ```bash
   # Set production database URL
   supabase link --project-ref your-project-ref
   supabase db push
   ```

3. **Seed Production Data** (Optional)
   ```bash
   # Only run if you need sample data in production
   supabase db seed
   ```

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
- [ ] Database migrations applied
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Test all critical functionality
- [ ] Set up monitoring/alerting

### Rollback Strategy

```bash
# Rollback to previous deployment
vercel rollback [deployment-url]

# Or redeploy specific commit
git revert HEAD
git push origin main
```
