# Feature Implementation Plans

## 🔐 Authentication & User Management

### Overview

We use Supabase Auth with a custom profile system to handle our three-tier role architecture (Admin, Teacher, Student).

### Implementation Status

- [x] Supabase Auth Integration
- [x] Profile Creation Trigger
- [x] Role-Based Middleware Protection
- [x] Login/Register Pages
- [ ] Password Reset Flow
- [ ] "Shadow User" System (Teachers creating student accounts)

### Shadow Users

Teachers need to create accounts for students who might not have email addresses yet (e.g., children).

- **Mechanism**: Teacher creates a profile. System generates a placeholder auth account or links later.
- **Status**: Pending implementation.

---

## 📚 Lesson Management

### Overview

Core feature allowing teachers to schedule, track, and document lessons.

### Data Model

- **Lesson**: `id`, `teacher_id`, `student_id`, `date`, `status`, `notes`, `price`, `paid`.
- **Lesson Songs**: Junction table linking lessons to songs.

### Features

- **CRUD Operations**: Create, Read, Update, Delete lessons.
- **Scheduling**: Calendar view for teachers.
- **History**: List view of past lessons for students.
- **Payment Tracking**: Mark lessons as paid/unpaid.

### Status

- [x] Database Schema
- [x] Basic CRUD API
- [ ] Calendar Interface
- [ ] Recurring Lessons
- [ ] Payment Integration (Stripe)

---

## 🎸 Song Library

### Overview

A shared repository of songs that teachers can assign to students.

### Features

- **Global Library**: Songs available to all teachers.
- **Personal Library**: Private songs for a specific teacher.
- **Assignments**: Link songs to students/lessons with status (To Learn, In Progress, Mastered).
- **Attachments**: PDF tabs, audio files.

### Status

- [x] Database Schema
- [ ] Song Upload/Management UI
- [ ] Tab/Audio Storage (Supabase Storage)

---

## 📝 Assignments & Practice

### Overview

Homework system for students.

### Features

- **Create Assignment**: Teacher assigns specific tasks (scales, songs, exercises).
- **Student View**: Students see pending tasks.
- **Completion**: Students mark tasks as complete.
- **Feedback**: Teachers provide feedback on completed tasks.

### Status

- [ ] Database Schema Refinement
- [ ] Teacher UI
- [ ] Student UI

---

## 🎛️ Admin Dashboard

### Overview

Central hub for platform administrators.

### Key Metrics

- Total Users (Teachers/Students)
- Active Lessons (Weekly/Monthly)
- Revenue (if platform takes a cut)
- System Health

### Features

- **User Management**: View/Edit/Ban users.
- **System Config**: Global settings.
- **Logs**: View activity logs (Supabase).

### Status

- [ ] Dashboard Layout
