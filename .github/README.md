# .github Configuration & Standards

Centralized hub for Guitar CRM development standards, Copilot configuration, and deployment setup.

## 📁 Folder Structure

```
.github/
├── copilot-instructions.md      ← PRIMARY: Copilot AI configuration
├── workflows/                   ← GitHub Actions CI/CD
├── instructions/                ← Development standards & guides
│   ├── DEVELOPMENT-STANDARDS.md
│   ├── STANDARDS-INDEX.md
│   ├── component-architecture.instructions.md
│   ├── api-data-fetching.instructions.md
│   ├── error-handling-logging.instructions.md
│   ├── form-validation.instructions.md
│   ├── state-management.instructions.md
│   ├── testing-standards.instructions.md
│   ├── git-workflow.instructions.md
│   ├── naming-conventions.instructions.md
│   └── performance-optimization.instructions.md
├── deployment/                  ← Deployment & infrastructure
│   └── DEPLOYMENT_SETUP.md
└── README.md                    ← This file
```

## 🎯 Quick Start

### New to the project?
1. Start with `instructions/DEVELOPMENT-STANDARDS.md` (5 min overview)
2. Use `instructions/STANDARDS-INDEX.md` to find topic-specific guides
3. Reference `copilot-instructions.md` for Copilot AI agents

### Need a specific standard?
Use the quick lookup table in `instructions/STANDARDS-INDEX.md`:
- Building UI? → `component-architecture.instructions.md`
- Fetching data? → `api-data-fetching.instructions.md`
- Writing tests? → `testing-standards.instructions.md`
- Committing code? → `git-workflow.instructions.md`
- Debugging errors? → `error-handling-logging.instructions.md`

### Deploying to production?
See `deployment/DEPLOYMENT_SETUP.md`

## 📋 File Descriptions

### Main Configuration

**`copilot-instructions.md`** (1167 lines)
- Master Copilot AI configuration
- Project overview & architecture
- Development workflows (TDD, quality checks)
- Component & schema patterns
- 11 specialized AI agents for development
- **Status**: Copilot reads this automatically

### Development Standards

**`instructions/DEVELOPMENT-STANDARDS.md`**
- Foundation standards overview
- Complete navigation guide
- Decision trees for common tasks
- Links to all 10 specialized guides

**`instructions/STANDARDS-INDEX.md`**
- Quick reference table of all guides
- Read time estimates per topic
- Task-based workflow examples
- Total curriculum: ~2 hours

**`instructions/component-architecture.instructions.md`**
- React component structure patterns
- Small components policy
- Component organization (List/Form/Detail)
- Examples and best practices

**`instructions/api-data-fetching.instructions.md`**
- Supabase integration patterns
- TanStack Query setup & usage
- Data fetching strategies
- Caching & invalidation

**`instructions/error-handling-logging.instructions.md`**
- Error handling patterns
- Logging strategies
- Production debugging
- Error boundaries

**`instructions/form-validation.instructions.md`**
- Form building patterns
- Zod schema validation
- Form state management
- Complex form handling

**`instructions/state-management.instructions.md`**
- Application state patterns
- Context API usage
- Side effects & hooks
- Shared state strategies

**`instructions/testing-standards.instructions.md`**
- TDD workflow
- Jest configuration
- Testing pyramid (70/20/10)
- Test examples and patterns

**`instructions/git-workflow.instructions.md`**
- Branch naming conventions
- Conventional Commits format
- PR workflow
- Commit message structure

**`instructions/naming-conventions.instructions.md`**
- File naming standards
- Variable/function naming
- Component naming
- Database entity naming

**`instructions/performance-optimization.instructions.md`**
- Mobile-first approach
- Core Web Vitals optimization
- Bundle optimization
- Database query performance

### Deployment

**`deployment/DEPLOYMENT_SETUP.md`**
- Infrastructure setup
- Environment configuration
- Deployment procedures
- Monitoring & rollback

### CI/CD

**`workflows/`** folder
- GitHub Actions workflows
- Automated testing & deployment
- See `workflows/README.md` for details

## 🤖 AI Agents Available

Your Copilot configuration includes 11 specialized AI agents for different development tasks:

### Architecture & Planning
- `@backend-architect` - Backend systems & APIs
- `@frontend-architect` - UI & responsive design
- `@system-architect` - System design & scalability
- `@tech-stack-researcher` - Technology decisions
- `@requirements-analyst` - Specification & planning

### Code Quality
- `@refactoring-expert` - Code cleanup & simplification
- `@performance-engineer` - Performance optimization
- `@security-engineer` - Security & vulnerability assessment

