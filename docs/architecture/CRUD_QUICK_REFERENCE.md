# Quick Reference: CRUD Implementation

> **Key Principle**: All entities follow a **role-based access pattern** with three user types: Admin, Teacher, Student

## 👥 Role Access Quick Reference

```
ADMIN    → Full access to everything
TEACHER  → Their students' entities only
STUDENT  → Entities assigned to them only (read-only)
```

## 🚀 Fast Start: New Entity in 5 Steps

### 1. Database Schema (5 min)

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_create_[entity]s.sql
CREATE TABLE [entity]s (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(user_id), -- REQUIRED for role filtering
  -- other fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX idx_[entity]s_student_id ON [entity]s(student_id);

-- Enable RLS
ALTER TABLE [entity]s ENABLE ROW LEVEL SECURITY;

-- ROLE-BASED POLICIES (Standard for all entities)

-- Admins see everything
CREATE POLICY "Admins can view all [entity]s" ON [entity]s FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Teachers see their students' entities
CREATE POLICY "Teachers can view their students' [entity]s" ON [entity]s FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN lessons l ON l.teacher_id = p.user_id
    WHERE p.user_id = auth.uid()
    AND p.is_teacher = true
    AND l.student_id = [entity]s.student_id
  )
);

-- Students see only their own
CREATE POLICY "Students can view their own [entity]s" ON [entity]s FOR SELECT TO authenticated USING (
  student_id = auth.uid()
);

-- Admins and Teachers can create/update/delete
CREATE POLICY "Admins and teachers can mutate [entity]s" ON [entity]s FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND (is_admin = true OR is_teacher = true))
);
```

### 2. Zod Schema (10 min)

```typescript
// schemas/[Entity]Schema.ts
import * as z from 'zod';

export const [Entity]InputSchema = z.object({
  // Required fields
});

