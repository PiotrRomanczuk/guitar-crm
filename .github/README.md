# .github — Configuration & Standards

Development standards, CI/CD workflows, GitHub Copilot agents, and deployment setup for Strummy.

> **Note:** The primary AI development workflow has moved to [Claude Code agents](../.claude/agents/) (15 agents). The Copilot agents in this folder remain available for GitHub Copilot users.

## Folder Structure

```
.github/
├── workflows/                   # GitHub Actions CI/CD (4 workflows)
│   ├── ci-cd.yml                #   11-job pipeline: lint, test, build, security, deploy
│   ├── version-bump.yml         #   Automated semantic versioning on merge to main
│   ├── claude-code-review.yml   #   AI code review on every PR
│   └── claude.yml               #   @claude mentions in issues/PRs
├── agents/                      # GitHub Copilot agent specs (11 agents)
├── instructions/                # Development standards (10 guides)
│   ├── DEVELOPMENT-STANDARDS.md #   Foundation overview
│   ├── STANDARDS-INDEX.md       #   Quick lookup table
│   ├── component-architecture.instructions.md
│   ├── api-data-fetching.instructions.md
│   ├── error-handling-logging.instructions.md
│   ├── form-validation.instructions.md
│   ├── state-management.instructions.md
│   ├── testing-standards.instructions.md
│   ├── git-workflow.instructions.md
│   ├── naming-conventions.instructions.md
│   └── performance-optimization.instructions.md
├── deployment/
│   └── DEPLOYMENT_SETUP.md      # Infrastructure & environment setup
├── copilot-instructions.md      # Copilot config (critical rules + links to instructions/)
├── pull_request_template.md     # PR template with Linear ticket, testing, version checklists
└── REFACTORING-SUMMARY.md       # Historical: copilot-instructions refactoring log
```

## CI/CD Workflows

| Workflow | Trigger | What It Does |
|:---|:---|:---|
| `ci-cd.yml` | Every push/PR | 11-job pipeline: lint, typecheck, unit tests, integration tests, build, DB schema check, security audit, E2E (PRs only), quality gate, deploy DB, deploy Vercel |
| `version-bump.yml` | Merge to `main` | Reads branch prefix (`feature/` = minor, `fix/` = patch), bumps `package.json`, creates git tag + GitHub Release |
| `claude-code-review.yml` | PR opened/updated | Automated AI code review via Claude Code |
| `claude.yml` | `@claude` mention | Responds to Claude mentions in issues, PRs, and review comments |

## Development Standards

Quick lookup — pick the guide for your task:

| Task | Guide |
|:---|:---|
| Getting started | `instructions/DEVELOPMENT-STANDARDS.md` |
| Building UI | `instructions/component-architecture.instructions.md` |
| Fetching data | `instructions/api-data-fetching.instructions.md` |
| Writing forms | `instructions/form-validation.instructions.md` |
| Writing tests | `instructions/testing-standards.instructions.md` |
| Error handling | `instructions/error-handling-logging.instructions.md` |
| State management | `instructions/state-management.instructions.md` |
| Git & commits | `instructions/git-workflow.instructions.md` |
| Naming things | `instructions/naming-conventions.instructions.md` |
| Performance | `instructions/performance-optimization.instructions.md` |
| Deploying | `deployment/DEPLOYMENT_SETUP.md` |

## Copilot Agents

11 agents in `agents/` for use in GitHub Copilot conversations:

| Agent | Purpose |
|:---|:---|
| `@backend-architect` | Backend systems & API design |
| `@frontend-architect` | UI & responsive design |
| `@system-architect` | System design & scalability |
| `@tech-stack-researcher` | Technology decisions |
| `@requirements-analyst` | Specification & planning |
| `@refactoring-expert` | Code cleanup & simplification |
| `@performance-engineer` | Performance optimization |
| `@security-engineer` | Security & vulnerability assessment |
| `@technical-writer` | Documentation |
| `@learning-guide` | Concept explanation |
| `@deep-research-agent` | Research & best practices |

## PR Template

`pull_request_template.md` auto-populates every PR with checklists for:
- Linear ticket linking (`Closes STRUM-XXX`)
- Type of change, testing evidence, version bump
- Database changes, deployment notes
- Code quality (size limits, mobile-first, dark mode)

---

Last Updated: February 27, 2026
