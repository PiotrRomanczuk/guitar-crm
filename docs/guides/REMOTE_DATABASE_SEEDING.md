# Remote Database Seeding Guide

This guide explains how to seed your remote Supabase database with data from backups.

## Prerequisites

1. **Supabase Project**: You must have a Supabase project created at https://supabase.com
2. **Supabase CLI**: Already installed (`supabase` command available)
3. **Backup Data**: Available in `supabase/backups/backup-2025-10-27_09-49-48/remote-db.sql`

## Quick Start

### Option 1: Using the Interactive Script (Recommended)

```bash
npm run seed:remote
```

This will guide you through:

1. Linking to your Supabase project (first time only)
2. Choosing what to seed (schema, data, or both)
3. Confirming before making changes

### Option 2: Manual Steps

#### Step 1: Link to Your Supabase Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Find your project ref at:

- https://supabase.com/dashboard/project/YOUR_PROJECT/settings/general
- It's a string like: `abcdefghijklmnop`

#### Step 2: Push Database Schema

```bash
supabase db push
```

This applies all migrations from `supabase/migrations/` to your remote database.

#### Step 3: Seed Sample Data (Optional)

```bash
supabase db push --include-seed
```

This runs `supabase/seed.sql` to populate your database with sample data.

## Alternative: Direct SQL Import

If you prefer to import the SQL backup directly:

### Using psql (PostgreSQL Client)

1. Get your database connection string from Supabase:

   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/database
   - Copy the "Connection string" under "Connection pooling"
   - Use "Transaction" mode

2. Import the backup:

```bash
export REMOTE_DB_URL="postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres"
psql "$REMOTE_DB_URL" < supabase/backups/backup-2025-10-27_09-49-48/remote-db.sql
```

### Using Supabase Studio

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
2. Click "SQL Editor"
3. Copy and paste the contents of the backup SQL file
4. Click "Run"

## Update Environment Variables

After seeding, update your `.env.local` with remote credentials:

```bash
# Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Verify the Seeding

1. Start your development server:

```bash
npm run dev
```

2. Navigate to http://localhost:3000
3. Try signing in or accessing the dashboards
4. Check Supabase Studio to verify data:
   - https://supabase.com/dashboard/project/YOUR_PROJECT/editor

## Troubleshooting

### "Project not linked" Error

Run:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### "Permission denied" Error

Make sure you're using the correct database password. Get it from:

- https://supabase.com/dashboard/project/YOUR_PROJECT/settings/database

### "Schema already exists" Warning

This is normal if you're re-running the seed. The script will skip existing tables.

### Connection Timeout

Check your database connection string and ensure:

- You're using "Connection pooling" URL (not direct connection)
- "Transaction" mode is selected
- Your IP is allowed (Supabase allows all IPs by default)

## What Gets Seeded

The backup includes:

- ✅ Database schema (tables, functions, triggers)
- ✅ RLS (Row Level Security) policies
- ✅ Sample user profiles
- ✅ Sample songs library
- ✅ Sample lessons data
- ✅ Authentication setup

## Important Notes

⚠️ **First-Time Setup**: Use Option 1 (Push schema) before trying to seed data

⚠️ **Production Warning**: This will modify your remote database. Always test in a development/staging environment first.

⚠️ **Data Loss**: If you already have data in your remote database, this may overwrite it. Consider backing up first.

## Support

If you encounter issues:

1. Check the Supabase CLI logs for detailed error messages
2. Verify your project ref and credentials
3. Check Supabase project status at https://status.supabase.com
4. Review the [Supabase CLI documentation](https://supabase.com/docs/guides/cli)
