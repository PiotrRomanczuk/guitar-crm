# Song Enrichment with Ultimate Guitar Data

## Overview

`enrich_songs.js` scrapes Ultimate Guitar (UG) tab pages and enriches the `songs` table with real metadata:

- **Key** — Musical key (A, Am, C#m, etc.) mapped to valid `music_key` enum
- **Level** — Difficulty level (beginner/intermediate/advanced)
- **Capo** — Capo fret (0–20)
- **Tempo** — BPM
- **Chords** — Comma-separated chord names used in the tab
- **Lyrics with Chords** — Full tab content with inline chord annotations
- **Song Sections** — Structured sections (verse, chorus, bridge, etc.) with chord arrays and lyrics

## What Gets Updated

The script is **conservative** — it only updates default/placeholder values:

| Field | Updated If | Source |
|-------|-----------|--------|
| `key` | Currently = `'C'` (default) | `tab.tonality_name` |
| `level` | Currently = `'beginner'` (default) | `tab.difficulty` |
| `capo_fret` | Empty/null | `tab.capo` |
| `tempo` | Empty/null | `tab.bpm` |
| `chords` | Empty/null OR default empty string | `tab.applicature` keys |
| `lyrics_with_chords` | Empty/null | `tab.content` |

**Songs with real data** (non-default key/level or existing chords) are skipped to avoid overwriting hand-entered metadata.

## Database Queries

### Target Songs
```sql
SELECT COUNT(*) FROM songs
WHERE ultimate_guitar_link IS NOT NULL
AND (chords IS NULL OR chords = '');
```

### Check Enrichment Results
```sql
SELECT title, author, key, level, capo_fret, tempo,
       LEFT(chords, 50) as chords_preview,
       LEFT(lyrics_with_chords, 100) as lyrics_preview
FROM songs
WHERE ultimate_guitar_link LIKE '%ultimate-guitar.com%'
AND chords IS NOT NULL AND chords != ''
ORDER BY updated_at DESC LIMIT 20;
```

### Check Song Sections
```sql
SELECT s.title, ss.section_type, ss.section_number,
       ss.chords, LEFT(ss.lyrics, 80) as lyrics
FROM song_sections ss
JOIN songs s ON s.id = ss.song_id
ORDER BY ss.created_at DESC LIMIT 20;
```

## How to Run

### 1. Set Environment Variables

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

Get these from Supabase dashboard → Settings → API.

### 2. Run the Script

```bash
node chrome_tabs/enrich_songs.js
```

The script will:
1. Fetch all songs with UG links and missing/default chord data
2. **For each song**:
   - Navigate to the UG URL with Playwright (headless Chrome)
   - Extract JSON from the page (`window.UGAPP.store.page.data.tab`)
   - Parse key, level, capo, tempo, chords, and lyrics
   - Update the `songs` table with non-default values
   - Parse song sections from lyrics and insert into `song_sections`
3. Write results to `chrome_tabs/enrich_results.csv`

### 3. Monitor Progress

The script logs progress as it runs:

```
[1/240] Song Title by Artist
  → Scraping Ultimate Guitar...
  ✓ Enriched: Am, intermediate, 4 chords
```

### 4. Review Results

After completion, check `chrome_tabs/enrich_results.csv`:

```csv
song_id,title,author,url,status,key_scraped,level_scraped,chords_count,has_lyrics,error
uuid-123,Song Title,Artist,https://...,success,Am,intermediate,4,true,
uuid-456,Another Song,Artist,https://...,error,,,,,"Could not find UG data in page"
```

## Rate Limiting & Performance

- **Delay between scrapes**: 2.5 seconds (configurable in script)
- **Expected duration**: ~240 songs × 2.5s ≈ 10 minutes
- **Browser**: Headless Chromium (installed via Playwright)

## Troubleshooting

### "Could not find UG data in page"

UG may be using bot detection or dynamic content loading. Try:
1. Check if the URL is still valid (UG sometimes redirects/deletes tabs)
2. Increase timeout in script: change `waitUntil: 'networkidle'` to `'domcontentloaded'`
3. Run the script with a smaller batch (edit `fetchSongsToEnrich()` to add `.limit(10)`)

### "Missing environment variables"

```bash
# Verify they're set
env | grep SUPABASE
```

### Playwright Installation Issues

If Chromium isn't installed:

```bash
npx playwright install chromium
```

### Heap Memory Issues

If you see "JavaScript heap out of memory":

```bash
# Run with more memory
NODE_OPTIONS="--max-old-space-size=4096" node chrome_tabs/enrich_songs.js
```

## Data Validation Examples

### Key Mapping
- UG: `"A#"` → DB: `"Bb"` (normalized flats)
- UG: `"D#m"` → DB: `"Ebm"`
- UG: `"F#"` → DB: `"F#"` (preserved as-is)
- UG: `null` → DB: `"C"` (fallback default)

### Level Mapping
- UG: `"novice"` → DB: `"beginner"`
- UG: `"expert"` → DB: `"advanced"`
- UG: `"intermediate"` → DB: `"intermediate"`

### Section Parsing
Lyrics like:
```
[Intro]
Em Am

[Verse 1]
Em Am C
Lyric line here
```

Become:
| section_type | section_number | chords | lyrics |
|--------------|---|--------|--------|
| intro | 1 | Em, Am | |
| verse | 1 | Em, Am, C | Lyric line here |

## Next Steps After Enrichment

1. **Spot-check results** — Review `enrich_results.csv` for any errors
2. **Verify data quality** — Run the SQL queries above
3. **Fix errors** — Manually update songs that failed (see error column in CSV)
4. **Delete rows** — Remove the temporary CSV: `rm chrome_tabs/enrich_results.csv`
5. **Commit** — If results look good, commit the database state

## Technical Details

### Architecture
- **Playwright**: For headless browser scraping (avoids bot detection better than simple HTTP)
- **CSV Writer**: Results logging and progress tracking
- **Supabase JS Client**: Database reads/writes with RLS support

### Key Functions
- `normalizeKey()` — Maps UG keys to valid music_key enum
- `mapDifficulty()` — Maps UG difficulty to difficulty_level enum
- `scrapeUltimateGuitar()` — Navigates page and extracts JSON
- `parseSections()` — Parses `[Verse]`, `[Chorus]` headers from lyrics
- `extractChordsFromLine()` — Detects chord names in lyrics
- `isChordOnlyLine()` — Identifies chord-only lines (no lyrics)

### Performance Considerations
- **Playwright overhead**: ~1.5–2s per page (browser startup + navigation)
- **Batch processing**: Sequential to avoid rate limits and memory leaks
- **Cleanup**: Pages are closed after each request to prevent memory accumulation

## Support

If the script fails or behaves unexpectedly:

1. Check the error message in `enrich_results.csv`
2. Test with a single song manually
3. Review the error logs in console output
4. Check `.claude/agents/tab-import/SKILL.md` for UG scraping patterns
