# CRUD Implementation Standards

## Overview

This document defines the standardized patterns for implementing CRUD operations across all entities in the Guitar CRM application. Following these standards ensures consistency, maintainability, and testability.

**Key Principle**: Structure is organized by **role first**, then by entity. This provides clear separation between admin, teacher, and student experiences while accepting some component duplication for better maintainability.

---

## � Role-Based Access Control Matrix

### Standard Permissions Across All Entities

| Operation       | Admin          | Teacher                | Student                |
| --------------- | -------------- | ---------------------- | ---------------------- |
| **View All**    | ✅ Full access | ✅ Their students only | ❌ Assigned only       |
| **View Single** | ✅ Any         | ✅ If their student    | ✅ If assigned to them |
| **Create**      | ✅ Yes         | ✅ Yes                 | ❌ No                  |
| **Update**      | ✅ Any         | ✅ Their entities only | ❌ No                  |
| **Delete**      | ✅ Any         | ✅ Their entities only | ❌ No                  |

### Role-Specific Query Patterns

```typescript
// ADMIN - See everything, no filtering
const { data } = await supabase.from('[entity]s').select('*');

// TEACHER - See their students' entities
const { data } = await supabase
	.from('[entity]s')
	.select('*')
	.in('student_id', teacherStudentIds);

// STUDENT - See only assigned to them
const { data } = await supabase
	.from('[entity]s')
	.select('*')
	.eq('student_id', user.id);
```

---

## 📁 Directory Structure

### Role-First Organization

```
/app/
├── admin/                    # Admin dashboard & features
│   ├── page.tsx             # Admin dashboard
│   ├── [entity]/
│   │   ├── page.tsx         # Admin [entity] list
│   │   ├── [id]/
│   │   │   ├── page.tsx     # Admin [entity] detail
│   │   │   └── edit/
│   │   │       └── page.tsx # Admin [entity] edit
│   │   └── new/
│   │       └── page.tsx     # Admin create [entity]
│   └── users/
│       └── page.tsx         # User management
│
├── teacher/                  # Teacher dashboard & features
│   ├── page.tsx             # Teacher dashboard
│   ├── [entity]/
│   │   ├── page.tsx         # Teacher [entity] list
│   │   ├── [id]/
│   │   │   ├── page.tsx     # Teacher [entity] detail
│   │   │   └── edit/
│   │   │       └── page.tsx # Teacher [entity] edit
│   │   └── new/
│   │       └── page.tsx     # Teacher create [entity]
│   └── students/
│       └── page.tsx         # Teacher's students list
│
└── student/                  # Student dashboard & features
    ├── page.tsx             # Student dashboard
    ├── [entity]/
    │   ├── page.tsx         # Student [entity] list (read-only)
    │   └── [id]/
    │       └── page.tsx     # Student [entity] detail (read-only)
    └── progress/
        └── page.tsx         # Student progress tracking

/components/
├── admin/                    # Admin-specific components
│   └── [entity]/
│       ├── [Entity]List.tsx
│       ├── [Entity]Form.tsx
│       └── [Entity]Table.tsx
│
├── teacher/                  # Teacher-specific components
│   └── [entity]/
│       ├── [Entity]List.tsx
│       ├── [Entity]Form.tsx
│       └── [Entity]Table.tsx
│
└── student/                  # Student-specific components
    └── [entity]/
        ├── [Entity]List.tsx
        └── [Entity]Card.tsx # Read-only card view

/app/api/[entity]/
├── route.ts                  # Generic handlers (auto-route by role)
├── handlers.ts               # Pure business logic with role checks
├── [id]/
│   └── route.ts             # Single item operations
├── admin-[entity]s/
│   └── route.ts             # Admin-specific queries
├── teacher-[entity]s/
│   └── route.ts             # Teacher-specific queries
└── student-[entity]s/
    └── route.ts             # Student-specific queries

/schemas/
└── [Entity]Schema.ts        # Shared validation schemas
```