export const [Entity]Schema = [Entity]InputSchema.extend({
  id: z.string().uuid().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type [Entity] = z.infer<typeof [Entity]Schema>;
export type [Entity]Input = z.infer<typeof [Entity]InputSchema>;
```

### 3. API Handlers with Role Logic (20 min)

```typescript
// app/api/[entity]/handlers.ts

/**
 * GET handler - ROLE-BASED FILTERING (Standard pattern)
 */
export async function get[Entity]sHandler(supabase, user, profile, query) {
  if (!user) return { error: 'Unauthorized', status: 401 };

  let dbQuery = supabase.from('[entity]s').select('*', { count: 'exact' });

  // STANDARD ROLE-BASED FILTERING (Apply to all entities)
  if (profile.is_admin) {
    // Admin sees all - no filtering
  } else if (profile.is_teacher) {
    // Teacher sees only their students' entities
    const { data: studentIds } = await supabase
      .from('lessons')
      .select('student_id')
      .eq('teacher_id', user.id);

    const ids = studentIds?.map(s => s.student_id) || [];
    dbQuery = dbQuery.in('student_id', ids);
  } else if (profile.is_student) {
    // Student sees only their own
    dbQuery = dbQuery.eq('student_id', user.id);
  } else {
    return { error: 'No valid role', status: 403 };
  }

  const { data, error, count } = await dbQuery;
  if (error) return { error: error.message, status: 500 };

  return { [entity]s: data || [], count };
}

/**
 * CREATE handler - PERMISSION CHECK (Admins and Teachers only)
 */
export async function create[Entity]Handler(supabase, user, profile, body) {
  if (!user) return { error: 'Unauthorized', status: 401 };

  // Only admins and teachers can create
  if (!profile?.is_admin && !profile?.is_teacher) {
    return { error: 'Forbidden: Students cannot create entities', status: 403 };
  }

  try {
    const validated = [Entity]InputSchema.parse(body);

    // Teachers can only create for THEIR students
    if (profile.is_teacher && !profile.is_admin && validated.student_id) {
      const isMyStudent = await teacherOwnsStudent(
        supabase,
        user.id,
        validated.student_id
      );

      if (!isMyStudent) {
        return { error: 'Forbidden: Can only create for your students', status: 403 };
      }
    }

    const { data, error } = await supabase
      .from('[entity]s')
      .insert(validated)
      .select()
      .single();

    if (error) return { error: error.message, status: 500 };
    return { [entity]: data, status: 201 };
  } catch (err) {
    if (err instanceof ZodError) {
      return { error: `Validation failed: ${JSON.stringify(err.flatten().fieldErrors)}`, status: 422 };
    }
    return { error: 'Internal server error', status: 500 };
  }
}
```

### 4. API Route (15 min)

```typescript
// app/api/[entity]/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { get[Entity]sHandler, create[Entity]Handler } from './handlers';

export async function GET(request: NextRequest) {
  try {
    const headersList = headers();
    const supabase = createClient(headersList);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, is_teacher, is_student')
      .eq('user_id', user.id)
      .single();

    const { searchParams } = new URL(request.url);
    const result = await get[Entity]sHandler(supabase, user, profile, searchParams);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const supabase = createClient(headersList);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, is_teacher')
      .eq('user_id', user.id)
      .single();

    const body = await request.json();
    const result = await create[Entity]Handler(supabase, user, profile, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.[entity], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 5. React Hook (15 min)

```typescript
// components/[entity]/use[Entity]List.ts
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth';
import type { Tables } from '@/lib/supabase';

export default function use[Entity]List() {
  const { user, isTeacher, isAdmin } = useAuth();
  const [[entity]s, set[Entity]s] = useState<Tables<'[entity]s'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load[Entity]s = useCallback(async () => {
    if (!user?.id) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const endpoint = isAdmin || isTeacher
        ? '/api/[entity]/admin-[entity]s'
        : '/api/[entity]/student-[entity]s';

      const response = await fetch(`${endpoint}?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      set[Entity]s(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isTeacher, user?.id]);

  useEffect(() => {
    void load[Entity]s();
  }, [load[Entity]s]);

  return { [entity]s, loading, error, refresh: load[Entity]s };
}
```

---

## 📋 Copy-Paste Templates

### Admin Route Template

```typescript
// app/api/[entity]/admin-[entity]s/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: Request) {
	try {
		const headersList = headers();
		const supabase = createClient(headersList);

		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { data: profile } = await supabase
			.from('profiles')
			.select('is_admin, is_teacher')
			.eq('user_id', user.id)
			.single();

		if (!profile?.is_admin && !profile?.is_teacher) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const { searchParams } = new URL(request.url);
		const level = searchParams.get('level');

		let query = supabase.from('[entity]s').select('*');
		if (level) query = query.eq('level', level);

		const { data, error } = await query;
		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
```

### List Component Template

```typescript
// components/[entity]/[Entity]List.tsx
'use client';

import use[Entity]List from './use[Entity]List';

export function [Entity]List() {
  const { [entity]s, loading, error, refresh } = use[Entity]List();

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (loading) return <div>Loading...</div>;
  if ([entity]s.length === 0) return <div>No [entity]s found</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">[Entity]s</h1>
        <button onClick={refresh} className="btn-secondary">Refresh</button>
      </div>

      <div className="grid gap-4">
        {[entity]s.map([entity] => (
          <div key={[entity].id} className="p-4 border rounded-lg">
            {/* Entity content */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Page Template

```typescript
// app/[entity]/page.tsx
import { [Entity]List } from '@/components/[entity]';
import { ProtectedRoute } from '@/components/auth';

export default function [Entity]sPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <[Entity]List />
      </div>
    </ProtectedRoute>
  );
}
```

---

## 🎯 Common Patterns

### Role-Based Query Filtering

```typescript
// Students see only their own
if (!profile?.is_admin && !profile?.is_teacher) {
	query = query.eq('student_id', user.id);
}

// Teachers see their students
if (profile?.is_teacher && !profile?.is_admin) {
	query = query.in('student_id', await getMyStudentIds(supabase, user.id));
}

// Admins see all (no filtering)
```

### Error Response Pattern

```typescript
if (!user) {
	return { error: 'Unauthorized', status: 401 };
}

if (!hasPermission) {
	return { error: 'Forbidden', status: 403 };
}

if (!found) {
	return { error: 'Not found', status: 404 };
}

if (validationError) {
	return { error: 'Validation failed: ...', status: 422 };
}

if (dbError) {
	return { error: dbError.message, status: 500 };
}
```

### Zod Validation Pattern

```typescript
try {
  const validated = [Entity]InputSchema.parse(body);
  // Use validated data
} catch (err) {
  if (err instanceof ZodError) {
    return {
      error: `Validation failed: ${JSON.stringify(err.flatten().fieldErrors)}`,
      status: 422
    };
  }
  throw err;
}
```

---

## ⚡ Time Estimates

| Task               | Time        | Cumulative |
| ------------------ | ----------- | ---------- |
| Database migration | 5 min       | 5 min      |
| Zod schema         | 10 min      | 15 min     |
| API handlers       | 20 min      | 35 min     |
| API routes         | 15 min      | 50 min     |
| React hook         | 15 min      | 65 min     |
| List component     | 20 min      | 85 min     |
| Form component     | 25 min      | 110 min    |
| Pages              | 10 min      | 120 min    |
| Tests              | 30 min      | 150 min    |
| **TOTAL**          | **2.5 hrs** |            |

_Note: Times assume familiarity with patterns. First implementation may take longer._

---

## 🔍 Testing Checklist

- [ ] Schema validates correct data
- [ ] Schema rejects invalid data
- [ ] API returns 401 without auth
- [ ] API returns 403 without permission
- [ ] API returns 422 with invalid data
- [ ] API returns 200/201 with valid data
- [ ] Hook handles loading state
- [ ] Hook handles error state
- [ ] Hook handles empty state
- [ ] Component renders correctly
- [ ] Component handles user interactions
- [ ] Form validation works
- [ ] Form submission works

---

## � Component Structure Quick Reference

**MANDATORY**: All entity components must follow this folder structure:

```
components/<entity>/
├── <Entity>List/
│   ├── components/       # Header, Table, Empty, Filter
│   ├── hooks/            # use<Entity>List
│   └── index.tsx
├── <Entity>Form/
│   ├── components/       # Fields, FieldText, FieldSelect
│   ├── helpers/          # validation.ts
│   ├── options/          # fieldOptions.ts
│   ├── validators.ts
│   ├── Content.tsx
│   └── index.tsx
├── <Entity>Detail/
│   ├── components/       # Header, Info, Actions
│   ├── use<Entity>Detail.ts
│   └── index.tsx
├── hooks/                # use<Entity>, use<Entity>Mutations
├── types/                # <entity>.types.ts, api.types.ts
├── services/             # <entity>Api.ts, <entity>Queries.ts
├── utils/                # formatters.ts, transformers.ts
├── tests/                # Component and hook tests
├── constants.ts
├── config.ts
├── <Entity>FormGuard.tsx
├── index.ts
└── README.md
```

**Requirements:**

- All files < 80 lines, functions < 80 lines, complexity < 10
- Folder-based organization with sub-folders
- Separate concerns: components/, hooks/, helpers/, options/, services/, utils/
- Co-located tests in tests/ folder
- Comprehensive README.md per entity

**See:**

- `components/songs/` - Current implementation (simpler structure)
- New entities should use the enhanced structure above
- `docs/completed-features/SONGS_COMPONENT_REFACTORING.md` - Migration example

---

## �📞 Need Help?

1. Check [CRUD_STANDARDS.md](./CRUD_STANDARDS.md) for detailed guide
2. Look at `components/songs/` as the canonical component structure example
3. Review [SONGS_COMPONENT_REFACTORING.md](../completed-features/SONGS_COMPONENT_REFACTORING.md) for structure details
4. Check [TDD_GUIDE.md](./TDD_GUIDE.md) for testing help
5. Review [PROJECT_OVERVIEW.md](../PROJECT_OVERVIEW.md) for architecture
