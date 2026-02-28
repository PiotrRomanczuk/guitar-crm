---
name: lighthouse-runner
description: On-demand Lighthouse performance and quality audits with regression tracking across key Strummy pages. Use when checking page performance, investigating Core Web Vitals, auditing accessibility, or tracking performance regressions between releases.
---

# Lighthouse Runner

## Overview

Run Lighthouse audits against Strummy's key pages, compare results with previous baselines, and flag performance regressions. Supports both desktop and mobile device emulation, authenticated and public pages, and produces actionable optimization recommendations specific to the Next.js 16 App Router architecture.

## When to Use

- After deploying new features to check performance impact
- When investigating slow page loads or layout shifts
- Before a release to verify accessibility compliance
- When optimizing Core Web Vitals (LCP, CLS, TBT, FCP)
- To compare performance between branches or releases
- During quarterly performance reviews

## Usage

Invoke by asking Claude to run a Lighthouse audit:

```
Run Lighthouse on the dashboard page
Run a full Lighthouse audit on all key pages
Check performance regression against baseline
Run mobile Lighthouse audit on the login page
```

## Implementation

### Prerequisites

Verify the dev server is running and Lighthouse is available:

```bash
# Check dev server
curl -s --head http://localhost:3000 > /dev/null && echo "Server running" || echo "Start server: npm run dev"

# Lighthouse is already a devDependency in package.json
# Verify: npm ls lighthouse
```

Strummy has existing Lighthouse scripts in `scripts/ci/`:
- `scripts/ci/lighthouse-audit.sh` -- local audit with HTML/JSON output
- `scripts/ci/lighthouse-ci.sh` -- CI audit with threshold checks
- `scripts/ci/lighthouse-prod-audit.sh` -- production URL audit

These can be used as shortcuts, but this skill provides more granular control.

---

### Phase 1: Define Target Pages

**Default page list (public):**

| Page | URL | Auth Required |
|------|-----|---------------|
| Landing | `/` | No |
| Login | `/login` | No |
| Sign Up | `/auth/signup` | No |

**Default page list (authenticated):**

| Page | URL | Auth Required | Role |
|------|-----|---------------|------|
| Dashboard | `/dashboard` | Yes | Any |
| Students | `/dashboard/students` | Yes | Teacher/Admin |
| Lessons | `/dashboard/lessons` | Yes | Teacher/Admin |
| Songs | `/dashboard/songs` | Yes | Teacher/Admin |
| Calendar | `/dashboard/calendar` | Yes | Teacher/Admin |
| Settings | `/dashboard/settings` | Yes | Any |

Allow the user to specify a subset:

```
Run Lighthouse on /dashboard and /dashboard/students only
```

---

### Phase 2: Authentication Handling

For authenticated pages, obtain a valid session cookie before running Lighthouse.

**Option A: Cookie extraction (preferred)**

```bash
# Use curl to authenticate and extract cookies
curl -c cookies.txt -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"test123_teacher"}'

# Pass cookies to Lighthouse
lighthouse http://localhost:3000/dashboard \
  --extra-headers='{"Cookie":"'$(cat cookies.txt | grep sb- | awk '{print $6"="$7}' | tr '\n' '; ')'"}'
```

**Option B: Playwright auth state**

```bash
# If Playwright auth state exists from E2E tests
# Use the stored cookies from tests/auth-state/
```

**Option C: Skip auth pages**

If authentication setup fails, audit only public pages and note the skip:

```
Skipped authenticated pages: Could not obtain session cookie.
Run 'npm run dev' and ensure test credentials work.
```

---

### Phase 3: Run Audits

Run Lighthouse CLI for each target page in both mobile and desktop modes.

**Mobile audit (priority -- mobile-first app):**

```bash
lighthouse <URL> \
  --output=json \
  --output-path=lighthouse-reports/<page>-mobile.json \
  --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" \
  --preset=desktop \
  --emulated-form-factor=mobile \
  --throttling.cpuSlowdownMultiplier=4 \
  --quiet
```

**Desktop audit:**

```bash
lighthouse <URL> \
  --output=json \
  --output-path=lighthouse-reports/<page>-desktop.json \
  --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" \
  --preset=desktop \
  --quiet
```

**Categories to audit:**
- Performance (Core Web Vitals)
- Accessibility (WCAG compliance)
- Best Practices (security, modern APIs)
- SEO (meta tags, crawlability)

**Parse each JSON result and extract:**
- Category scores (0-100)
- Core Web Vitals: FCP, LCP, CLS, TBT, Speed Index
- Top 5 performance opportunities (with estimated savings)
- Top 5 accessibility issues (with WCAG reference)
- Diagnostics: main-thread work, JavaScript execution time, DOM size

---

### Phase 4: Regression Tracking

Compare current results with the baseline file.

**Baseline file location:** `lighthouse-reports/baseline.json`

**Save current run as baseline:**

```bash
# After a satisfactory audit, save as baseline
cp lighthouse-reports/results-summary.json lighthouse-reports/baseline.json
```