### Benefits of Role-First Structure

✅ **Clear separation** - Each role has dedicated UI/UX
✅ **Independent evolution** - Admin features don't affect student UI
✅ **Easier testing** - Test each role's flow independently
✅ **Better security** - Role boundaries are explicit in code
✅ **Maintainable** - Component duplication is acceptable for clarity
✅ **Scalable** - Easy to add role-specific features

---

## 🔐 Role-Based Handler Logic

### Standard Permission Checks in Handlers

**All handlers MUST implement role-based filtering:**

```typescript
// handlers.ts - GET operation
export async function get[Entity]sHandler(
  supabase: SupabaseClient,
  user: { id: string },
  profile: { is_admin: boolean; is_teacher: boolean; is_student: boolean },
  query: [Entity]QueryParams
): Promise<[Entity]Result> {
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }

  let dbQuery = supabase.from('[entity]s').select('*', { count: 'exact' });

  // ROLE-BASED FILTERING (Apply to every entity)
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
    // Student sees only entities assigned to them
    dbQuery = dbQuery.eq('student_id', user.id);
  } else {
    return { error: 'No valid role found', status: 403 };
  }

  // Apply additional filters, sorting, pagination...
  const { data, error, count } = await dbQuery;

  if (error) {
    return { error: error.message, status: 500 };
  }

  return { [entity]s: data || [], count };
}

// handlers.ts - CREATE/UPDATE/DELETE operations
export async function create[Entity]Handler(
  supabase: SupabaseClient,
  user: { id: string },
  profile: { is_admin: boolean; is_teacher: boolean },
  body: unknown
): Promise<{ [entity]?: [Entity]; error?: string; status: number }> {
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }

  // MUTATION PERMISSION CHECK (Admins and Teachers only)
  if (!profile.is_admin && !profile.is_teacher) {
    return {
      error: 'Forbidden: Only admins and teachers can create entities',
      status: 403
    };
  }

  try {
    const validated = [Entity]InputSchema.parse(body);

    // Teachers can only create for their students
    if (profile.is_teacher && !profile.is_admin && validated.student_id) {
      const { data: isMyStudent } = await supabase
        .from('lessons')
        .select('id')
        .eq('teacher_id', user.id)
        .eq('student_id', validated.student_id)
        .single();

      if (!isMyStudent) {
        return {
          error: 'Forbidden: Can only create entities for your students',
          status: 403
        };
      }
    }

    const { data, error } = await supabase
      .from('[entity]s')
      .insert(validated)
      .select()
      .single();

    if (error) {
      return { error: error.message, status: 500 };
    }

    return { [entity]: data, status: 201 };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        error: `Validation failed: ${JSON.stringify(err.flatten().fieldErrors)}`,
        status: 422,
      };
    }
    return { error: 'Internal server error', status: 500 };
  }
}
```

### Permission Helper Functions

**Create reusable permission validators:**

```typescript
// handlers.ts or lib/permissions.ts

export interface UserProfile {
	is_admin: boolean;
	is_teacher: boolean;
	is_student: boolean;
}

/**
 * Check if user can perform mutations (create/update/delete)
 */
export function canMutate(profile: UserProfile | null): boolean {
	return !!(profile?.is_admin || profile?.is_teacher);
}

/**
 * Check if user can view all entities
 */
export function canViewAll(profile: UserProfile | null): boolean {
	return !!profile?.is_admin;
}

/**
 * Check if teacher owns this student
 */
export async function teacherOwnsStudent(
	supabase: SupabaseClient,
	teacherId: string,
	studentId: string
): Promise<boolean> {
	const { data } = await supabase
		.from('lessons')
		.select('id')
		.eq('teacher_id', teacherId)
		.eq('student_id', studentId)
		.single();

	return !!data;
}

/**
 * Get teacher's student IDs
 */
export async function getTeacherStudentIds(
	supabase: SupabaseClient,
	teacherId: string
): Promise<string[]> {
	const { data } = await supabase
		.from('lessons')
		.select('student_id')
		.eq('teacher_id', teacherId);

	return data?.map((d) => d.student_id) || [];
}
```

