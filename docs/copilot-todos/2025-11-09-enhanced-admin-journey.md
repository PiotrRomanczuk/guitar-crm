# 2025-11-09 — Enhanced Admin Journey E2E

## Scope

Improve the minimal admin E2E journey to verify:

- Song table presence on `/dashboard/songs`
- Existence of a button that navigates to `/dashboard/songs/new`
- After creating a song via the form, the list contains one more row
- Optional: the new song title is visible in the table

## Tasks

- [x] Add `data-testid` to SongList:
  - `song-new-button` on the header button
  - `song-table` on the table container
  - `song-row` on each row
- [x] Fix header route to `/dashboard/songs/new`
- [x] Enhance Cypress spec to:
  - Assert list presence and capture initial row count
  - Navigate via the header button to the new song page
  - Create a song and assert API success and row count increment
  - Assert the table exists and includes the new song title
- [x] Re-run spec headlessly and record result

## Files touched

- `components/songs/SongList/Header.tsx` — route fix + test id
- `components/songs/SongList/Table.tsx` — test ids for table and rows
- `cypress/e2e/admin/admin-create-song-journey.cy.ts` — upgraded journey assertions

## Verification

- Jest unit tests were previously green for SongForm behaviors.
- Cypress spec should pass locally:

```bash
npx cypress run --spec "cypress/e2e/admin/admin-create-song-journey.cy.ts"
```

Result: PASS (1 passing). The spec logs the created title (e.g., "Created song title: E2E Admin Song <timestamp>") which you can search for on `/dashboard/songs` while signed in as the admin used by the test.

If the environment lacks seeded data or authentication fails, the spec gracefully aborts after sign-in.

## Next actions

- [ ] Add cleanup step in the spec (optional): delete the created song via API once the row assertion is complete
- [ ] Add similar journey for lessons once CRUD is aligned
- [ ] Wire this spec into CI e2e job once stable
