# Remote Database Seeding Guide

## ✅ SQL-Based Seeding (Recommended - No Connection Issues)

We've generated a complete SQL file from your JSON backups. This approach bypasses all connection timeout issues.

### Step 1: Open Supabase Dashboard

Go to: https://supabase.com/dashboard/project/tpnndkcdsjzvrziajeyb/sql/new

### Step 2: Copy the SQL File

The generated SQL file is located at:

```
/Users/piotrromanczuk/Desktop/guitar-crm/seed_data.sql
```

Open it and copy its contents (887 lines).

### Step 3: Paste and Run

1. Paste the entire SQL content into the Supabase SQL Editor
2. Click **"RUN"** at the bottom right
3. Wait for completion (should take 5-10 seconds for ~500 records)

### Step 4: Verify Data

After running, verify the data was imported:

1. Go to Table Editor: https://supabase.com/dashboard/project/tpnndkcdsjzvrziajeyb/editor
2. Check these tables:
   - **profiles**: Should have 28 rows
   - **songs**: Should have 118 rows
   - **lessons**: Should have 132 rows
   - **lesson_songs**: Should have 239 rows
   - **task_management**: Empty (no data in backup)

---

## What the SQL Does

The generated `seed_data.sql` file:

- ✅ Wraps everything in a transaction (BEGIN/COMMIT)
- ✅ Imports data in foreign key order (profiles → songs → lessons → lesson_songs → tasks)
- ✅ Uses camelCase column names (`firstName`, `isAdmin`, etc.) matching your local schema
- ✅ Handles NULL values, booleans, timestamps, and JSONB fields correctly
- ✅ Excludes `id` fields (lets database auto-generate)
- ✅ Excludes `canEdit` field (not in remote schema)

---

## ⚠️ If You Get Schema Errors

If you see errors like:

```
column "firstName" does not exist
```

This means your remote schema uses **snake_case** instead of camelCase. To fix:

### Option A: Update Remote Schema

Run migrations to match local schema:

```bash
# In terminal:
supabase db push --linked
```

### Option B: Regenerate SQL with snake_case

If migrations don't work, edit `scripts/generate-seed-sql.py` and change the column mappings:

```python
COLUMNS_MAP = {
    'profiles': ['user_id', 'username', 'email', 'first_name', 'last_name', 'bio', 'is_admin', 'is_teacher', 'is_student', 'is_active', 'is_test', 'created_at', 'updated_at'],
    # ... update other tables similarly
}
```

Then regenerate:

```bash
python3 scripts/generate-seed-sql.py > seed_data_snake_case.sql
```

---

## Alternative: REST API Seeding (If SQL Editor Fails)

If for some reason the SQL Editor doesn't work, we have a REST API seeding script ready:

```bash
SUPABASE_SERVICE_ROLE_KEY="your-key-here" ./scripts/seed-remote-json.sh
```

But first, we need to determine if your remote schema uses camelCase or snake_case columns.

---

## Next Steps After Seeding

Once data is imported:

1. **Update .env.local** with remote credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tpnndkcdsjzvrziajeyb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Test Dashboards** with real data:

   ```bash
   npm run dev
   # Visit http://localhost:3000/admin, /teacher, /student
   ```

3. **Verify API Endpoints** return correct data:
   ```bash
   curl http://localhost:3000/api/dashboard/stats
   ```

---

## Troubleshooting

### Issue: "relation public.profiles does not exist"

**Solution**: Schema not created. Run migrations first:

```bash
supabase db push --linked
```

### Issue: Connection timeout during db push

**Solution**: Use SQL Editor approach instead (copy seed_data.sql)

### Issue: Duplicate key violations

**Solution**: Data already exists. Clear tables first:

```sql
DELETE FROM public.lesson_songs;
DELETE FROM public.lessons;
DELETE FROM public.songs;
DELETE FROM public.profiles;
```

### Issue: Foreign key constraint violations

**Solution**: Make sure to run the full SQL file (includes BEGIN/COMMIT transaction)

---

## Files Created

- `seed_data.sql` - Ready-to-run SQL with all your data (887 lines)
- `scripts/generate-seed-sql.py` - Python script to regenerate SQL if needed
- `scripts/seed-remote-json.sh` - REST API alternative (if SQL fails)
- `scripts/seed-via-sql-editor.sql` - Manual SQL template (partial)

---

## Summary

**Recommended flow:**

1. ✅ Open Supabase SQL Editor
2. ✅ Copy/paste `seed_data.sql`
3. ✅ Click RUN
4. ✅ Verify data in Table Editor
5. ✅ Update .env.local with remote credentials
6. ✅ Test dashboards with `npm run dev`

This bypasses all CLI connection issues and works reliably! 🎉
