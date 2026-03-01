---
name: tab-import
description: Import song data from Ultimate Guitar URLs. Single URL mode scrapes one tab and imports to database. Bulk mode logs in, accesses saved songs, and batch-imports all saved tabs with rate limiting and duplicate detection.
---

# Tab Import

## Overview

Import guitar tabs from Ultimate Guitar into the Strummy database. Two modes:

1. **Single URL mode** — Given a UG link, scrape and import one song
2. **Bulk mode** — Login to UG account, scrape all saved songs, batch-import with deduplication

## Usage

### Single URL Mode

```
/tab-import https://tabs.ultimate-guitar.com/tab/artist/song-chords-12345
```

### Bulk Mode (Import All Saved Songs)

```
/tab-import --bulk
```

The skill will prompt for your UG email and password, then:
1. Login to your account
2. Navigate to saved songs library
3. Extract all song URLs (handle pagination)
4. Batch import each song (2-3 sec delay between requests)
5. Print summary (imported, skipped, errors)

---

## Single URL Workflow

### Step 1: Scrape the Ultimate Guitar Page

Use Playwright MCP to navigate to the URL and take a snapshot:

```
mcp__playwright__browser_navigate({ url: "<UG_URL>" })
mcp__playwright__browser_snapshot()
```

**IMPORTANT**: WebFetch will NOT work (UG returns 403). You MUST use Playwright.

From the snapshot, extract:

#### Metadata (from the header area)
- **Title**: from the `<h1>` heading (strip " Chords" / " Tab" suffix)
- **Author/Artist**: from the link next to the title
- **Tuning**: from the tuning label (e.g., "E A D G B E")
- **Key**: from the key label (e.g., "Em")
- **Capo**: from the capo label (e.g., "No capo" = 0, "2nd fret" = 2)
- **Difficulty**: from the difficulty label (beginner/intermediate/advanced)
- **BPM/Tempo**: from the strumming pattern section

#### Chords list
- All chord names from the chord diagram panel

#### Strumming pattern
- From the strumming pattern section (tempo + pattern description)

#### Song content (from the `<code>` element)
The main tab content is inside a `<code>` block. It contains:
- Section headers in brackets: `[Intro]`, `[Verse 1]`, `[Chorus]`, `[Bridge]`, `[Outro]`
- Chord names as inline elements
- Lyrics as plain text between chord markers
- Tab notation as ASCII art (6-line guitar tablature)

**Parsing rules for the code block**:
1. Split content by section headers
2. For each section:
   - Extract section type and number (e.g., "Verse 2" → type: "verse", number: 2)
   - Collect all chord names in that section
   - Separate lyrics from tab notation (tab = lines starting with `e|`, `B|`, `G|`, `D|`, `A|`, `E|`)
   - Capture performance notes (e.g., "x2", "arpeggiated", "N.C.")

Close the browser when done.

### Step 2: Check if Song Exists

Query the database:

```sql
SELECT id FROM songs
WHERE (title ILIKE '%<title>%' AND author ILIKE '%<artist>%')
   OR ultimate_guitar_link = '<UG_URL>';
```

If multiple matches, show them and ask which to update (or create new).

### Step 3: Update or Create the Song

**If song exists — UPDATE** (preserve non-null data like spotify_link_url, cover_image_url):

```sql
UPDATE songs SET
  key = '<key>',
  level = '<difficulty>',
  capo_fret = <capo>,
  tempo = <bpm>,
  time_signature = <time_sig>,
  strumming_pattern = '<pattern>',
  chords = '<chord_list>',
  ultimate_guitar_link = '<UG_URL>',
  lyrics_with_chords = '<full_tab_text>',
  updated_at = now()
WHERE id = '<song_id>';
```

**If song does NOT exist — INSERT**:

```sql
INSERT INTO songs (title, author, level, key, capo_fret, tempo, time_signature,
                   strumming_pattern, chords, ultimate_guitar_link, lyrics_with_chords)
VALUES (...)
RETURNING id;
```

