# Guitar CRM Development Standards - Quick Index

📍 **Start here**: Read `DEVELOPMENT-STANDARDS.md` first  
🎯 **Quick lookup**: Use the table below to find what you need

---

## 📚 All Available Guides

| File                                         | Purpose                      | Best For               | Read Time |
| -------------------------------------------- | ---------------------------- | ---------------------- | --------- |
| **DEVELOPMENT-STANDARDS.md**                 | Master overview & navigation | Getting oriented       | 5 min     |
| **component-architecture.instructions.md**   | How to structure components  | Building UI            | 15 min    |
| **api-data-fetching.instructions.md**        | How to fetch & manage data   | Working with Supabase  | 20 min    |
| **error-handling-logging.instructions.md**   | How to handle errors         | Debugging production   | 15 min    |
| **form-validation.instructions.md**          | How to build forms           | Creating forms         | 20 min    |
| **state-management.instructions.md**         | How to manage state          | Complex components     | 10 min    |
| **testing-standards.instructions.md**        | How to test code             | Writing tests (TDD)    | 15 min    |
| **git-workflow.instructions.md**             | How to commit & collaborate  | Committing code        | 10 min    |
| **naming-conventions.instructions.md**       | How to name things           | Naming files/functions | 10 min    |
| **performance-optimization.instructions.md** | How to optimize speed        | Mobile, performance    | 15 min    |

**Total Reading**: ~2 hours to fully understand all standards

---

## 🚀 Quick Start by Task

### "I'm starting a new feature"

1. Read: **DEVELOPMENT-STANDARDS.md** (5 min) - Get overview
2. Create branch: `feature/my-feature` (**git-workflow**)
3. Write tests first (**testing-standards**)
4. If building UI: **component-architecture** → **form-validation** (if forms)
5. If fetching data: **api-data-fetching** → **state-management**
6. Commit: **git-workflow** (Conventional Commits)
7. Before push: `npm run quality`

### "I need to debug a production error"

1. Check error in Sentry
2. Read: **error-handling-logging** (15 min)
3. Check error boundary in app/error.tsx
4. Trace back through:
   - API data flow (**api-data-fetching**)
   - Component that errored (**component-architecture**)
   - Related logic (**state-management**)

### "The app feels slow"

1. Read: **performance-optimization** (15 min)
2. Run: `npm run lighthouse-audit`
3. Look for:
   - Large images → Use Next.js Image component
   - Big bundle → Code splitting, dynamic imports
   - Slow queries → Reduce columns, paginate
   - Too many renders → Check state management

### "I'm stuck on naming something"

→ **naming-conventions** (10 min) - Complete reference

### "I need to commit my code"

→ **git-workflow** (10 min) - Conventional Commits format

### "My component is getting too big"

→ **component-architecture** (15 min) - Decomposition patterns

### "I need to create a form"

→ **form-validation** (20 min) - Complete form guide + testing

### "I'm new to the project"

1. **DEVELOPMENT-STANDARDS.md** (5 min)
2. Skim each guide (5 min each)
3. Create first feature, reference guides as needed

---

## 🎯 Decision Tree - Find Your Answer Fast

<details>
<summary><strong>Building Component/UI?</strong></summary>

- How big can my file be? → component-architecture
- How do I split components? → component-architecture
- How do I name files? → naming-conventions
- How do I style with Tailwind? → component-architecture (mobile-first section)
- How do I make it accessible? → component-architecture
- How do I test it? → testing-standards

</details>

<details>
<summary><strong>Working with Data?</strong></summary>

- Where should I fetch data? → api-data-fetching (server vs client)
- How do I validate data? → api-data-fetching (schema validation)
- How do I handle errors? → error-handling-logging
- How do I keep data fresh? → api-data-fetching (cache invalidation)
- How do I subscribe to real-time updates? → api-data-fetching (subscriptions)
- How do I manage state? → state-management

</details>

<details>
<summary><strong>Building a Form?</strong></summary>

- How do I validate? → form-validation (blur + submit)
- How do I show errors? → form-validation (error display)
- How do I submit? → form-validation (submission pattern)
- How do I test? → testing-standards (form testing)
- How do I handle submission error? → error-handling-logging

</details>

<details>
<summary><strong>Managing State?</strong></summary>

- Server vs Client? → state-management (hierarchy)
- Should I use Context? → state-management (when to use)
- Real-time updates? → api-data-fetching (subscriptions)
- Avoiding prop drilling? → state-management
- How do I refetch after mutation? → api-data-fetching

</details>

<details>
<summary><strong>Writing Tests?</strong></summary>

- TDD workflow? → testing-standards (pyramid)
- Test schemas? → testing-standards (unit tests)
- Test components? → testing-standards (integration tests)
- Test forms? → testing-standards (form testing)
- E2E tests? → testing-standards (Cypress)
- How much coverage? → testing-standards (70% target)

</details>

<details>
<summary><strong>Committing Code?</strong></summary>

- Branch naming? → git-workflow
- Commit message format? → git-workflow (Conventional Commits)
- How many changes per commit? → git-workflow (atomic)
- Deprecating old code? → git-workflow
- Reverting commits? → git-workflow

</details>

<details>
<summary><strong>Performance Issues?</strong></summary>

- Images too large? → performance-optimization
- JavaScript bundle bloated? → performance-optimization
- Queries too slow? → api-data-fetching (select only needed columns)
- Mobile performance? → performance-optimization
- Lighthouse score? → performance-optimization
- Core Web Vitals? → performance-optimization

</details>

<details>
<summary><strong>Error Handling?</strong></summary>

