# Strummy

**A modern student management platform for guitar teachers**

[![CI/CD Pipeline](https://github.com/PiotrRomanczuk/guitar-crm/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/PiotrRomanczuk/guitar-crm/actions)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

<p align="center">
  <img src="./public/screenshots/dashboard.png" alt="Strummy Dashboard" width="100%" />
</p>

## Features

### Dashboard & Analytics

A comprehensive overview for teachers with notifications, lesson statistics (total, upcoming, completed, cancelled), today's agenda, students needing attention, weekly activity feed, and student health indicators. Includes a student pipeline funnel, conversion rate metrics, performance chart tracking over time, a students overview with quick-access cards, song library summary, recent activity log, assignments panel, weekly progress graph, and system overview stats.

<img src="./public/screenshots/dashboard.png" alt="Dashboard with analytics, student pipeline, and performance metrics" width="100%" />

### Song Library

Spotify-enriched song library with album art, artist names, difficulty level badges (beginner, intermediate), musical key metadata, and per-student filtering. Export your library, sync with Spotify for album art and metadata, or add songs manually. Search by title or artist and filter by level, key, or student.

<img src="./public/screenshots/songs.png" alt="Song library with Spotify sync, level badges, and key metadata" width="100%" />

### Lesson Management

Full lesson management with searchable, sortable table showing title, student, teacher, date, time, and status. Filter by lesson status, student, or teacher. Import and export lesson data in bulk. Create new lessons with one click.

<img src="./public/screenshots/lessons.png" alt="Lesson management table with filters and bulk import/export" width="100%" />

### Calendar & Scheduling

Monthly calendar view with color-coded event indicators showing lesson density per day. Click any date to see a daily agenda with lesson details including time, location, and participant emails. Toggle between calendar and list views. Sync all lessons with Google Calendar.

<img src="./public/screenshots/calendar.png" alt="Calendar with monthly view, daily agenda, and lesson details" width="100%" />

### Student Profiles

Per-student detail page with name, email, registration status badge, role tags (Student, Teacher, Admin), and editable notes. Quick actions to edit profile, import songs, export student data (PDF/Excel), or delete the student. Below the profile card, view the student's full lesson history.

<img src="./public/screenshots/student-profile.png" alt="Student profile with status, roles, notes, and action buttons" width="100%" />

### Profile & Account Security

Full profile editor with personal information (name, username, bio), session activity tracking (last sign-in, total sign-ins), email change with confirmation flow, two-factor authentication via TOTP authenticator app, linked accounts (Google OAuth), and account deletion with a 30-day grace period.

<img src="./public/screenshots/profile.png" alt="Profile page with 2FA, session activity, and account management" width="100%" />

### Admin Tools

A dedicated sidebar section for admin users with tools for Spotify match management, Drive video linking, song statistics, lesson statistics, activity logs, system health monitoring, and AI conversation history.

### AI Assistant

Multi-provider AI (OpenRouter cloud + Ollama local) with streaming responses. Generate lesson notes, create assignments, normalize song metadata, and get personalized student summaries.

### Assignments

Template-based assignments with due dates, student-specific tracking, and completion status.

### Notifications

In-app and email notifications with per-user preference controls and rate limiting.

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | Supabase (PostgreSQL, Auth, Row-Level Security) |
| **AI** | OpenRouter (cloud) + Ollama (local) with streaming |
| **Integrations** | Spotify API, Google Calendar |
| **Testing** | Jest (1,100+ tests), Playwright (E2E) |
| **Deployment** | Vercel (Preview + Production) |

## Getting Started

### Prerequisites

- **Node.js** >= 20.9.0 ([Download](https://nodejs.org/))
- **npm** >= 10.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/PiotrRomanczuk/guitar-crm.git
cd guitar-crm

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase, Spotify, and OpenRouter credentials

# Set up the database and seed sample data
npm run setup:db
npm run seed

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Project Structure

```
app/                  # Next.js App Router pages, API routes, Server Actions
components/           # React components organized by domain
  lessons/            #   Lesson management UI
  songs/              #   Song library UI
  users/              #   User/student profiles
  calendar/           #   Calendar views
lib/                  # Business logic
  ai/                 #   AI provider abstraction (OpenRouter, Ollama)
  services/           #   Domain services
  supabase/           #   Database client & helpers
schemas/              # Zod validation schemas
types/                # TypeScript type definitions
supabase/             # Database migrations
docs/                 # Project documentation
__tests__/            # Test files mirroring source structure
```

## Testing

Testing follows a **70/20/10 pyramid**: unit, integration, E2E.

```bash
npm test                 # Run unit tests (~1,100+ tests)
npm run test:integration # Run integration tests
npm run test:all         # Run unit + integration tests
npx playwright test      # Run E2E tests
npm run test:coverage    # Unit tests with coverage report
```

## Deployment

| Branch | Environment | URL |
|---|---|---|
| `main` | Preview / Staging | Vercel Preview |
| `production` | Production | [strummy.app](https://strummy.app) |

Deployments are automatic via Vercel on every push.

## Documentation

Full documentation is available in the [`docs/`](./docs/README.md) folder:

- **[Architecture](./docs/ARCHITECTURE.md)** — System design, tech stack, database schema
- **[Development Guide](./docs/DEVELOPMENT.md)** — Setup, git workflow, testing, CI/CD
- **[Features](./docs/FEATURES.md)** — Detailed feature specifications
- **[AI System](./docs/AI_SYSTEM.md)** — AI provider architecture and usage
- **[Google Calendar](./docs/GOOGLE_CALENDAR_INTEGRATION.md)** — Calendar sync setup
- **[Notification System](./docs/NOTIFICATION_SYSTEM.md)** — Email and in-app notifications
- **[API Reference](./docs/API_REFERENCE.md)** — API routes and Server Actions

## License

Private project. All rights reserved.
