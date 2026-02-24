# 🎸 Strummy — Guitar Teacher CRM

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-Passing-22c55e?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/PiotrRomanczuk/guitar-crm/actions)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2016-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://strummy.app)

A production-grade student management platform built for independent guitar teachers — manage students, lessons, songs, assignments, and AI-generated content in one place.

<p align="center">
  <img src="./public/screenshots/dashboard.png" alt="Strummy Dashboard" width="100%" />
</p>

---

## ✨ Core Features

| 🎓 Student Management | 🎵 Song Library | 🤖 AI Assistant | 📱 Mobile-First |
|:---:|:---:|:---:|:---:|
| Track lessons, assignments, progress, and notes per student. | Spotify-enriched catalog with difficulty, key, and per-student filtering. | Generate lesson notes, assignments & summaries via OpenRouter or local Ollama. | Fully responsive design optimised for teaching from a phone or tablet. |

> [!NOTE]
> Strummy uses **Supabase Row-Level Security** on every table. Teachers only ever see their own students' data — enforced at the database layer, not just in the app.

---

## 🛠️ Technology Stack

| Category | Tech | Description |
| :--- | :--- | :--- |
| **Frontend** | `Next.js 16`, `React 19` | App Router, Server Components, Streaming SSR. |
| **Styling** | `Tailwind CSS 4`, `shadcn/ui` | Utility-first with Radix UI primitives and dark mode. |
| **Backend** | `Next.js API Routes`, `Server Actions` | Serverless architecture with Supabase Realtime. |
| **Database** | `PostgreSQL` (Supabase) | Row-Level Security enforced on all 15+ tables. |
| **Auth** | `Supabase Auth`, `Google OAuth` | Multi-role RBAC: Admin → Teacher → Student. |
| **AI** | `OpenRouter`, `Ollama` | Cloud + local LLM with automatic fallback and streaming. |
| **Integrations** | `Spotify API`, `Google Calendar`, `Google Drive` | Song metadata, calendar sync, and video library. |
| **Validation** | `Zod` | Runtime schema validation at all API boundaries. |
| **Monitoring** | `Sentry`, `Vercel Analytics` | Error tracking, Web Vitals, and custom events. |
| **Testing** | `Jest`, `Playwright` | 1,100+ unit tests + 5 E2E journey specs. |

---

## 🚀 Quick Start (5 Minutes)

### 1️⃣ Clone & Install
```bash
git clone https://github.com/PiotrRomanczuk/guitar-crm.git
cd guitar-crm
npm install
```

### 2️⃣ Configure Environment
```bash
cp .env.example .env.local
# Fill in your Supabase URL/keys, Spotify credentials, and OpenRouter API key
# Minimum required: NEXT_PUBLIC_SUPABASE_REMOTE_URL + NEXT_PUBLIC_SUPABASE_REMOTE_ANON_KEY
```

### 3️⃣ Set Up the Database
```bash
npm run setup:db   # Apply migrations to your Supabase project
npm run seed       # Seed demo admin, teacher, and student accounts
```

### 4️⃣ Launch
```bash
npm run dev        # http://localhost:3000
```

> [!TIP]
> Use the seeded accounts to explore each role immediately:
> `p.romanczuk@gmail.com / test123_admin` · `teacher@example.com / test123_teacher` · `student@example.com / test123_student`

---

## 🔄 Core Workflows

The system is built around three primary user journeys:

1. **Teacher → Lesson Flow**: Create lesson → link songs → record notes with AI → send recap email.
2. **Admin → Song Library**: Import songs manually or sync metadata from Spotify → assign to students.
3. **Student → Practice**: Receive assignment → mark songs as practiced → teacher sees progress.
4. **Automation → Notifications**: Lesson reminders, assignment due dates, and weekly digest emails via 11 cron jobs.
5. **Reporting → Insights**: AI-generated weekly insights, per-student progress summaries, and admin business analytics.

> [!TIP]
> See the [Architecture & Workflows](./docs/ARCHITECTURE.md) doc for data flow diagrams.

---

## 📸 Screenshots

### Dashboard & Analytics
A comprehensive overview with notifications, lesson statistics, today's agenda, student health indicators, and a weekly performance chart.

<img src="./public/screenshots/dashboard.png" alt="Dashboard with analytics, student pipeline, and performance metrics" width="100%" />

### Song Library
Spotify-enriched catalog with album art, difficulty badges, musical key metadata, and per-student filtering.

<img src="./public/screenshots/songs.png" alt="Song library with Spotify sync, level badges, and key metadata" width="100%" />

### Lesson Management
Searchable, sortable lesson table with status filters, bulk import/export, and one-click lesson creation.

<img src="./public/screenshots/lessons.png" alt="Lesson management table with filters and bulk import/export" width="100%" />

### Calendar & Scheduling
Monthly calendar with color-coded lesson density, daily agenda view, and Google Calendar sync.

<img src="./public/screenshots/calendar.png" alt="Calendar with monthly view, daily agenda, and lesson details" width="100%" />

### Student Profiles
Per-student detail page with status badge, role tags, editable notes, lesson history, and PDF/Excel export.

<img src="./public/screenshots/student-profile.png" alt="Student profile with status, roles, notes, and action buttons" width="100%" />

### Profile & Account Security
Full profile editor with 2FA (TOTP), session activity tracking, email change flow, Google OAuth linking, and account deletion with 30-day grace period.

<img src="./public/screenshots/profile.png" alt="Profile page with 2FA, session activity, and account management" width="100%" />

---

## 🚀 Recent Releases

