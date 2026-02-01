# Guitar CRM Documentation

Welcome to the Guitar CRM documentation. This folder contains all necessary information to understand, develop, and deploy the application.

## 📚 Documentation Structure

### Core Documentation

| File | Audience | Description |
|------|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architects & Lead Devs | System design, tech stack, database schema, RBAC |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Developers | Setup guide, Git workflow, testing, CI/CD |
| [FEATURES.md](./FEATURES.md) | Product & Devs | Feature implementation plans |
| [ROADMAP.md](./ROADMAP.md) | Everyone | Project priorities and vision |

### User Guides

| File | Audience | Description |
|------|----------|-------------|
| [ADMIN_USER_GUIDE.md](./ADMIN_USER_GUIDE.md) | Admins/Teachers | Admin dashboard features and workflows |
| [STUDENT_USER_GUIDE.md](./STUDENT_USER_GUIDE.md) | Students | Student portal features |

### Technical References

| File | Description |
|------|-------------|
| [UI_STANDARDS.md](./UI_STANDARDS.md) | Design system, components, mobile-first patterns |
| [COMPONENT_STRUCTURE.md](./COMPONENT_STRUCTURE.md) | Component organization and conventions |
| [NAVIGATION.md](./NAVIGATION.md) | Navigation architecture and implementation |
| [BEARER_TOKEN.md](./BEARER_TOKEN.md) | API authentication with bearer tokens |

### Feature Specs

| File | Description |
|------|-------------|
| [SONG_PAGE_SPEC.md](./SONG_PAGE_SPEC.md) | Song detail page specification |
| [E2E_TEST_PLAN.md](./E2E_TEST_PLAN.md) | End-to-end testing strategy |
| [EMAIL_NOTIFICATIONS_PLAN.md](./EMAIL_NOTIFICATIONS_PLAN.md) | Email notification system |
| [GOOGLE_CALENDAR_IMPORT_PLAN.md](./GOOGLE_CALENDAR_IMPORT_PLAN.md) | Google Calendar integration |

### Platform Guides

| File | Description |
|------|-------------|
| [IOS_WIDGET_SETUP.md](./IOS_WIDGET_SETUP.md) | Student iOS widget with Scriptable |
| [IOS_ADMIN_WIDGET_SETUP.md](./IOS_ADMIN_WIDGET_SETUP.md) | Admin iOS widget with Scriptable |
| [MCP_SERVERS_LIST.md](./MCP_SERVERS_LIST.md) | Model Context Protocol servers |

---

## 🚀 Quick Start

```bash
# Clone and install
git clone <repo-url>
npm install

# Setup environment
cp .env.example .env.local
# Fill in Supabase credentials

# Run development server
npm run dev
```

---

## 🤝 Contributing

Please read [DEVELOPMENT.md](./DEVELOPMENT.md) for our code of conduct and PR process.
