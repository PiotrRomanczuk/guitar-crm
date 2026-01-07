# Guitar CRM Documentation

Welcome to the Guitar CRM documentation. This folder contains all necessary information to understand, develop, and deploy the application.

## 📚 Documentation Index

| File | Audience | Description |
|------|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architects & Lead Devs | System design, tech stack, database schema, component structure |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Developers | Setup guide, Git workflow, credentials, CI/CD |
| [FEATURES.md](./FEATURES.md) | Product & Devs | Feature implementation status & roadmap |
| [USER_GUIDES.md](./USER_GUIDES.md) | End Users | Admin, Teacher, and Student user guides |
| [UI_STANDARDS.md](./UI_STANDARDS.md) | Frontend Devs | Design system, components, navigation patterns |
| [TESTING.md](./TESTING.md) | QA & Devs | Testing strategy, Jest & Cypress guides |
| [AI_SYSTEM.md](./AI_SYSTEM.md) | AI/ML Devs | AI features, providers, agents documentation |
| [API_REFERENCE.md](./API_REFERENCE.md) | Integration Devs | API endpoints, bearer tokens, widgets |
| [DATABASE.md](./DATABASE.md) | Backend Devs | Schema, migrations, health reports |

---

## 🚀 Quick Start

```bash
# Clone and install
git clone <repo-url>
cd guitar-crm
npm install

# Setup environment
cp .env.example .env.local
# Fill in Supabase credentials

# Start local Supabase
npx supabase start

# Seed database
bash scripts/database/seeding/local/seed-all.sh

# Run development server
npm run dev
```

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin + Teacher | `p.romanczuk@gmail.com` | `test123_admin` |
| Teacher | `teacher@example.com` | `test123_teacher` |
| Student | `student1@example.com` | `test123_student` |

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **State**: TanStack Query (Server), React Context (UI)
- **Validation**: Zod
- **Testing**: Jest (Unit), Cypress (E2E)
- **AI**: OpenRouter + Ollama (local LLM support)

---

## 🎯 Current Implementation Status

### ✅ Implemented
- Authentication & RBAC (3-tier: Admin/Teacher/Student)
- Lesson Management with history tracking
- Song Library with Spotify integration
- Assignment Management
- User Management with shadow users
- AI Assistant with multiple specialized agents
- API Keys / Bearer Token authentication
- iOS Widgets (Student + Admin)
- Email notifications (cron jobs)

### 🔄 In Progress
- Google Calendar integration
- Student dashboard improvements
- Dashboard analytics

### 📋 Planned
- Recurring lessons
- Payment tracking (Stripe)
- Mobile app

---

## 🤝 Contributing

See [DEVELOPMENT.md](./DEVELOPMENT.md) for setup instructions and coding standards.

## 📝 License

Proprietary - All rights reserved.
