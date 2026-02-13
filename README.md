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

Stats cards, student pipeline, weekly progress chart, performance metrics, and real-time notifications — all in one place.

<img src="./public/screenshots/dashboard.png" alt="Dashboard with analytics and student overview" width="100%" />

### Song Library

Spotify-enriched song library with album art, difficulty levels, key/chord metadata, and search & filter.

<img src="./public/screenshots/songs.png" alt="Song library with Spotify integration" width="100%" />

### Lesson Management

Schedule, track, import/export lessons. Filter by status, student, or teacher. Full CRUD with notes and status tracking.

<img src="./public/screenshots/lessons.png" alt="Lesson management table" width="100%" />

### Calendar & Scheduling

Google Calendar sync with event indicators, daily agenda view, and per-lesson detail panel.

<img src="./public/screenshots/calendar.png" alt="Calendar with lesson schedule" width="100%" />

### Student Profiles

Per-student view with lessons, assignments, song repertoire, and progress tracking. Export student data as PDF or Excel.

<img src="./public/screenshots/student-profile.png" alt="Student profile with lessons and assignments" width="100%" />

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