### **v0.86.10 — System Debug Dashboard** (Feb 24, 2026)
- **🔍 Debug Page**: New admin page at `/dashboard/admin/debug` showing live health for all 8 external service integrations.
- **🩺 Health API**: `GET /api/health` runs parallel checks on Supabase ×2, Spotify, Google Calendar, Google Drive, Gmail SMTP, OpenRouter, and Ollama.
- **🤖 AI Debug API**: `GET /api/ai/debug` exposes queue, rate-limit buckets, streaming analytics, and last 10 AI generations.
- **🔄 Auto-Refresh**: 30 s auto-refresh with manual override and countdown button.

### **v0.86.8 — Security Hardening Fleet** (Feb 24, 2026)
- **🛡 IDOR Fix**: Replaced plain `userId` parameter with HMAC-signed unsubscribe tokens on all email links.
- **🔒 RLS Hardening**: `song_videos` table policies tightened; Zod validation added to all endpoints.
- **🔧 Injection Fix**: Resolved PostgREST filter injection vector in song search API.
- **✅ CI/CD**: DB and security checks are now blocking gates in the CI pipeline.

### **v0.86.4 — Cron & Calendar Security** (Feb 24, 2026)
- **📅 Calendar Webhooks**: Added `X-Goog-Channel-Token` validation to Google Calendar webhook endpoint.
- **⏰ Cron Registry**: Registered all 11 missing cron jobs in `vercel.json`.
- **🔑 Secret Hygiene**: Removed `NEXT_PUBLIC_` prefix from service role key references in RSC props.
- **📈 N+1 Fixes**: Replaced `select('*')` with explicit columns in weekly-insights and admin queries.

> See the [full release history](https://github.com/PiotrRomanczuk/guitar-crm/releases) for all versions.

---

## 📖 Complete Documentation

| Guide | Description |
| :--- | :--- |
| 🏗 **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | System design, RBAC model, and database schema. |
| 🛠 **[DEVELOPMENT.md](./docs/DEVELOPMENT.md)** | Local setup, Git workflow, branching, and CI/CD. |
| ✨ **[FEATURES.md](./docs/FEATURES.md)** | Detailed feature specifications and screenshots. |
| 🤖 **[AI_SYSTEM.md](./docs/AI_SYSTEM.md)** | AI provider architecture, agents, and usage guide. |
| 📅 **[GOOGLE_CALENDAR_INTEGRATION.md](./docs/GOOGLE_CALENDAR_INTEGRATION.md)** | Calendar sync setup and webhook configuration. |
| 🔔 **[NOTIFICATION_SYSTEM.md](./docs/NOTIFICATION_SYSTEM.md)** | Email and in-app notification architecture. |
| 🔌 **[API_REFERENCE.md](./docs/API_REFERENCE.md)** | REST API routes and Server Actions reference. |
| 🧪 **[TESTING.md](./docs/TESTING.md)** | Testing strategy, E2E vs unit, coverage targets. |

---

## ⚙️ Project Structure

```
guitar-crm/
├── app/                   # Next.js App Router — pages, API routes, Server Actions
│   ├── api/               #   REST endpoints (health, AI debug, crons, webhooks)
│   └── dashboard/         #   Protected teacher & admin pages
├── components/            # React components organized by feature domain (30+)
├── lib/                   # Business logic modules
│   ├── ai/                #   AI provider factory, queue, rate-limiter, streaming
│   ├── email/             #   SMTP templates and delivery
│   ├── health/            #   Service health checkers
│   ├── services/          #   Domain services (lessons, songs, students)
│   └── supabase/          #   Database clients and helpers
├── schemas/               # Zod validation schemas
├── types/                 # TypeScript type definitions
├── supabase/migrations/   # 60+ database migrations
├── docs/                  # Project documentation (58 files)
├── __tests__/             # Jest tests (mirrors source structure)
├── e2e/                   # Playwright E2E test specs
└── .claude/agents/        # 15 specialized AI agent configurations
```

---

## 🩺 System Status

> [!NOTE]
> Admins can monitor live service health at **`/dashboard/admin/debug`** — shows real-time status of all 8 external integrations, 11 cron jobs, and AI infrastructure state.

| Service | Check |
| :--- | :--- |
| Supabase Local / Remote | `HEAD /rest/v1/` |
| Spotify API | Client-credentials token exchange |
| Google Calendar | Discovery endpoint reachability |
| Google Drive | Discovery endpoint reachability |
| Gmail SMTP | `transporter.verify()` |
| OpenRouter | `GET /api/v1/models` |
| Ollama (local) | `GET /api/tags` |

---

## 🚢 Deployment

| Branch | Environment | URL |
|:---|:---|:---|
| `main` | Preview / Staging | Vercel Preview (auto-deploy on every push) |
| `production` | Production | [strummy.app](https://strummy.app) |

---

## 🆘 Need Help?

- **System Status**: Visit `/dashboard/admin/debug` for live service and AI health checks.
- **Architecture**: Read [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for system design.
- **AI Setup**: See [docs/AI_SYSTEM.md](./docs/AI_SYSTEM.md) for configuring OpenRouter or Ollama.
- **Google Calendar**: Follow [docs/GOOGLE_CALENDAR_INTEGRATION.md](./docs/GOOGLE_CALENDAR_INTEGRATION.md) for OAuth setup.
- **Issues**: Open a ticket at [github.com/PiotrRomanczuk/guitar-crm/issues](https://github.com/PiotrRomanczuk/guitar-crm/issues).

---

Built with ❤️ for independent guitar teachers.
