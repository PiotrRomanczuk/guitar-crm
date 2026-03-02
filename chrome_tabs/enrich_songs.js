#!/usr/bin/env node

import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { createObjectCsvWriter } from 'csv-writer';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Key mapping: normalize to valid music_key enum values
const VALID_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'
];

function normalizeKey(ugKey) {
  if (!ugKey) return 'C';

  ugKey = ugKey.trim().toLowerCase();

  // Normalize sharps to their canonical form
  const keyMap = {
    'a#': 'Bb',
    'd#': 'Eb',
    'g#': 'Ab',
    'a#m': 'Bbm',
    'd#m': 'Ebm',
    'g#m': 'Abm',
  };

  if (keyMap[ugKey]) return keyMap[ugKey];

  // Capitalize properly
  let normalized = ugKey.charAt(0).toUpperCase() + ugKey.slice(1);

  // Handle 'm' suffix
  if (normalized.toLowerCase().endsWith('m') && !normalized.includes('m')) {
    normalized = normalized.slice(0, -1) + 'm';
  }

  // If in valid keys, return it
  if (VALID_KEYS.includes(normalized)) return normalized;

  // Fallback: return C
  return 'C';
}

// Difficulty mapping
function mapDifficulty(ugDifficulty) {
  if (!ugDifficulty) return 'beginner';

  const diffMap = {
    'novice': 'beginner',
    'beginner': 'beginner',
    'intermediate': 'intermediate',
    'advanced': 'advanced',
    'expert': 'advanced',
  };

  const normalized = ugDifficulty.toLowerCase();
  return diffMap[normalized] || 'beginner';
}

// Parse section headers and extract lyrics + chords
function parseSections(lyricsWithChords) {
  if (!lyricsWithChords) return [];

  const sections = [];
  const lines = lyricsWithChords.split('\n');

  const SECTION_PATTERN = /^\s*\[?(intro|verse|pre-chorus|chorus|bridge|solo|interlude|outro)[\s\d]*\]?\s*$/i;

  let currentSection = null;
  let currentSectionChords = new Set();
  let currentLyrics = [];
  let orderPosition = 10;

  for (const line of lines) {
    const sectionMatch = line.match(SECTION_PATTERN);

    if (sectionMatch) {
      // Save previous section if exists
      if (currentSection) {
        sections.push({
          section_type: currentSection.type,
          section_number: currentSection.number,
          order_position: currentSection.orderPos,
          chords: Array.from(currentSectionChords).join(', '),
          lyrics: currentLyrics.join('\n'),
        });
      }

      // Parse section header
      const typeStr = sectionMatch[1].toLowerCase();
      const sectionType = typeStr === 'pre-chorus' ? 'pre_chorus' : typeStr;

      // Extract number if present
      const numberMatch = line.match(/(\d+)/);
      const number = numberMatch ? parseInt(numberMatch[1]) : 1;

      currentSection = { type: sectionType, number, orderPos: orderPosition };
      currentSectionChords = new Set();
      currentLyrics = [];
      orderPosition += 10;
    } else if (currentSection && line.trim()) {
      // Extract chords from chord lines
      const chords = extractChordsFromLine(line);
      chords.forEach(c => currentSectionChords.add(c));

      if (!isChordOnlyLine(line)) {
        currentLyrics.push(line);
      }
    }
  }

  // Don't forget last section
  if (currentSection) {
    sections.push({
      section_type: currentSection.type,
      section_number: currentSection.number,
      order_position: currentSection.orderPos,
      chords: Array.from(currentSectionChords).join(', '),
      lyrics: currentLyrics.join('\n'),
    });
  }

  return sections;
}

