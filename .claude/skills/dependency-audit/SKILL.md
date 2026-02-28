---
name: dependency-audit
description: Comprehensive npm dependency health audit covering security vulnerabilities, outdated packages, unused dependencies, license compliance, and bundle size impact. Use when reviewing dependency health, preparing for upgrades, or investigating bundle size issues.
---

# Dependency Audit

## Overview

Audit Strummy's npm dependencies beyond what `npm audit` provides. Produces a health report card with scores across five categories: Security, Freshness, Usage, Licensing, and Bundle Size. Outputs actionable upgrade commands and identifies risk areas.

## When to Use

- Before a major version upgrade (Next.js, React, Supabase)
- When CI `npm audit` shows warnings (currently `continue-on-error: true`)
- When investigating slow builds or large bundle sizes
- During sprint cleanup or quarterly maintenance
- Before adding a new dependency (evaluate alternatives)

## Usage

Invoke by asking Claude to run a dependency audit:

```
Run a dependency audit on this project
```

Or target a specific category:

```
Check for unused dependencies
Audit bundle size of our dependencies
Check dependency licenses for GPL conflicts
```

## Implementation

Execute these five phases sequentially. Print a header and score for each phase. Combine into a final report card at the end.

---

### Phase 1: Security Audit

Run `npm audit` and parse the structured output.

```bash
npm audit --json 2>/dev/null
```

**Parse the JSON output and categorize:**

| Severity | Action |
|----------|--------|
| Critical | BLOCK -- must fix immediately |
| High | WARN -- fix before next release |
| Moderate | INFO -- fix when convenient |
| Low | LOG -- track for awareness |

**For each vulnerability, provide:**
- Package name and affected version
- Vulnerability description (CVE if available)
- Fix command: `npm audit fix` or specific `npm install package@version`
- Whether the fix requires a major version bump (breaking change)

**Score calculation:**
- 100: No vulnerabilities
- 90: Low-only vulnerabilities
- 70: Moderate vulnerabilities present
- 50: High vulnerabilities present
- 0: Critical vulnerabilities present

---

### Phase 2: Outdated Packages

Run `npm outdated` and categorize updates by risk level.

```bash
npm outdated --json 2>/dev/null
```

**Categorize each outdated package:**

| Update Type | Risk | Action |
|-------------|------|--------|
| Patch (1.0.0 -> 1.0.1) | Low | Safe to update: `npm update` |
| Minor (1.0.0 -> 1.1.0) | Medium | Review changelog, usually safe |
| Major (1.0.0 -> 2.0.0) | High | Review breaking changes, test thoroughly |

**Highlight Strummy's critical dependencies:**
- `next` (currently ^16.1.6) -- check for App Router changes
- `react` / `react-dom` (currently 19.2.4) -- check for API deprecations
- `@supabase/supabase-js` (currently ^2.97.0) -- check for client API changes
- `@tanstack/react-query` (currently ^5.90.21) -- check for hook API changes
- `zod` (currently ^4.3.6) -- check for schema API changes
- `tailwindcss` (currently ^4) -- check for utility class changes
- `@playwright/test` (currently ^1.58.2) -- check for test API changes

**For major updates, provide:**
- Link to changelog: `https://github.com/{org}/{repo}/releases`
- Known breaking changes
- Migration effort estimate (small/medium/large)

**Score calculation:**
- 100: All packages up to date
- 90: Only patch updates available
- 70: Minor updates available
- 50: 1-3 major updates available
- 30: 4+ major updates available

---

### Phase 3: Unused Dependencies

Scan for dependencies that are imported nowhere in the codebase.

```bash
npx depcheck --json 2>/dev/null
```

If `depcheck` is not available, perform manual scanning:

```bash
# For each dependency in package.json, search for imports
# Check: import/require statements, next.config.ts, tailwind config, jest config
```

**Check these import patterns:**
- `import ... from 'package-name'`
- `require('package-name')`
- Dynamic imports: `import('package-name')`
- Config file references: `next.config.ts`, `tailwind.config.ts`, `jest.config.ts`, `playwright.config.ts`
- PostCSS plugins, ESLint plugins, Babel plugins

**Categorize findings:**

| Status | Action |
|--------|--------|
| Unused dependency | Remove: `npm uninstall package-name` |
| Missing dependency | Add: `npm install package-name` |
| Dev dependency in production | Move: uninstall and reinstall with `--save-dev` |
| Production dependency unused at runtime | Move to devDependencies |

**Known exceptions (do NOT flag as unused):**
- `@tailwindcss/postcss` -- used via PostCSS config
- `tw-animate-css` -- used via CSS imports
- `ts-node` -- used by Jest/TypeScript configs
- `eslint-config-next` -- used by ESLint config
- `husky` -- used by git hooks
- `nodemon` -- used by dev script
- `dotenv` -- used by config files