**Comparison logic:**

```
For each page and category:
  current_score - baseline_score = delta

  delta >= 0        -> OK (improved or stable)
  -5 < delta < 0    -> WARN (minor regression)
  delta <= -5       -> FAIL (significant regression, investigate)
```

**Regression report format:**

```
REGRESSION REPORT (vs baseline from 2026-02-15)
================================================

/dashboard (Mobile)
  Performance:    72 -> 65  (-7)  REGRESSION
  Accessibility:  95 -> 96  (+1)  OK
  Best Practices: 90 -> 90  ( 0)  OK
  SEO:            82 -> 80  (-2)  WARN

  Regressions detected:
  - LCP increased from 2.1s to 3.4s (+1.3s)
    Likely cause: New dashboard widgets loading synchronously
    Recommendation: Use React.lazy() for CommandCenter component
```

If no baseline exists, save the current run as baseline and note:

```
No baseline found. Current results saved as baseline.
Future runs will compare against this baseline.
```

---

### Phase 5: Next.js-Specific Recommendations

Based on audit results, provide recommendations that leverage Strummy's architecture:

**Performance optimizations for Next.js 16 App Router:**

| Issue | Recommendation |
|-------|---------------|
| Large JavaScript bundles | Use `next/dynamic` with `{ ssr: false }` for heavy client components |
| Slow LCP | Ensure above-fold content uses Server Components, not client |
| High CLS | Add explicit `width`/`height` to images, use `next/image` |
| Long TBT | Move computation to Server Components or Web Workers |
| Render-blocking resources | Use `next/font` for font loading, inline critical CSS |
| Unoptimized images | Use `next/image` with WebP, add `sizes` and `priority` props |
| No caching headers | Configure `headers()` in `next.config.ts` for static assets |
| Large DOM | Virtualize long lists with `@tanstack/react-virtual` (already installed) |

**Accessibility recommendations:**

| Issue | Recommendation |
|-------|---------------|
| Missing alt text | Add `alt` prop to all `<img>` and `next/image` components |
| Low color contrast | Check Tailwind `dark:` variants, use `text-foreground` tokens |
| Missing form labels | Use shadcn `<Label>` component with `htmlFor` |
| Missing landmarks | Use semantic HTML (`<nav>`, `<main>`, `<aside>`) in layouts |
| Missing skip link | Add skip-to-content link in root layout |

---

## Output Format

### Per-Page Summary Table

```
PAGE: /dashboard (Mobile)
================================
Category          Score   Delta   Status
Performance         72      -7   REGRESSION
Accessibility       95      +1   OK
Best Practices      90       0   OK
SEO                 82      -2   WARN

Core Web Vitals:
  FCP:  1.2s    (Good)
  LCP:  3.4s    (Needs Improvement)
  CLS:  0.05    (Good)
  TBT:  450ms   (Needs Improvement)
  SI:   2.8s    (Good)

Top Opportunities:
  1. Reduce unused JavaScript      (-340 KB, ~1.2s savings)
  2. Serve images in WebP format   (-120 KB, ~0.4s savings)
  3. Eliminate render-blocking CSS  (~0.3s savings)
```

### Aggregate Summary

```
LIGHTHOUSE AUDIT SUMMARY
=========================
Pages audited: 8
Device modes:  Mobile + Desktop
Baseline:      2026-02-15

                    Mobile Avg    Desktop Avg
Performance:           74            88
Accessibility:         93            93
Best Practices:        88            90
SEO:                   84            86

Regressions:  2 pages flagged (see details above)
Baseline saved to: lighthouse-reports/baseline.json
HTML reports:       lighthouse-reports/*.html
```

## Key Project Files

| File | Role |
|------|------|
| `package.json` | `lighthouse` in devDependencies (^13.0.3) |
| `scripts/ci/lighthouse-audit.sh` | Existing local audit script |
| `scripts/ci/lighthouse-ci.sh` | Existing CI threshold script |
| `scripts/ci/lighthouse-prod-audit.sh` | Existing production audit script |
| `lighthouse-reports/` | Output directory for reports (gitignored) |
| `next.config.ts` | Next.js config for headers, redirects |
| `app/layout.tsx` | Root layout (fonts, meta, global styles) |
| `app/dashboard/layout.tsx` | Dashboard layout (auth, sidebar) |

## Error Handling

| Situation | Action |
|-----------|--------|
| Dev server not running | Print: "Start the dev server first: `npm run dev`" |
| Chrome/Chromium not found | Run: `npx playwright install chromium` or install Chrome |
| Auth cookie extraction fails | Skip authenticated pages, audit public pages only |
| Lighthouse times out | Increase timeout, check if page has infinite loading state |
| JSON parse error | Check if Lighthouse produced valid output, retry once |
| Baseline file missing | Save current run as new baseline, note in output |
| Port 3000 occupied by non-Strummy | Check with `lsof -i :3000`, prompt user |
