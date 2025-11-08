# 2025-11-07 – Convert Settings page to Server Component

## Scope

Convert `app/dashboard/settings/page.tsx` to a Server Component and delegate interactivity to a client component.

## Tasks

- ✅ Extract client settings component into `components/settings/SettingsPageClient.tsx`
- ✅ Implement server page wrapper in `app/dashboard/settings/page.tsx` using `getUserWithRolesSSR()` and `redirect()`
- ✅ Mark interactive settings files with `"use client"`
- ✅ Add TODOs for future DB persistence and server hydration
- [-] Quality checks: Ran `npm run quality` – unrelated auth tests failing in current branch; no direct errors from the settings page refactor observed.

## Files Changed

- app/dashboard/settings/page.tsx – server wrapper + SSR redirect
- components/settings/SettingsPageClient.tsx – new client component (previous page logic)
- components/settings/SettingsComponents.tsx – add `"use client"`
- components/settings/SettingsSections.tsx – add `"use client"`

## Notes

- Current settings persist in `localStorage` via `useSettings()`. When a DB table (e.g., `user_settings`) is introduced, hydrate initial settings in the server page and pass to the client component as props.
- Kept a client-side redirect as a safety net if auth context is empty, but primary redirect is now SSR.

## Next Actions

- [ ] Design `user_settings` table and Supabase CRUD handlers
- [ ] Hydrate initial settings in server component and pass as prop
- [ ] Add tests for server redirect behavior (unauthenticated → `/sign-in`)