---

## 🎯 API Route Standards

### 1. Main Route File (`/app/api/[entity]/route.ts`)

**Required Structure with Role Checks:**

```typescript
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import {
  get[Entity]sHandler,
  create[Entity]Handler,
  update[Entity]Handler,
  delete[Entity]Handler,
} from './handlers';

/**
 * Helper to get user profile with roles
 */
async function getUserProfile(supabase: SupabaseClient, userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin, is_teacher, is_student')
    .eq('user_id', userId)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile;
}

/**
 * GET /api/[entity]
 * List all entities with role-based filtering
 */
export async function GET(request: NextRequest) {
  try {
    const headersList = headers();
    const supabase = createClient(headersList);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getUserProfile(supabase, user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = parseQueryParams(searchParams);

    const result = await get[Entity]sHandler(supabase, user, profile, queryParams);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('GET /api/[entity] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/[entity]
 * Create a new entity (requires appropriate role)
 */
export async function POST(request: NextRequest) {
  // Similar pattern as GET
}

/**
 * PUT /api/[entity]?id=[id]
 * Update an entity (requires appropriate role)
 */
export async function PUT(request: NextRequest) {
  // Similar pattern as GET
}

/**
 * DELETE /api/[entity]?id=[id]
 * Delete an entity (requires appropriate role)
 */
export async function DELETE(request: NextRequest) {
  // Similar pattern as GET
}
```

**Key Requirements:**

- ✅ Always use Next.js `headers()` for auth
- ✅ Always verify user authentication
- ✅ Always check user profile/roles
- ✅ Delegate business logic to handlers with role checks
- ✅ Use consistent error responses (401, 403, 404, 422, 500)
- ✅ Add JSDoc comments for each endpoint
- ✅ Handle all errors with try/catch

---

### 2. Role-Specific Routes

**Admin/Teacher Route (`/app/api/[entity]/admin-[entity]s/route.ts`):**

```typescript
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * GET /api/[entity]/admin-[entity]s
 * Admin/Teacher endpoint - returns ALL entities with optional filters
 */
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

		// Verify admin or teacher role
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

		// Optional filters
		if (level) query = query.eq('level', level);

		// For teachers, filter to only their students' entities
		if (profile.is_teacher && !profile.is_admin) {
			const { data: studentIds } = await supabase
				.from('lessons')
				.select('student_id')
				.eq('teacher_id', user.id);

			const ids = studentIds?.map((s) => s.student_id) || [];
			query = query.in('student_id', ids);
		}

		const { data, error } = await query;

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error('Error in admin-[entity]s route:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
```

**Teacher-Specific Route (`/app/api/[entity]/teacher-[entity]s/route.ts`):**

```typescript
/**
 * GET /api/[entity]/teacher-[entity]s?teacherId={id}
 * Teacher endpoint - returns entities for teacher's students only
 */
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const teacherId = searchParams.get('teacherId');

		if (!teacherId) {
			return NextResponse.json(
				{ error: 'Teacher ID is required' },
				{ status: 400 }
			);
		}

		const headersList = headers();
		const supabase = createClient(headersList);

		// Verify user is this teacher
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user || user.id !== teacherId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get teacher's student IDs
		const { data: studentIds } = await supabase
			.from('lessons')
			.select('student_id')
			.eq('teacher_id', teacherId);

		if (!studentIds || studentIds.length === 0) {
			return NextResponse.json([]);
		}

		const ids = studentIds.map((s) => s.student_id);

		// Fetch entities for these students
		const { data, error } = await supabase
			.from('[entity]s')
			.select('*')
			.in('student_id', ids);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error('Error in teacher-[entity]s route:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
```