// Extract chord names from a line
function extractChordsFromLine(line) {
  const chords = [];
  // Match chord names: A, Am, Dm7, F#, etc.
  const chordPattern = /\b([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|7|9|11|13)?(?:\/[A-G][#b]?)?)\b/g;
  let match;
  while ((match = chordPattern.exec(line)) !== null) {
    chords.push(match[1]);
  }
  return [...new Set(chords)];
}

// Check if a line is chord-only (no lyrics)
function isChordOnlyLine(line) {
  const trimmed = line.trim();
  const chordPattern = /^(\s*[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|7|9|11|13)?(?:\/[A-G][#b]?)?\s*)+$/;
  return chordPattern.test(trimmed);
}

// Scrape UG page and extract data
async function scrapeUltimateGuitar(url, browser) {
  let page;
  try {
    page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Try to extract from embedded JSON first
    const ugData = await page.evaluate(() => {
      return window.UGAPP?.store?.page?.data?.tab ?? null;
    });

    if (!ugData) {
      return { error: 'Could not find UG data in page' };
    }

    // Extract relevant fields
    const result = {
      key: normalizeKey(ugData.tonality_name),
      level: mapDifficulty(ugData.difficulty),
      capo_fret: ugData.capo || 0,
      tempo: ugData.bpm || null,
      lyrics_with_chords: ugData.content || '',
    };

    // Extract chord names from applicature
    if (ugData.applicature && typeof ugData.applicature === 'object') {
      const chordNames = Object.keys(ugData.applicature);
      result.chords = chordNames.join(', ');
    } else {
      result.chords = '';
    }

    return result;
  } catch (error) {
    return { error: error.message };
  } finally {
    if (page) await page.close();
  }
}

// Fetch songs that need enrichment
async function fetchSongsToEnrich() {
  const { data, error } = await supabase
    .from('songs')
    .select('id, title, author, ultimate_guitar_link, key, level, chords, lyrics_with_chords')
    .not('ultimate_guitar_link', 'is', null)
    .or('chords.eq.,chords.is.null')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch songs: ${error.message}`);
  return data || [];
}

// Update song in database
async function updateSong(songId, updates) {
  const { error } = await supabase
    .from('songs')
    .update(updates)
    .eq('id', songId);

  if (error) throw new Error(`Update failed: ${error.message}`);
}

// Insert song sections
async function insertSongSections(songId, sections) {
  if (!sections || sections.length === 0) return;

  // First delete existing sections
  await supabase
    .from('song_sections')
    .delete()
    .eq('song_id', songId);

  // Insert new sections
  const sectionsData = sections.map(s => ({
    song_id: songId,
    section_type: s.section_type,
    section_number: s.section_number,
    order_position: s.order_position,
    chords: s.chords,
    lyrics: s.lyrics,
  }));

  const { error } = await supabase
    .from('song_sections')
    .insert(sectionsData);

  if (error) throw new Error(`Insert sections failed: ${error.message}`);
}

// Main enrichment loop
async function enrichSongs() {
  console.log('Fetching songs to enrich...');
  const songs = await fetchSongsToEnrich();
  console.log(`Found ${songs.length} songs to enrich\n`);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  let enriched = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const idx = i + 1;
    console.log(`[${idx}/${songs.length}] ${song.title} by ${song.author}`);

    const result = {
      song_id: song.id,
      title: song.title,
      author: song.author,
      url: song.ultimate_guitar_link,
      status: 'pending',
      key_scraped: '',
      level_scraped: '',
      chords_count: 0,
      has_lyrics: false,
      error: '',
    };

    try {
      // Skip if already has real data
      if (song.chords && song.chords.trim() && song.chords !== '') {
        result.status = 'already_enriched';
        result.chords_count = song.chords.split(',').length;
        console.log('  → Already has chord data, skipping');
        skipped++;
        results.push(result);
        continue;
      }

      // Scrape UG page
      console.log('  → Scraping Ultimate Guitar...');
      const scraped = await scrapeUltimateGuitar(song.ultimate_guitar_link, browser);

      if (scraped.error) {
        throw new Error(scraped.error);
      }

      // Determine what to update (only replace defaults)
      const updates = {};

      if (song.key === 'C') {
        updates.key = scraped.key;
        result.key_scraped = scraped.key;
      }

      if (song.level === 'beginner') {
        updates.level = scraped.level;
        result.level_scraped = scraped.level;
      }

      if (!song.chords || song.chords === '') {
        updates.chords = scraped.chords;
      }

      if (!song.lyrics_with_chords) {
        updates.lyrics_with_chords = scraped.lyrics_with_chords;
      }

      if (scraped.capo_fret && !song.capo_fret) {
        updates.capo_fret = scraped.capo_fret;
      }

      if (scraped.tempo && !song.tempo) {
        updates.tempo = scraped.tempo;
      }

      // Update song
      await updateSong(song.id, updates);

      // Parse and insert sections if we have lyrics
      if (scraped.lyrics_with_chords) {
        const sections = parseSections(scraped.lyrics_with_chords);
        if (sections.length > 0) {
          await insertSongSections(song.id, sections);
        }
      }

      result.status = 'success';
      result.chords_count = (scraped.chords || '').split(',').filter(c => c.trim()).length;
      result.has_lyrics = !!scraped.lyrics_with_chords;
      console.log(`  ✓ Enriched: ${scraped.key}, ${scraped.level}, ${result.chords_count} chords`);
      enriched++;
    } catch (error) {
      result.status = 'error';
      result.error = error.message;
      console.log(`  ✗ Error: ${error.message}`);
      failed++;
    }

    results.push(result);

    // Rate limiting: 2-3 seconds between scrapes
    if (i < songs.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2500));
    }
  }

  await browser.close();

  // Write results CSV
  console.log('\nWriting results to CSV...');
  const csvPath = path.join(__dirname, 'enrich_results.csv');
  const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: [
      { id: 'song_id', title: 'song_id' },
      { id: 'title', title: 'title' },
      { id: 'author', title: 'author' },
      { id: 'url', title: 'url' },
      { id: 'status', title: 'status' },
      { id: 'key_scraped', title: 'key_scraped' },
      { id: 'level_scraped', title: 'level_scraped' },
      { id: 'chords_count', title: 'chords_count' },
      { id: 'has_lyrics', title: 'has_lyrics' },
      { id: 'error', title: 'error' },
    ],
  });

  await csvWriter.writeRecords(results);

  console.log('\n=== Enrichment Summary ===');
  console.log(`Enriched: ${enriched}`);
  console.log(`Already enriched: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Results CSV: ${csvPath}`);
}

enrichSongs().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
