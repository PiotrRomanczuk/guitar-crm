#!/usr/bin/env node

/**
 * External API Demonstration Script
 *
 * This script demonstrates how external applications can interact
 * with your Guitar CRM API, which automatically routes to local
 * or remote databases based on your environment configuration.
 *
 * Usage:
 *   node scripts/demo-external-api.js
 *   npm run demo:api
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  console.log(`🔗 ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    console.log(`🔄 Database: ${data.meta?.database || data.database?.type || 'unknown'}\n`);

    return { response, data };
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return { error };
  }
}

async function demonstrateAPI() {
  console.log('🎸 Guitar CRM External API Demonstration');
  console.log('=========================================\n');

  // 1. Check database status
  console.log('1️⃣ Checking Database Status...');
  await makeRequest('/api/external/database/status');

  // 2. Get all songs
  console.log('2️⃣ Getting All Songs...');
  await makeRequest('/api/external/songs');

  // 3. Get songs with filters
  console.log('3️⃣ Getting Songs with Filters...');
  await makeRequest('/api/external/songs?level=beginner&limit=3');

  // 4. Create a new song
  console.log('4️⃣ Creating a New Song...');
  const newSong = {
    title: `API Demo Song ${Date.now()}`,
    author: 'External API',
    level: 'beginner',
    key: 'C',
    ultimate_guitar_link: 'https://example.com',
    chords: 'C - Am - F - G',
  };

  const createResult = await makeRequest('/api/external/songs', {
    method: 'POST',
    body: JSON.stringify(newSong),
  });

  let createdSongId = null;
  if (createResult.data?.song?.id) {
    createdSongId = createResult.data.song.id;
    console.log(`✅ Created song with ID: ${createdSongId}`);

    // 5. Get the created song
    console.log('5️⃣ Getting the Created Song...');
    await makeRequest(`/api/external/songs/${createdSongId}`);

    // 6. Update the created song
    console.log('6️⃣ Updating the Created Song...');
    await makeRequest(`/api/external/songs/${createdSongId}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: `Updated API Demo Song ${Date.now()}`,
        chords: 'C - Am - F - G - C',
      }),
    });

    // 7. Delete the created song
    console.log('7️⃣ Deleting the Created Song...');
    await makeRequest(`/api/external/songs/${createdSongId}`, {
      method: 'DELETE',
    });
  }

  // 8. Test database operations
  console.log('8️⃣ Testing Database Operations...');
  await makeRequest('/api/external/database/status', {
    method: 'POST',
    body: JSON.stringify({ action: 'test' }),
  });

  // 9. Search songs
  console.log('9️⃣ Searching Songs...');
  await makeRequest('/api/external/songs?search=demo&limit=5');

  console.log('✅ API Demonstration Complete!');
  console.log('\n📋 Summary:');
  console.log('- All requests automatically routed to local/remote database');
  console.log('- Database type is returned in each response');
  console.log('- Full CRUD operations supported');
  console.log('- Error handling with database context');
}

// Export for use as module or run directly
if (require.main === module) {
  demonstrateAPI().catch(console.error);
}

module.exports = { demonstrateAPI, makeRequest };