### Documentation
- `@technical-writer` - Documentation creation
- `@learning-guide` - Concept explanation
- `@deep-research-agent` - Research & best practices

**Usage**: Mention agents in Copilot conversations (e.g., `@backend-architect design the API`)

## 📚 Learning Paths

### For New Developers

1. `instructions/DEVELOPMENT-STANDARDS.md` (5 min)
2. `instructions/component-architecture.instructions.md` (15 min)
3. `instructions/testing-standards.instructions.md` (15 min)
4. `instructions/git-workflow.instructions.md` (10 min)
5. Project codebase exploration (2-3 hours)

**Total**: ~3.5 hours onboarding

### For Feature Development

1. `instructions/DEVELOPMENT-STANDARDS.md` - Quick overview
2. Select guides based on task:
   - UI building: `component-architecture` + `form-validation`
   - Data work: `api-data-fetching` + `state-management`
   - Testing: `testing-standards`
3. Use Copilot with relevant agents (`@backend-architect`, etc.)
4. Reference `instructions/git-workflow.instructions.md` before committing

### For Debugging Production Issues

1. `instructions/error-handling-logging.instructions.md`
2. Check Sentry/logs for error context
3. Use Copilot: `@security-engineer` (if security), `@performance-engineer` (if slow)
4. Trace through relevant code sections

## 🔍 Searching for Guidance

### By Development Task

| Task | Guide(s) | AI Agent |
|------|---------|----------|
| Build UI component | component-architecture | @frontend-architect |
| Create form | form-validation | @frontend-architect |
| Fetch from Supabase | api-data-fetching | @backend-architect |
| Write tests | testing-standards | N/A |
| Commit code | git-workflow | N/A |
| Debug error | error-handling-logging | @security-engineer |
| Optimize performance | performance-optimization | @performance-engineer |
| Design API | copilot-instructions | @backend-architect |
| Plan feature | copilot-instructions | @requirements-analyst |

## 🚀 Workflow Integration

### Before Starting a Feature
```bash
# Read relevant guides from instructions/
# Use Copilot agents for planning: @requirements-analyst, @tech-stack-researcher
# Check component patterns: instructions/component-architecture.instructions.md
```

### During Development
```bash
# Reference appropriate standards from instructions/ folder
# Use Copilot agents for implementation guidance
# Follow testing standards: instructions/testing-standards.instructions.md
# Test mobile-first: instructions/performance-optimization.instructions.md
```

### Before Committing
```bash
# Check git workflow: instructions/git-workflow.instructions.md
# Run npm run quality (includes linting, types, tests)
# Use conventional commit format from instructions/git-workflow.instructions.md
```

### Deploying
```bash
# Review deployment/DEPLOYMENT_SETUP.md
# Follow environment setup procedures
# Verify all CI checks pass in workflows/
```

## 📖 Navigation Map

**Looking for X? Go here:**

- Component patterns → `instructions/component-architecture.instructions.md`
- Data fetching → `instructions/api-data-fetching.instructions.md`
- Error handling → `instructions/error-handling-logging.instructions.md`
- Forms → `instructions/form-validation.instructions.md`
- State management → `instructions/state-management.instructions.md`
- Testing → `instructions/testing-standards.instructions.md`
- Git/commits → `instructions/git-workflow.instructions.md`
- Naming → `instructions/naming-conventions.instructions.md`
- Performance → `instructions/performance-optimization.instructions.md`
- Deployment → `deployment/DEPLOYMENT_SETUP.md`
- Copilot AI agents → `copilot-instructions.md`
- All CI/CD → `workflows/README.md`

## 💡 Tips

1. **Bookmark `instructions/STANDARDS-INDEX.md`** - Quick reference for all topics
2. **Use Copilot agents** - They're specialized and fast for planning/design
3. **Read standards before starting** - Prevents rework and ensures consistency
4. **Keep standards updated** - When you discover something new, add it here
5. **Link to specific sections** - Use markdown anchors when referencing guides

## 🔄 Maintenance

Standards are maintained as part of development. When you:
- Discover a better pattern → Update relevant guide
- Complete a complex task → Document the approach
- Fix a production bug → Add lessons learned to error-handling guide
- Optimize something → Document in performance guide

## Questions?

- **Getting oriented?** Start with `instructions/DEVELOPMENT-STANDARDS.md`
- **Need quick reference?** Check `instructions/STANDARDS-INDEX.md`
- **Want AI help?** Use appropriate agent from `copilot-instructions.md`
- **Deploying?** See `deployment/DEPLOYMENT_SETUP.md`

---

**Last Updated**: November 12, 2025  
**Version**: 2.0 (Reorganized with subdirectories)