**Student Route (`/app/api/[entity]/student-[entity]s/route.ts`):**

```typescript
/**
 * GET /api/[entity]/student-[entity]s?userId={id}
 * Student endpoint - returns only entities assigned to this student
 */
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get('userId');

		if (!userId) {
			return NextResponse.json(
				{ error: 'User ID is required' },
				{ status: 400 }
			);
		}

		const headersList = headers();
		const supabase = createClient(headersList);

		// Verify user is a student and is requesting their own data
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user || user.id !== userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { data: profile } = await supabase
			.from('profiles')
			.select('is_student')
			.eq('user_id', userId)
			.single();

		if (!profile?.is_student) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Fetch only entities assigned to this student
		const { data, error } = await supabase
			.from('[entity]s')
			.select('*')
			.eq('student_id', userId);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error('Error in student-[entity]s route:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
```

---

### 3. Handlers File (`/app/api/[entity]/handlers.ts`)

**Purpose:** Pure business logic functions that are testable without Next.js dependencies

**Required Structure:**

```typescript
import { [Entity]InputSchema } from '@/schemas/[Entity]Schema';
import { ZodError } from 'zod';

export interface [Entity]QueryParams {
  // Filter parameters
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface [Entity]Response {
  [entity]s: [Entity][];
  count?: number;
}

export interface [Entity]Error {
  error: string;
  status: number;
}

export type [Entity]Result = [Entity]Response | [Entity]Error;

/**
 * Validate that user has required role for mutation operations
 */
export function validateMutationPermission(
  profile: { is_admin?: boolean; is_teacher?: boolean } | null,
  requiredRoles: ('admin' | 'teacher')[] = ['admin', 'teacher']
): boolean {
  if (!profile) return false;

  if (requiredRoles.includes('admin') && profile.is_admin) return true;
  if (requiredRoles.includes('teacher') && profile.is_teacher) return true;

  return false;
}

/**
 * GET handler - List entities with filtering
 */
export async function get[Entity]sHandler(
  supabase: any,
  user: { id: string } | null,
  profile: { is_admin?: boolean; is_teacher?: boolean; is_student?: boolean } | null,
  query: [Entity]QueryParams
): Promise<[Entity]Result> {
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }

  // Build query with filters
  let dbQuery = supabase.from('[entity]s').select('*', { count: 'exact' });

  // Apply role-based filtering
  if (!profile?.is_admin && !profile?.is_teacher) {
    // Students can only see their assigned entities
    dbQuery = dbQuery.eq('student_id', user.id);
  }

  // Apply filters, sorting, pagination
  // ... implementation

  const { data, error, count } = await dbQuery;

  if (error) {
    return { error: error.message, status: 500 };
  }

  return { [entity]s: data || [], count };
}

/**
 * POST handler - Create entity
 */
export async function create[Entity]Handler(
  supabase: any,
  user: { id: string } | null,
  profile: { is_admin?: boolean; is_teacher?: boolean } | null,
  body: unknown
): Promise<{ [entity]?: [Entity]; error?: string; status: number }> {
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }

  if (!validateMutationPermission(profile)) {
    return { error: 'Forbidden: Insufficient permissions', status: 403 };
  }

  try {
    const validated = [Entity]InputSchema.parse(body);

    const { data, error } = await supabase
      .from('[entity]s')
      .insert(validated)
      .select()
      .single();

    if (error) {
      return { error: error.message, status: 500 };
    }

    return { [entity]: data, status: 201 };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        error: `Validation failed: ${JSON.stringify(err.flatten().fieldErrors)}`,
        status: 422,
      };
    }
    return { error: 'Internal server error', status: 500 };
  }
}

/**
 * PUT handler - Update entity
 */
export async function update[Entity]Handler(
  supabase: any,
  user: { id: string } | null,
  profile: { is_admin?: boolean; is_teacher?: boolean } | null,
  id: string,
  body: unknown
): Promise<{ [entity]?: [Entity]; error?: string; status: number }> {
  // Similar pattern to create
}

/**
 * DELETE handler - Delete entity
 */
export async function delete[Entity]Handler(
  supabase: any,
  user: { id: string } | null,
  profile: { is_admin?: boolean; is_teacher?: boolean } | null,
  id: string
): Promise<{ success?: boolean; error?: string; status: number }> {
  // Similar pattern to create
}
```

