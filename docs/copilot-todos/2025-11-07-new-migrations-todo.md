# Todo List: New Supabase Migrations (2025-11-07)

## Migration Implementation Plan

**Legend:**

- [ ] not started
- [-] in progress
- [x] completed

---

### Phase 1: Foundation

1. [ ] Drop all existing tables, types, functions, triggers (reset)
2. [x] Create all required enums (difficulty_level, music_key, lesson_song_status, etc.)

### Phase 2: Core Tables

3. [ ] Create `profiles` table (no role flags)
4. [ ] Create `user_roles` table (normalized roles)
5. [ ] Create `songs` table
6. [ ] Create `lessons` table
7. [ ] Create `lesson_songs` table
8. [ ] Create `task_management` table

### Phase 3: Functions & Triggers

9. [x] Create `update_updated_at_column` function
10. [-] Create `handle_new_user` function
11. [ ] Create `set_lesson_numbers` function
12. [ ] Create triggers for profile creation, updated_at, lesson numbering

### Phase 4: RLS Policies

13. [ ] Enable RLS on all tables
14. [ ] Create RLS policies for all tables using only `user_roles`

### Phase 5: Views & Reporting

15. [ ] Create `user_overview` view (roles calculated from `user_roles`)
16. [ ] Create additional reporting views as needed

### Phase 6: Data Migration & Seed

17. [ ] Seed initial data (enums, sample users, songs, etc.)

---

## Next Actions

- Begin with Phase 1, step 1: Drop all existing tables/types/functions/triggers
- Update this todo list after each migration is implemented
- Ensure all new migrations use snake_case and normalized role management
- Run quality checks after each phase