- How to handle errors? → error-handling-logging (architecture)
- User-friendly messages? → error-handling-logging
- Error boundaries? → error-handling-logging (Next.js error.tsx)
- Logging to production? → error-handling-logging (Sentry)
- Error types? → error-handling-logging (AppError)

</details>

<details>
<summary><strong>Naming Things?</strong></summary>

- Component names? → naming-conventions
- Function names? → naming-conventions
- Variable names? → naming-conventions
- Boolean names? → naming-conventions (is/has/can)
- Constants? → naming-conventions
- Hooks? → naming-conventions (use prefix)

</details>

---

## 📖 Reading Paths by Role

### Frontend Developer (New to Project)

1. DEVELOPMENT-STANDARDS (overview)
2. component-architecture (daily use)
3. naming-conventions (daily use)
4. form-validation (when building forms)
5. api-data-fetching (when fetching data)
6. testing-standards (when writing tests)

### Backend/Full-Stack (Focusing on APIs)

1. DEVELOPMENT-STANDARDS (overview)
2. api-data-fetching (data flow)
3. error-handling-logging (production issues)
4. testing-standards (testing APIs)

### QA/Testing

1. DEVELOPMENT-STANDARDS (overview)
2. testing-standards (main reference)
3. form-validation (testing forms)
4. performance-optimization (performance testing)

### DevOps/Release

1. DEVELOPMENT-STANDARDS (overview)
2. performance-optimization (monitoring)
3. error-handling-logging (production monitoring)
4. git-workflow (release process)

---

## ✅ Checklists Quick Reference

### Pre-Commit Checklist

- [ ] `npm run quality` passes
- [ ] Tests written (TDD)
- [ ] Coverage >= 70%
- [ ] Conventional Commit format used
- [ ] No console.log in production
- [ ] Component < 200 LOC
- [ ] Mobile-first styles (dark mode included)

### Pre-Push Checklist

- [ ] Feature branch created correctly
- [ ] All commits atomic + well-named
- [ ] PR description references issue
- [ ] No conflicts with main

### Pre-Merge Checklist

- [ ] Code reviewed
- [ ] All tests passing
- [ ] Lighthouse > 85
- [ ] No breaking changes (or documented)

### Pre-Deploy Checklist

- [ ] `npm run deploy:check` passes
- [ ] All TODOs resolved
- [ ] Sentry monitoring configured
- [ ] Error boundaries tested

---

## 🔍 Find Code Examples

Each guide has examples:

| Topic              | Guide                    | Section                         |
| ------------------ | ------------------------ | ------------------------------- |
| Component patterns | component-architecture   | "Component Composition Pattern" |
| Data fetching      | api-data-fetching        | "Data Fetching Architecture"    |
| Error handling     | error-handling-logging   | "Error Boundaries"              |
| Form building      | form-validation          | "Form Component Pattern"        |
| State management   | state-management         | "Pattern 1-5"                   |
| Unit tests         | testing-standards        | "Unit Tests: Schemas"           |
| Integration tests  | testing-standards        | "Integration Tests"             |
| E2E tests          | testing-standards        | "E2E Tests"                     |
| Git workflow       | git-workflow             | "Workflow: Creating a Feature"  |
| Naming             | naming-conventions       | "File Naming" table             |
| Performance        | performance-optimization | "Common Mistakes & Fixes"       |

---

## 🎓 Learning Path for New Developers

**Week 1**: Foundation

- [ ] Day 1: Read DEVELOPMENT-STANDARDS + skim all 9 guides
- [ ] Day 2-3: Detailed read: component-architecture + naming-conventions
- [ ] Day 4-5: Detailed read: api-data-fetching + testing-standards

**Week 2**: Hands-On

- [ ] Create first component (reference component-architecture)
- [ ] Add forms (reference form-validation)
- [ ] Write tests (reference testing-standards)
- [ ] Reference guides as needed during development

**Week 3+**: Mastery

- [ ] Review code reviews feedback against standards
- [ ] Optimize performance (reference performance-optimization)
- [ ] Handle production errors (reference error-handling-logging)
- [ ] Contribute to team standards

---

## 📞 Getting Help

**"I don't know where to start"**
→ Start with DEVELOPMENT-STANDARDS.md, then use Decision Tree

**"I'm not sure what the standard is"**
→ Search the relevant guide using the table above

**"I found a bug/error"**
→ Read error-handling-logging guide

**"I want to add a feature"**
→ Follow workflow in DEVELOPMENT-STANDARDS

**"My code seems wrong but passes tests"**
→ Check if it follows naming-conventions + component-architecture

**"I think the standards could be better"**
→ Discuss with team, update standards document

---

## 📊 Quick Standards Summary

```
✅ Components: Small, focused, composable
✅ Data: Server-first, real-time for critical
✅ State: Avoid prop drilling (Context if needed)
✅ Forms: Blur + submit validation
✅ Tests: 70% unit, 20% integration, 10% E2E
✅ Commits: Conventional, atomic, clear
✅ Names: PascalCase (components), camelCase (code)
✅ Errors: Structured objects, Sentry logging
✅ Performance: Mobile-first, Lighthouse > 85
✅ Quality: ESLint + TypeScript + 70% coverage
```

---

## 🚀 TL;DR

1. **Read** DEVELOPMENT-STANDARDS.md (5 min)
2. **Reference** the guide that matches your task (use table above)
3. **Follow** the patterns and examples provided
4. **Run** `npm run quality` before committing
5. **Ask** when unsure (that's why these guides exist)

---

**Last Updated**: October 26, 2025  
**Total Documentation**: ~50,000 words across 10 guides  
**Coverage**: 100% of development workflow