**Key Requirements:**

- ✅ Pure functions with no Next.js dependencies
- ✅ Explicit types for all parameters and returns
- ✅ Zod validation for all input
- ✅ Role-based access control
- ✅ Consistent error handling
- ✅ Return status codes with responses

---

### 3. Role-Specific Routes

**Admin/Teacher Route (`/app/api/[entity]/admin-[entity]s/route.ts`):**

```typescript
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

		// Verify admin or teacher role
		const { data: profile } = await supabase
			.from('profiles')
			.select('is_admin, is_teacher')
			.eq('user_id', user.id)
			.single();

		if (!profile?.is_admin && !profile?.is_teacher) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Fetch all entities (no filtering)
		const { searchParams } = new URL(request.url);
		const level = searchParams.get('level');

		let query = supabase.from('[entity]s').select('*');

		if (level) {
			query = query.eq('level', level);
		}

		const { data, error } = await query;

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error('Error in admin-[entity]s route:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
```

**Student Route (`/app/api/[entity]/student-[entity]s/route.ts`):**

```typescript
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get('userId');

		if (!userId) {
			return NextResponse.json(
				{ error: 'User ID is required' },
				{ status: 400 }
			);
		}

		const headersList = headers();
		const supabase = createClient(headersList);

		// Verify user is a student
		const { data: profile } = await supabase
			.from('profiles')
			.select('is_student')
			.eq('user_id', userId)
			.single();

		if (!profile?.is_student) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Fetch only assigned entities
		const { data, error } = await supabase
			.from('[entity]s')
			.select('*')
			.eq('student_id', userId);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error('Error in student-[entity]s route:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
```

---

## 🎨 Component Standards

### 1. List Component (`components/[entity]/[Entity]List.tsx`)

**Structure:**

```typescript
'use client';

import { use[Entity]List } from './use[Entity]List';
import { [Entity]ListHeader } from './[Entity]List.Header';
import { [Entity]ListTable } from './[Entity]List.Table';
import { [Entity]ListFilter } from './[Entity]List.Filter';
import { [Entity]ListEmpty } from './[Entity]List.Empty';

export function [Entity]List() {
  const { [entity]s, loading, error, filterLevel, setFilterLevel, refresh } = use[Entity]List();

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <[Entity]ListHeader onRefresh={refresh} />
      <[Entity]ListFilter value={filterLevel} onChange={setFilterLevel} />

      {loading ? (
        <div>Loading...</div>
      ) : [entity]s.length === 0 ? (
        <[Entity]ListEmpty />
      ) : (
        <[Entity]ListTable [entity]s={[entity]s} />
      )}
    </div>
  );
}
```

**Key Requirements:**

- ✅ Use custom hook for data fetching
- ✅ Split into small, focused sub-components
- ✅ Handle loading, error, and empty states
- ✅ Mobile-first responsive design
- ✅ Dark mode support

---

### 2. Custom Hook (`components/[entity]/use[Entity]List.ts`)

**Structure:**

