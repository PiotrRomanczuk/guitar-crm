# Guitar CRM Development Standards - Master Guide

**Version**: 1.0  
**Last Updated**: October 26, 2025  
**Status**: Foundation Standards Established

---

## 📋 Overview

This is your complete development standards reference for Guitar CRM. All standards were established through systematic Q&A discovery process (26 questions) to capture your project's vision and best practices.

**10 Instruction Files** cover all aspects of development:

1. **Component Architecture** - How to structure UI
2. **API & Data Fetching** - How to get and manage data
3. **Error Handling & Logging** - How to handle problems
4. **Form & Validation** - How to build forms
5. **State Management** - How to manage application state
6. **Testing Standards** - How to test code (70/20/10 pyramid)
7. **Git Workflow** - How to commit and collaborate
8. **Naming Conventions** - How to name everything
9. **Performance & Mobile** - How to optimize for speed
10. **This Master Guide** - How to navigate all standards

---

## 🎯 Quick Decision Tree

When starting a task, use this to find the right guide:

### "I'm building a new component/UI feature"

→ **Component Architecture**

- Small components policy
- File organization
- When to extract sub-components

### "I need to fetch data from Supabase"

→ **API & Data Fetching**

- Server vs Client components
- Real-time subscriptions
- Cache invalidation
- Error handling

### "I need to create a form"

→ **Form & Validation**

- Blur + submit validation
- Error display
- Zod schemas
- Testing forms

### "Something went wrong in production"

→ **Error Handling & Logging**

- Error boundaries
- Structured errors
- Sentry monitoring
- User-friendly messages

### "I need to manage state across components"

→ **State Management**

- Server state priority
- Context for page-level
- Real-time subscriptions
- No Redux complexity

### "I'm writing tests"

→ **Testing Standards**

- 70% unit / 20% integration / 10% E2E pyramid
- Schema testing patterns
- Component testing
- Mocking strategies

### "I'm committing code"

→ **Git Workflow**

- Conventional Commits format
- Branch naming
- Deprecation period approach
- Atomic commits

### "I need to name something"

→ **Naming Conventions**

- PascalCase for components/types
- camelCase for everything else
- Function naming patterns
- Boolean prefixes (is/has/can)

### "App is slow / Battery draining"

→ **Performance & Mobile**

- Core Web Vitals targets
- Image optimization
- Code splitting
- Mobile considerations

---

## 📊 Standards Summary Table

| Area              | Standard                                             | Key Principle                         |
| ----------------- | ---------------------------------------------------- | ------------------------------------- |
| **Components**    | Small, focused, composable                           | One responsibility per file           |
| **Data Fetching** | Hybrid (server + client)                             | Server-first, real-time for critical  |
| **State**         | Server → Client → Context                            | Avoid prop drilling beyond 2-3 levels |
| **Validation**    | Zod everywhere                                       | Runtime validation at boundaries      |
| **Forms**         | Blur + submit validation                             | Hybrid for UX balance                 |
| **Testing**       | 70/20/10 pyramid                                     | Unit > Integration > E2E              |
| **Commits**       | Conventional Commits                                 | Atomic changes, clear messages        |
| **Naming**        | PascalCase (components), camelCase (everything else) | Type-safe naming                      |
| **Errors**        | Structured AppError objects                          | Machine-readable + user-friendly      |
| **Performance**   | Mobile-first, Lighthouse > 85                        | < 2.5s LCP, < 0.1 CLS                 |

---

## 🔄 Development Workflow

### Starting a New Feature

```
1. Create feature branch (git-workflow)
2. Write tests first (testing-standards)
3. Name files correctly (naming-conventions)
4. Build component (component-architecture)
5. Add forms/validation if needed (form-validation)
6. Fetch data if needed (api-data-fetching)
7. Handle errors (error-handling-logging)
8. Optimize performance (performance-optimization)
9. Commit with conventional format (git-workflow)
10. Create PR, get review
11. Merge with clean history
```

### Quality Checklist Before Committing

```bash
npm run quality  # Runs:
  ├─ ESLint (code quality)
  ├─ TypeScript compiler (type safety)
  ├─ Jest tests (coverage 70%+)
  └─ TODO checker (no forgotten tasks)
```

---

## 📚 File Reference

| Guide                                      | Read For                    |
| ------------------------------------------ | --------------------------- |
| `component-architecture.instructions.md`   | Building UI components      |
| `api-data-fetching.instructions.md`        | Working with data           |
| `error-handling-logging.instructions.md`   | Error handling & monitoring |
| `form-validation.instructions.md`          | Building forms              |
| `state-management.instructions.md`         | Managing application state  |
| `testing-standards.instructions.md`        | Writing tests               |
| `git-workflow.instructions.md`             | Committing & collaborating  |
| `naming-conventions.instructions.md`       | Naming code consistently    |
| `performance-optimization.instructions.md` | Speed & mobile              |

---

## 🎨 Core Patterns at a Glance

### Component Structure

```
components/lessons/StudentLesson/
├── index.ts                 # Re-exports
├── StudentLesson.tsx        # Main component
├── StudentLesson.Item.tsx   # Sub-component
├── useStudentLesson.ts      # Hook
└── studentLesson.helpers.ts # Utilities
```

### Data Flow

```
Supabase (truth)
    ↓
Server Component (fetch)
    ↓
Client Component (interact)
    ↓
Hooks (subscribe to real-time if critical)
```

### Error Flow

```
Try operation → Error occurs
    ↓
Catch & createAppError()
    ↓
Log to Sentry
    ↓
Throw to error boundary
    ↓
Display user-friendly message
```

### Form Validation

```
User types → onChange (update state)
User leaves field → onBlur (validate field)
User submits → Validate all, submit
Error? → Show message. User fixes? → Clear error
```

