# Guitar CRM - Copilot Instructions

## 🚨 CRITICAL RULES 🚨

### 1. Middleware

- **USE `middleware.ts`**: We use standard Next.js `middleware.ts` for authentication and routing protection.
- **DO NOT USE `proxy.ts`**: The previous `proxy.ts` pattern has been deprecated in favor of standard middleware.

### 2. UI Components

- **ALWAYS CHECK SHADCN/UI FIRST**: Before creating new UI components, ALWAYS check if they exist in shadcn/ui (https://ui.shadcn.com/docs/components).
- **USE SHADCN CLI**: Install shadcn components using `npx shadcn@latest add [component-name]`.
- **DO NOT RECREATE**: Never manually recreate components that are available in shadcn/ui.
- **EXTEND, DON'T REPLACE**: If you need custom behavior, extend the shadcn component rather than building from scratch.

## Project Standards

Please refer to the `.github/instructions/` directory for detailed development standards:

- `api-data-fetching.instructions.md`
- `component-architecture.instructions.md`
- `error-handling-logging.instructions.md`
- `form-validation.instructions.md`
- `git-workflow.instructions.md`
- `naming-conventions.instructions.md`
- `performance-optimization.instructions.md`
- `state-management.instructions.md`
- `testing-standards.instructions.md`