```typescript
import { useEffect, useState, useCallback } from 'react';
import type { Tables } from '@/lib/supabase';
import { useAuth } from '@/components/auth';

export type [Entity]WithExtra = Tables<'[entity]s'> & {
  // Additional fields if needed
};

export default function use[Entity]List() {
  const { user, isTeacher, isAdmin } = useAuth();
  const [entity]s, set[Entity]s] = useState<[Entity]WithExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);

  const load[Entity]s = useCallback(async () => {
    if (!user?.id) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ userId: user.id });
      if (filterLevel) params.append('level', filterLevel);

      const endpoint = isAdmin || isTeacher
        ? '/api/[entity]/admin-[entity]s'
        : '/api/[entity]/student-[entity]s';

      const response = await fetch(`${endpoint}?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch');
      }

      const data = await response.json();
      set[Entity]s(data);
      setError(null);
    } catch (err) {
      console.error('Error loading [entity]s:', err);
      setError(err instanceof Error ? err.message : 'Failed to load');
      set[Entity]s([]);
    } finally {
      setLoading(false);
    }
  }, [filterLevel, isAdmin, isTeacher, user?.id]);

  useEffect(() => {
    void load[Entity]s();
  }, [load[Entity]s]);

  return {
    [entity]s,
    loading,
    error,
    filterLevel,
    setFilterLevel,
    refresh: load[Entity]s
  };
}
```

**Key Requirements:**

- ✅ Use `useAuth` hook for user context
- ✅ Handle authentication state
- ✅ Use `useCallback` for functions
- ✅ Return `refresh` function for manual reload
- ✅ Proper TypeScript types

---

### 3. Form Component (`components/[entity]/[Entity]Form.tsx`)

**Structure:**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { [Entity]InputSchema } from '@/schemas/[Entity]Schema';
import { [Entity]FormFields } from './[Entity]Form.Fields';

interface [Entity]FormProps {
  initialData?: Partial<[Entity]>;
  mode: 'create' | 'edit';
}

export function [Entity]Form({ initialData, mode }: [Entity]FormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData);

      // Validate with Zod
      const validated = [Entity]InputSchema.parse(data);

      const endpoint = mode === 'create'
        ? '/api/[entity]'
        : `/api/[entity]?id=${initialData?.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      router.push('/[entity]');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500">{error}</div>}

      <[Entity]FormFields initialData={initialData} />

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

**Key Requirements:**

- ✅ Validate with Zod before submission
- ✅ Handle both create and edit modes
- ✅ Show loading and error states
- ✅ Use FormData for form handling
- ✅ Redirect after successful save

---

## 📋 Schema Standards

### Schema File (`schemas/[Entity]Schema.ts`)

**Required Schemas:**

```typescript
import * as z from 'zod';
import { /* Common validators */ } from './CommonSchema';

// 1. Base schema (full entity)
export const [Entity]Schema = z.object({
  id: z.string().uuid().optional(),
  // ... all fields
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// 2. Input schema (for creating)
export const [Entity]InputSchema = z.object({
  // Required fields only (no id, timestamps)
});

// 3. Update schema (for partial updates)
export const [Entity]UpdateSchema = [Entity]InputSchema.partial().extend({
  id: z.string().uuid('ID is required'),
});

// 4. Filter schema (for query parameters)
export const [Entity]FilterSchema = z.object({
  // Filter fields
});

// 5. Sort schema (for ordering)
export const [Entity]SortSchema = z.object({
  field: z.enum(['field1', 'field2', 'created_at']),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

// 6. With relations (joined data)
export const [Entity]WithRelationsSchema = [Entity]Schema.extend({
  // Related entities
});

// Export types
export type [Entity] = z.infer<typeof [Entity]Schema>;
export type [Entity]Input = z.infer<typeof [Entity]InputSchema>;
export type [Entity]Update = z.infer<typeof [Entity]UpdateSchema>;
export type [Entity]Filter = z.infer<typeof [Entity]FilterSchema>;
export type [Entity]Sort = z.infer<typeof [Entity]SortSchema>;
export type [Entity]WithRelations = z.infer<typeof [Entity]WithRelationsSchema>;
```

---

## ✅ Checklist for New Entity

When implementing CRUD for a new entity, follow this checklist:

### Database

- [ ] Create migration in `supabase/migrations/`
- [ ] Add RLS policies
- [ ] Update types: `supabase gen types typescript --local`

### Schemas

- [ ] Create `[Entity]Schema.ts` with all required schemas
- [ ] Export types
- [ ] Update `schemas/index.ts`

### API Routes

- [ ] Create `/app/api/[entity]/route.ts` with all HTTP methods
- [ ] Create `/app/api/[entity]/handlers.ts` with pure functions
- [ ] Create `/app/api/[entity]/[id]/route.ts` for single item
- [ ] Create `/app/api/[entity]/admin-[entity]s/route.ts` if needed
- [ ] Create `/app/api/[entity]/student-[entity]s/route.ts` if needed

### Components

- [ ] Create `components/[entity]/index.ts` with re-exports
- [ ] Create `use[Entity]List.ts` hook
- [ ] Create `use[Entity].ts` hook for single item
- [ ] Create `[Entity]List.tsx` main component
- [ ] Split list into sub-components (Header, Table, Filter, Empty)
- [ ] Create `[Entity]Form.tsx` main component
- [ ] Split form into sub-components (Fields, Content, Guards)
- [ ] Create `[Entity]Detail.tsx` if needed

### Pages

- [ ] Create `/app/[entity]/page.tsx` for list
- [ ] Create `/app/[entity]/[id]/page.tsx` for detail
- [ ] Create `/app/[entity]/[id]/edit/page.tsx` for editing
- [ ] Create `/app/[entity]/new/page.tsx` for creating

### Tests

- [ ] Create `__tests__/schemas/[Entity]Schema.test.ts`
- [ ] Create `__tests__/api/[entity]/handlers.test.ts`
- [ ] Create `__tests__/components/[Entity]List.test.tsx`
- [ ] Create `__tests__/components/[Entity]Form.test.tsx`

### Documentation

- [ ] Add usage examples to schema README
- [ ] Update API documentation
- [ ] Add to TODO.md if incomplete

---

## 🚨 Common Pitfalls to Avoid

1. **DON'T** mix business logic in route handlers - use handlers.ts
2. **DON'T** forget authentication checks in every route
3. **DON'T** skip Zod validation for user input
4. **DON'T** create monolithic components - split into small pieces
5. **DON'T** hardcode role checks - use `useAuth` hook
6. **DON'T** forget to handle loading/error/empty states
7. **DON'T** skip mobile-first design
8. **DON'T** forget dark mode support
9. **DON'T** use `console.log` in production code
10. **DON'T** forget to add tests

---

## 📝 Example: Implementing Lessons CRUD

To implement Lessons CRUD following these standards:

1. Create `LessonSchema.ts` (already exists)
2. Create `/app/api/lesson/route.ts` with handlers
3. Create `components/lesson/` directory with all components
4. Create pages in `/app/lesson/`
5. Write tests for all layers

**Estimated time:** 4-6 hours for complete implementation

---

## 🔄 Migration Path for Existing Code

Current songs implementation is mostly compliant but needs:

1. **API Routes:**

   - ✅ Has handlers.ts separation
   - ⚠️ Fix student-songs route (incorrect query logic)
   - ⚠️ Standardize error responses
   - ⚠️ Add proper role verification in all routes

2. **Components:**

   - ✅ Good decomposition into sub-components
   - ✅ Uses useAuth hook
   - ⚠️ Add refresh functionality to useSongList
   - ⚠️ Improve error handling UI

3. **Schemas:**
   - ✅ Comprehensive schema coverage
   - ✅ Good type exports

---

## 📚 Additional Resources

- [TDD Guide](./TDD_GUIDE.md) - Testing practices
- [Project Overview](../PROJECT_OVERVIEW.md) - Architecture details
- [Schema README](../schemas/README.md) - Validation patterns
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
