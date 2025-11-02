# Database Enhancements TODO

## Planned Features

### 1. User Favorites System

```sql
CREATE TABLE public.user_favorites (
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, song_id)
);

-- RLS policies would allow:
-- - Students to manage their own favorites
-- - Teachers to view their students' favorites
-- - Admins to view all favorites
```

**Priority**: Medium
**Benefits**:

- Students can bookmark songs for later practice
- Teachers can see what songs interest their students
- Helps with lesson planning and student engagement

### 2. Practice Logs

```sql
CREATE TABLE public.practice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  practice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Would include triggers for updated_at
-- RLS policies similar to lesson_songs
```

**Priority**: High
**Benefits**:

- Track student practice habits
- Identify challenging areas
- Provide better progress tracking
- Help adjust lesson difficulty

### 3. Notification System

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  type notification_type NOT NULL, -- (lesson_reminder, task_update, practice_reminder)
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE TYPE public.notification_type AS ENUM (
  'lesson_reminder',
  'task_update',
  'practice_reminder',
  'song_update',
  'system_message'
);

-- Would include indexes on user_id and read status
-- RLS policies to ensure users only see their own notifications
```

**Priority**: Medium
**Benefits**:

- Improve user engagement
- Ensure timely lesson attendance
- Track administrative task updates
- Encourage regular practice

## Implementation Notes

1. Database Migration Order:

   - Create notification_type enum
   - Create tables
   - Add indexes
   - Enable RLS
   - Add policies
   - Create any necessary functions/triggers

2. Required Policy Updates:

   - Extend existing RLS policies
   - Add new policies for new tables
   - Maintain role-based access control

3. Application Changes:
   - Update TypeScript types
   - Add Zod schemas
   - Create new API endpoints
   - Add UI components

## Timeline Recommendation

1. **Phase 1** - Practice Logs

   - Highest priority
   - Direct impact on core functionality
   - Helps track student progress

2. **Phase 2** - User Favorites

   - Medium priority
   - Improves user experience
   - Relatively simple to implement

3. **Phase 3** - Notification System
   - Complex but valuable
   - Can be implemented gradually
   - Start with lesson reminders, expand later

## Security Considerations

- Maintain strict RLS policies
- Add appropriate indexes for performance
- Keep audit logs of critical operations
- Implement rate limiting for notifications
- Consider data retention policies

## Testing Requirements

Each new feature should include:

1. Migration tests
2. RLS policy tests
3. API endpoint tests
4. Integration tests
5. Performance impact assessment

## Next Steps

1. Create feature branches for each enhancement
2. Follow TDD workflow for implementation
3. Update documentation
4. Create migration scripts
5. Add automated tests
6. Review and merge incrementally
