# Database Seeding System

Complete seed data management for Guitar CRM local development.

## 📁 Structure

All seed data is now stored as individual JSON files in `data/`:
- **profiles.json** (4 users)
- **songs.json** (111 songs) 
- **lessons.json** (12 lessons)
- **assignments.json** (7 assignments)
- **practice_sessions.json** (14 sessions)
- **ai_conversations.json** (4 conversations)
- **ai_messages.json** (6 messages)
- Plus 13 more tables

## 🚀 Quick Start

```bash
# Full workflow
npx supabase db reset
node scripts/database/seeding/merge-seed-data.js
node scripts/database/seeding/fix-foreign-keys.js
node scripts/database/seeding/seed-local-db.js
```

## 📊 What's Included

- 4 users (admin, teacher, 2 students)
- 111 songs from legacy database
- 97 test records across 18 tables
- Realistic relationships and timestamps

## ✏️ Adding Data

1. Edit JSON files in `data/` directory
2. Run merge script
3. Run seed script

See inline documentation in each file for field descriptions.
