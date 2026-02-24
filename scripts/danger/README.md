# ⚠️ DANGER ZONE

Scripts in this directory are **destructive** and must **NEVER** be run against production.

| Script | What it does | Safe for |
|--------|-------------|----------|
| `drop_all_DANGER.sql` | Drops all public schema tables, views, functions, triggers, types | Local dev only |

## Why are these here?

These scripts were removed from `supabase/migrations/` to prevent them from being accidentally applied by:
- `supabase db push`
- `supabase db reset`
- Any CI/CD migration runner

## Usage

```bash
# Local reset only — ensure you are NOT connected to production
psql $NEXT_PUBLIC_SUPABASE_LOCAL_URL -f scripts/danger/drop_all_DANGER.sql
```

## Adding new danger scripts

If you must add a new destructive script:
1. Place it in this directory
2. Prefix the filename with a clear warning (e.g. `destroy_`, `drop_`, `nuke_`)
3. Add a prominent `-- ⚠️ WARNING` comment at the top
4. Document it in this README
