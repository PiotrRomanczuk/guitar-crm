# Strummy Documentation

Documentation for the Strummy guitar lesson management system.

## Core Documentation

| File | Description |
|------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, tech stack, database schema, RBAC |
| [DATABASE.md](./DATABASE.md) | Database schema and relationships |
| [DATABASE_LAYER.md](./DATABASE_LAYER.md) | Data access layer implementation |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Setup guide, Git workflow, CI/CD |

## Features & API

| File | Description |
|------|-------------|
| [FEATURES.md](./FEATURES.md) | Feature overview and implementation details |
| [API_REFERENCE.md](./API_REFERENCE.md) | REST API endpoints and usage |
| [AI_SYSTEM.md](./AI_SYSTEM.md) | AI integration (OpenRouter, Ollama) |
| [EXTERNAL_API_SYSTEM.md](./EXTERNAL_API_SYSTEM.md) | External database API routing |
| [BEARER_TOKEN.md](./BEARER_TOKEN.md) | API key authentication |

## UI & Design

| File | Description |
|------|-------------|
| [UI_STANDARDS.md](./UI_STANDARDS.md) | Design system, components, patterns |
| [NAVIGATION.md](./NAVIGATION.md) | Navigation architecture |
| [RESPONSIVE_DESIGN.md](./RESPONSIVE_DESIGN.md) | Mobile-first responsive patterns |
| [RESPONSIVE_VISUAL_GUIDE.md](./RESPONSIVE_VISUAL_GUIDE.md) | Visual breakpoint reference |

## Operations

| File | Description |
|------|-------------|
| [TESTING.md](./TESTING.md) | Testing strategy (Jest, Cypress) |
| [PRODUCTION_REQUIREMENTS.md](./PRODUCTION_REQUIREMENTS.md) | Production deployment checklist |
| [USER_GUIDES.md](./USER_GUIDES.md) | End-user documentation |

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup instructions.