### Step 4: Delete Existing Sections (if updating)

```sql
DELETE FROM song_sections WHERE song_id = '<song_id>';
```

### Step 5: Insert Song Sections

For each parsed section:

```sql
INSERT INTO song_sections (song_id, section_type, section_number, order_position, chords, lyrics, tab_notation, notes)
VALUES (...)
```

**Section type mapping**:
| UG Header | section_type |
|-----------|-------------|
| `[Intro]` | `intro` |
| `[Verse]`, `[Verse 1]` | `verse` |
| `[Pre-Chorus]` | `pre-chorus` |
| `[Chorus]` | `chorus` |
| `[Bridge]` | `bridge` |
| `[Solo]` | `solo` |
| `[Interlude]` | `interlude` |
| `[Outro]` | `outro` |

**Order position**: Use gaps of 10 (10, 20, 30...).

### Step 6: Verify and Report

Run verification queries and print summary table.

---

## Bulk Import Workflow (--bulk mode)

### Step 1: Gather Credentials

Prompt user for:
- UG email address
- UG password

### Step 2: Login to Ultimate Guitar

1. **Navigate to login page**:
   ```
   mcp__playwright__browser_navigate({ url: "https://www.ultimate-guitar.com/signin" })
   ```

2. **Fill login form**:
   - Find email input (look for `type=email` or `name=email`)
   - Find password input (look for `type=password` or `name=password`)
   - Find login button (look for `type=submit` or "Sign In" text)

3. **Submit and wait for auth**:
   - Click submit button
   - Wait for redirect to dashboard (use `browser_wait_for` with timeout ~5 sec)
   - Verify logged in by checking for user profile/saved section

**Error handling**: If login fails, report error and abort.

### Step 3: Navigate to Saved Songs Library

Once authenticated, navigate to saved songs:

```
mcp__playwright__browser_navigate({ url: "https://www.ultimate-guitar.com/user/favorites/tabs" })
```