**Score calculation:**
- 100: No unused dependencies
- 90: 1-2 unused dependencies
- 70: 3-5 unused dependencies
- 50: 6+ unused dependencies

---

### Phase 4: License Compliance

Check that all dependency licenses are compatible with Strummy's private/proprietary use.

```bash
npx license-checker --json --production 2>/dev/null
```

If `license-checker` is not available, check individual packages:

```bash
npm info <package-name> license
```

**License compatibility matrix:**

| License | Status | Notes |
|---------|--------|-------|
| MIT | OK | Permissive, no concerns |
| ISC | OK | Permissive, no concerns |
| Apache-2.0 | OK | Permissive, note patent clause |
| BSD-2-Clause | OK | Permissive |
| BSD-3-Clause | OK | Permissive |
| 0BSD | OK | Public domain equivalent |
| CC0-1.0 | OK | Public domain |
| Unlicense | OK | Public domain |
| GPL-2.0 | BLOCK | Copyleft -- incompatible with private project |
| GPL-3.0 | BLOCK | Copyleft -- incompatible with private project |
| AGPL-3.0 | BLOCK | Network copyleft -- most restrictive |
| LGPL-2.1 | WARN | Copyleft for library modifications |
| LGPL-3.0 | WARN | Copyleft for library modifications |
| UNKNOWN | WARN | Investigate manually |

**Score calculation:**
- 100: All licenses permissive (MIT/ISC/Apache/BSD)
- 80: LGPL dependencies present (acceptable but note)
- 50: Unknown licenses present
- 0: GPL/AGPL dependencies found

---

### Phase 5: Bundle Size Impact

Estimate the bundle size contribution of major dependencies.

```bash
# Check installed package sizes
du -sh node_modules/<package-name> | sort -rh | head -20
```

**For each large dependency (>1MB installed), check:**
- Whether tree-shaking is effective (ESM support)
- Whether lighter alternatives exist
- Whether the dependency is used on client-side (affects user bundle)

**Known heavy dependencies in Strummy and alternatives:**

| Package | Concern | Alternative |
|---------|---------|-------------|
| `googleapis` | Very large (~80MB), only used server-side | Verify server-only import |
| `@nivo/*` | Multiple chart packages | Consolidate if overlapping |
| `recharts` | Overlaps with Nivo charts | Pick one charting library |
| `exceljs` | Large, used for export only | Dynamic import recommended |
| `jspdf` + `jspdf-autotable` | Large, used for export only | Dynamic import recommended |
| `framer-motion` | ~1MB, used for animations | Verify tree-shaking |
| `tone` | Audio library, niche use | Verify dynamic import |
| `react-player` | Media player | Verify dynamic import |

**Verify dynamic imports for heavy client packages:**
```typescript
// Good: dynamic import (code-split)
const ExcelJS = await import('exceljs');

// Bad: top-level import (always in bundle)
import ExcelJS from 'exceljs';
```

**Score calculation:**
- 100: All heavy deps are tree-shaken or dynamically imported
- 80: 1-2 heavy deps could be optimized
- 60: 3-5 heavy deps need attention
- 40: 6+ heavy deps or duplicate functionality detected

---

## Final Report Card

Combine all phase scores into a summary:

```
==============================================
  DEPENDENCY HEALTH REPORT CARD
==============================================

  Security        92/100  [=========-]
  Freshness       70/100  [======----]
  Usage           90/100  [=========-]
  Licensing      100/100  [==========]
  Bundle Size     60/100  [=====-----]
  -------------------------------------------
  Overall Score   82/100  [========--]

==============================================

  PRIORITY ACTIONS:
  1. [CRITICAL] npm audit fix --force (2 high vulnerabilities)
  2. [HIGH] Remove unused: npm uninstall package-a package-b
  3. [MEDIUM] Update minor: npm update @tanstack/react-query
  4. [LOW] Dynamically import exceljs in export routes

  SAFE UPGRADE COMMANDS:
  npm update                          # All patch/minor updates
  npm install next@latest             # Next.js major update
  npm uninstall unused-pkg            # Remove unused
```

## Key Project Files

| File | Role |
|------|------|
| `package.json` | Dependency declarations and version ranges |
| `package-lock.json` | Locked dependency tree |
| `next.config.ts` | Next.js config (may reference packages) |
| `tailwind.config.ts` | Tailwind plugins |
| `jest.config.ts` | Test framework config |
| `jest.config.integration.ts` | Integration test config |
| `playwright.config.ts` | E2E test config |
| `tsconfig.json` | TypeScript path aliases |

## Error Handling

| Situation | Action |
|-----------|--------|
| `npm audit` returns non-zero | Parse JSON anyway -- non-zero means vulnerabilities exist |
| `depcheck` not installed | Fall back to manual `grep` scanning of import statements |
| `license-checker` not installed | Use `npm info <pkg> license` per package |
| Network error during `npm outdated` | Report partial results, note network issue |
| `node_modules` missing | Run `npm install` first, then retry |
