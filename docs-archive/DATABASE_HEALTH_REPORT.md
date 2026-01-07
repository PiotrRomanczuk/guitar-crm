# Database Health Report - Songs Table
Generated: January 7, 2026

## Summary Statistics

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total Songs** | 132 | 100% |
| Songs with Title | 132 | 100% ✅ |
| Songs with Author | 96 | 72.7% ⚠️ |
| Songs with Spotify Link | 92 | 69.7% |
| Songs with Cover Image | 92 | 69.7% |
| Songs with Duration | 92 | 69.7% |
| Songs with Release Year | 92 | 69.7% |
| Songs with Level | 96 | 72.7% |
| Songs with Key | 29 | 22% ❌ |
| Songs with Chords | 14 | 10.6% ❌ |
| Songs with UG Link | 30 | 22.7% ⚠️ |
| Songs with Short Title | 0 | 0% ❌ |

## Critical Issues

### 1. **Songs with Spotify Links (92 songs) Missing Data:**
- **30 songs** missing author (33%)
- **30 songs** missing level (33%)
- **70 songs** missing key (76%) ❌
- **81 songs** missing chords (88%) ❌

### 2. **Songs without Spotify Links (40 songs):**
- All missing: spotify_link_url, cover_image_url, duration_ms, release_year
- Most missing: key, chords, ultimate_guitar_link
- Some have: author, level (for songs added manually)

### 3. **Data Completeness Issues:**
- **0 songs** have short_title (100% missing)
- **103 songs** missing key (78% missing)
- **118 songs** missing chords (89% missing)
- **102 songs** missing ultimate_guitar_link (77% missing)

## Recommendations

### High Priority
1. ✅ **Spotify Integration Working**: 92 songs have complete Spotify data (link, cover, duration, year)
2. ❌ **Need to populate KEY field**: Only 22% of songs have musical key defined
3. ❌ **Need to populate CHORDS field**: Only 10.6% of songs have chord progressions
4. ⚠️ **Need to populate AUTHOR for Spotify songs**: 30 songs with Spotify data missing author

### Medium Priority
1. **Add short_title**: Generate short titles for all 132 songs (useful for mobile UI)
2. **Link Ultimate Guitar**: Only 30/132 songs have UG links
3. **Complete non-Spotify songs**: 40 songs need Spotify matching

### Suggested Actions

#### 1. Auto-populate Author from Spotify
For the 30 songs with Spotify links but no author, extract artist name from Spotify metadata.

#### 2. Add Short Titles
Generate short titles (max 50 chars) from full titles for better UI display.

#### 3. Manual Data Entry Priority
Focus on adding:
- Musical keys (especially for beginner songs)
- Chord progressions (critical for guitar learning app)
- Ultimate Guitar links (for detailed tabs)

#### 4. Spotify Matching for Remaining Songs
40 songs still need Spotify matching. These should be processed through the Spotify matches workflow.

## Data Quality by Category

### Excellent (90-100% complete):
- Title: 100%
- Spotify metadata (for matched songs): 100%

### Good (70-90% complete):
- Author: 72.7%
- Level: 72.7%

### Poor (50-70% complete):
- Spotify matching: 69.7%

### Critical (<50% complete):
- Key: 22% ❌
- Ultimate Guitar links: 22.7% ❌
- Chords: 10.6% ❌
- Short title: 0% ❌