or similar (the exact URL may vary by UG's current structure — check the snapshot for the link).

### Step 4: Extract All Song URLs (with Pagination)

1. **Take snapshot** of the saved songs page
2. **Extract all song links** from the results (look for links with tab URLs like `/tab/artist/song-...`)
3. **Check for "Next" / pagination** — if present, navigate to next page and repeat
4. **Continue until all pages exhausted**

Store all URLs in a list.

**Example extraction from snapshot**:
- Look for `link` elements with `href` containing `/tab/`
- Extract `href` values
- Deduplicate (some songs may appear on multiple pages)

### Step 5: Batch Import Songs

For each song URL:

1. **Check if already in DB** (by ultimate_guitar_link):
   ```sql
   SELECT id FROM songs WHERE ultimate_guitar_link = '<url>';
   ```
   - If exists: skip (log as "skipped")
   - If not exists: proceed to import

2. **Import** (use single-URL import logic from above)

3. **Rate limiting**: Wait 2-3 seconds between imports to avoid throttling

4. **Error handling**: If import fails:
   - Log the error (url, error message)
   - Continue to next song
   - Track error count

5. **Progress**: Log progress every 5 songs:
   ```
   Importing song 15/87... (Riptide by Vance Joy)
   ```

### Step 6: Final Summary

Print batch summary:

```
Bulk import complete!

  Account:  your.email@example.com
  Source:   Ultimate Guitar Saved Songs
  Duration: 4m 32s

  Results:
    ✓ Imported:    45 songs
    → Skipped:     12 (already in database)
    ✗ Errors:      3 (network timeout x2, parse error x1)
    Total:         60 saved songs processed

  New songs added to Strummy:
    - "Riptide" by Vance Joy
    - "Jingle Bells" by Misc Christmas
    - ... (list first 5-10, say "and X more")

  Time breakdown:
    Login: 3s
    Library fetch: 2s
    Scraping: 4m 15s (2.5s per song avg)
    Import: 12s

  Tip: Run /tab-import again to sync new songs added to your UG library
```

---

## Rate Limiting

- **Between page scrapes**: 1 sec delay
- **Between song imports**: 2-3 sec delay
- **Between pagination page loads**: 2 sec delay

This prevents UG from rate-limiting or blocking the session.

---

## Parsing Tips

### Identifying tab notation vs lyrics
- Tab notation lines match pattern: `^[eEBGDAa]\|[-0-9h p/\\|x]+\|?`
- Everything else is lyrics

### Combined sections
- `[Verse 4/Outro]` → use `outro`, mention "Verse 4/Outro" in notes
- `[Pre-Chorus/Chorus]` → use `chorus`, mention combined in notes

### Chord extraction
- Chords appear as `generic` elements with text inside the `<code>` block
- Chord diagram panel at sidebar lists ALL unique chords used

### Strumming pattern inference
- 3 beats grouped = time_signature 3 (3/4 time)
- 4 beats grouped = time_signature 4 (4/4 time)
- Default to 4 if unclear

---

## Error Handling

| Situation | Action |
|-----------|--------|
| Invalid UG URL | Report error, suggest checking URL |
| Login fails | Report auth error, ask to verify credentials |
| Page requires premium | Report "premium tab", suggest free version |
| Saved songs empty | Inform user, complete with 0 imports |
| Network timeout | Retry once, then skip song + log error |
| Parse error (no sections) | Still update metadata, warn about missing sections |
| Rate limit (429 response) | Backoff: wait 5 sec, then continue |
| Session expires during bulk | Re-login and continue from next song |

---

## Examples

### Single URL
```
/tab-import https://tabs.ultimate-guitar.com/tab/r-e-m-/everybody-hurts-chords-37519
/tab-import https://tabs.ultimate-guitar.com/tab/vance-joy/riptide-chords-1237247
```

### Bulk
```
/tab-import --bulk
> Enter UG email: you@example.com
> Enter UG password: ••••••••
> Logging in...
> ✓ Authenticated
> Fetching saved songs... (found 60 songs)
> Importing... (progress shown every 5 songs)
> Done! 45 imported, 12 skipped, 3 errors
```

---

## Database Tables

- **`songs`**: Song metadata (title, author, key, tempo, chords, etc.)
- **`song_sections`**: Per-section structured data (type, chords[], lyrics, tab_notation)

## Key Constraints

- `song_sections.section_type` must be one of: `intro`, `verse`, `pre-chorus`, `chorus`, `bridge`, `solo`, `interlude`, `outro`
- `song_sections.chords` is a `text[]` array
- `song_sections.song_id` has CASCADE delete
- RLS policies on `song_sections` mirror `songs`

---

## Implementation Notes

### Session Management
- Keep Playwright browser open across all imports in bulk mode
- Don't close until all songs processed or error occurs
- Reuse authenticated session to avoid re-login

### Deduplication Strategy
- Check `ultimate_guitar_link` to detect existing songs
- If song exists: compare timestamps, update if UG version is newer (check "Last update" on UG page)
- Log action for user visibility

### Progress Tracking
- Count: imported, skipped, errors
- Time spent on each phase
- Print ETA based on rate (songs per second)

### Logging
For bulk imports, maintain a log of:
- Song title, artist, URL
- Action taken (imported/skipped/error)
- Timestamp
- Error details (if applicable)

---

## Future Enhancements

- **Resume capability**: If bulk import fails midway, allow resume from song N
- **Selective import**: Let user filter by difficulty, key, or artist before import
- **Update existing**: Option to re-scrape and update existing songs (compare timestamps)
- **Export to PDF**: Generate a "Song Library" PDF after import showing all imported titles
- **Spotify integration**: Auto-fetch cover art and Spotify links for new songs
