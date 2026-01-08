#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎵 Converting songs SQL to JSON...\n');

// Read the SQL file
const sqlFile = fs.readFileSync('/home/piotr/Desktop/guitar-crm/supabase/migrations_v2/030_seed_initial_data.sql', 'utf8');

// Extract INSERT statements for songs
const insertRegex = /INSERT INTO songs \(id, title, author, level, key, ultimate_guitar_link, chords\) VALUES \(([^)]+)\)/g;

const songs = [];
let match;

while ((match = insertRegex.exec(sqlFile)) !== null) {
  const values = match[1];
  
  // Parse the values - this is tricky because of NULLs and quoted strings
  // Use a simple approach: split by comma but respect quotes
  const parts = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = null;
  
  for (let i = 0; i < values.length; i++) {
    const char = values[i];
    
    if ((char === "'" || char === '"') && (i === 0 || values[i-1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        // Check if it's an escaped quote (two quotes together)
        if (values[i+1] === quoteChar) {
          current += char;
          i++; // Skip next quote
        } else {
          inQuotes = false;
          quoteChar = null;
        }
      } else {
        current += char;
      }
    } else if (char === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim()); // Add last part
  
  // Clean up parts
  const cleanParts = parts.map(p => {
    p = p.trim();
    if (p === 'NULL') return null;
    if (p.startsWith("'") && p.endsWith("'")) {
      return p.slice(1, -1).replace(/''/g, "'"); // Remove quotes and unescape
    }
    if (p.includes('::music_key')) {
      return p.split('::')[0].replace(/'/g, '');
    }
    return p.replace(/'/g, '');
  });
  
  const [id, title, author, level, key, ultimate_guitar_link, chords] = cleanParts;
  
  songs.push({
    id,
    title,
    author,
    level,
    key,
    ultimate_guitar_link,
    chords,
    created_at: "2025-01-01T00:00:00+00:00",
    updated_at: "2025-01-01T00:00:00+00:00"
  });
}

console.log(`✓ Extracted ${songs.length} songs\n`);

// Write to JSON file
const outputPath = path.join(__dirname, 'data/songs.json');
fs.writeFileSync(outputPath, JSON.stringify(songs, null, 2));

console.log(`✅ Written to ${outputPath}\n`);
console.log('Sample songs:');
songs.slice(0, 5).forEach(s => {
  console.log(`  - ${s.title} by ${s.author || 'Unknown'}`);
});
