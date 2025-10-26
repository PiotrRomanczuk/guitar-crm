# Tests Structure

This project separates unit/integration tests (Jest + RTL) from end-to-end tests (Cypress).

- Unit/Integration tests live in this folder (`__tests__/`):

  - `components/` — React component tests (React Testing Library)
  - `schemas/` — Zod schema tests
  - `utils/` — Utility function tests
  - `setup.test.ts` — Global setup checks

- End-to-end (E2E) tests live under `cypress/e2e/` and are run with Cypress.

## Running tests

- Unit/Integration (Jest):

```bash
npm test
npm run tdd       # watch mode
npm run test:ci   # CI mode with coverage
```

- End-to-end (Cypress):

```bash
npm run e2e       # headless, starts Next.js then runs tests
npm run e2e:open  # interactive runner
npm run e2e:db    # starts Supabase + Next.js then headless Cypress
```

E2E base URL defaults to `http://localhost:3000`. Override with `CYPRESS_BASE_URL` if needed.