### Testing Pyramid

```
        E2E (10%) - Critical flows
      Integration (20%) - Workflows
    Unit (70%) - Logic, schemas, utils
```

---

## 🚀 Your Development Standards (Discovered)

### Architecture & Design

- ✅ Feature folders with co-located hooks/helpers
- ✅ Hybrid data fetching (Server Component + Client refinement)
- ✅ Real-time subscriptions for critical data (lesson updates)
- ✅ Server state first, avoid storing in React when possible

### Code Quality

- ✅ Conventional Commits (feat/fix/refactor/etc)
- ✅ PascalCase components, camelCase utilities
- ✅ No prop drilling (use Context or refactor)
- ✅ Mobile-first Tailwind CSS

### Validation & Safety

- ✅ Zod validation at API boundaries
- ✅ TypeScript strict mode
- ✅ Blur + submit form validation
- ✅ Structured error objects with types

### Testing

- ✅ 70% unit / 20% integration / 10% E2E pyramid
- ✅ Test-driven development (TDD)
- ✅ 70% coverage threshold
- ✅ Critical flows tested

### Monitoring

- ✅ Sentry for error tracking & performance
- ✅ Lighthouse > 85 score
- ✅ Core Web Vitals: LCP < 2.5s, CLS < 0.1
- ✅ No console.log in production

### UX

- ✅ Skeleton screens during loading
- ✅ WCAG 2.1 Level AA accessibility
- ✅ Dark mode enabled by default
- ✅ Feature flags for all features

---

## 🔐 Rules to Live By

1. **Mobile-first always** - Default styles for mobile, scale up with `sm:`, `md:`
2. **Server components by default** - Only use `'use client'` when necessary
3. **Validate at boundaries** - Zod schema validation on API input/output
4. **Error first** - Handle errors explicitly, log to Sentry
5. **Test first** - TDD: write tests before implementation
6. **Type everything** - TypeScript strict mode + Zod = confidence
7. **Keep components small** - Max 200 LOC per file
8. **Atomic commits** - One logical change per commit
9. **Real-time for critical** - Supabase subscriptions for lesson updates
10. **Performance matters** - Lighthouse > 85, LCP < 2.5s

---

## 🎓 Onboarding Checklist for New Developers

```
Getting Started:
- [ ] Read this master guide
- [ ] Skim all 9 instruction files (10 min each)
- [ ] Run `npm run setup` and `npm run dev`
- [ ] Create first feature branch with `npm run new-feature my-feature`
- [ ] Look at existing components in `components/`
- [ ] Check out schema examples in `schemas/`

First PR:
- [ ] Start with small component or schema
- [ ] Write tests first (TDD)
- [ ] Run `npm run quality` before pushing
- [ ] Use Conventional Commits format
- [ ] Request review from maintainer
- [ ] Address feedback
- [ ] Merge with squash & merge strategy

Common Workflows:
- [ ] New component: See Component Architecture
- [ ] Fetch data: See API & Data Fetching
- [ ] Build form: See Form & Validation
- [ ] Debug production: See Error Handling & Logging
- [ ] Slow page: See Performance & Mobile
```

---

## 📞 When In Doubt

1. **Check existing patterns** - Look at similar components/schemas
2. **Run `npm run quality`** - Catches most issues automatically
3. **Read relevant instruction file** - Use decision tree above
4. **Ask maintainer** - This is a learning opportunity

---

## 🗓️ Version History

| Version | Date         | Changes                                         |
| ------- | ------------ | ----------------------------------------------- |
| 1.0     | Oct 26, 2025 | Initial standards established via Q&A discovery |

---

## 📖 How to Use This Guide

### For Quick Reference

Use the **Decision Tree** (search for your scenario) to jump to the right guide.

### For Deep Dives

Read the full instruction file for comprehensive patterns and examples.

### For Examples

Each instruction file has code examples you can copy-paste.

### For Enforcement

- ESLint enforces naming, formatting, file size limits
- Jest enforces coverage (70%)
- Pre-commit hooks enforce quality checks
- Code review enforces conventions

---

## 🚢 Before Deployment

Checklist:

- [ ] All tests passing (`npm test`)
- [ ] Coverage >= 70% (`npm test -- --coverage`)
- [ ] Lighthouse > 85 (`npm run lighthouse-audit`)
- [ ] No console.log in production
- [ ] Errors logged to Sentry
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] All TODOs resolved
- [ ] Code reviewed by another developer

Run:

```bash
npm run deploy:check  # Runs all validation
```

---

## 🎯 Your Project's North Star

Guitar CRM is a **professional-grade, test-driven, mobile-first application** for guitar teachers to manage students, lessons, and progress. Every decision in these standards supports that mission:

- **Mobile-first** because teachers use on phones during lessons
- **Real-time updates** because students need live feedback
- **Type-safe** because data corruption is unacceptable
- **Test-driven** because bugs ruin the teaching experience
- **Error handling** because production issues damage trust
- **Performance** because slow apps lose users

These standards aren't restrictions—they're guardrails protecting your product quality.

---

## 📈 Next Steps

1. **Share these standards** with your team
2. **Set up pre-commit hooks** to enforce them automatically
3. **Use decision tree** when starting new features
4. **Reference guides** when unsure
5. **Iterate** - These standards can evolve as project grows

---

## 🎉 You're Ready!

You now have a complete, cohesive set of development standards. Everything is documented, examples are provided, and tooling is configured to enforce them.

**Start building!**

---

Generated: October 26, 2025  
For: Guitar CRM Project  
Author: GitHub Copilot with Piotr Romanczuk

All standards discovered through discovery Q&A process.  
10 comprehensive instruction files cover all development scenarios.
