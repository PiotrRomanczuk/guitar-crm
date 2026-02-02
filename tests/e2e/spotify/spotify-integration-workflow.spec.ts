import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_REMOTE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_REMOTE_ANON_KEY!;

test.describe('Spotify Integration - Complete Workflow', () => {
  let supabase: ReturnType<typeof createClient>;
  let teacherId: string;
  let testSongId: string;

  test.beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  test.beforeEach(async ({ page }) => {
    // Login as teacher/admin
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'teacher@example.com');
    await page.fill('[name="password"]', 'test123_teacher');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard/teacher', { timeout: 10000 });

    // Get teacher ID
    const { data: { user } } = await supabase.auth.signInWithPassword({
      email: 'teacher@example.com',
      password: 'test123_teacher',
    });
    teacherId = user!.id;
  });

  test.afterEach(async () => {
    // Cleanup: Delete test song if created
    if (testSongId) {
      await supabase.from('songs').delete().eq('id', testSongId);
    }
  });

  test('should complete full Spotify search and link workflow', async ({ page }) => {
    test.slow(); // This test involves API calls

    // Navigate to songs page
    await page.goto('/dashboard/teacher/songs');
    await expect(page.getByRole('heading', { name: /songs/i })).toBeVisible();

    // Click "Add Song" button
    await page.click('text=Add Song');

    // Fill in song details
    await page.fill('[name="title"]', 'Wonderwall');
    await page.fill('[name="author"]', 'Oasis');
    await page.selectOption('[name="level"]', 'beginner');
    await page.selectOption('[name="key"]', 'C');

    // Click "Search Spotify" button
    await page.click('text=Search Spotify');

    // Wait for search dialog to open
    await expect(page.getByRole('dialog')).toBeVisible();

    // Wait for search results
    await expect(page.getByText(/Wonderwall/i).first()).toBeVisible({ timeout: 15000 });

    // Select first result
    await page.click('[data-spotify-result]:first-child button:has-text("Select")');

    // Verify Spotify data is populated
    const spotifyUrl = await page.inputValue('[name="spotify_link_url"]');
    expect(spotifyUrl).toContain('spotify.com');

    // Save song
    await page.click('button[type="submit"]:has-text("Save")');

    // Wait for success message or redirect
    await expect(page.getByText(/successfully/i)).toBeVisible({ timeout: 10000 });

    // Verify song appears in list
    await page.goto('/dashboard/teacher/songs');
    await expect(page.getByText('Wonderwall')).toBeVisible();

    // Click on the song to view details
    await page.click('text=Wonderwall');

    // Verify Spotify link is present
    await expect(page.locator('a[href*="spotify.com"]')).toBeVisible();
  });

  test('should handle Spotify search with no results gracefully', async ({ page }) => {
    await page.goto('/dashboard/teacher/songs/new');

    // Fill in song details with gibberish
    await page.fill('[name="title"]', 'ZZZZNONEXISTENTSONGXYZ123');
    await page.fill('[name="author"]', 'ZZZZNONEXISTENTARTISTXYZ123');

    // Click "Search Spotify"
    await page.click('text=Search Spotify');

    // Wait for search dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Wait for "no results" message
    await expect(page.getByText(/no results/i)).toBeVisible({ timeout: 15000 });

    // Close dialog
    await page.click('button:has-text("Cancel")');

    // Verify we can still save the song without Spotify data
    await page.selectOption('[name="level"]', 'beginner');
    await page.selectOption('[name="key"]', 'C');
    await page.click('button[type="submit"]:has-text("Save")');

    await expect(page.getByText(/successfully/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display Spotify data on song detail page', async ({ page }) => {
    // Create a song with Spotify data directly in the database
    const { data: song } = await supabase
      .from('songs')
      .insert({
        title: 'Bohemian Rhapsody',
        author: 'Queen',
        level: 'advanced',
        key: 'C',
        spotify_link_url: 'https://open.spotify.com/track/3z8h0TU7ReDPLIbEnYhWZb',
        cover_image_url: 'https://i.scdn.co/image/ab67616d0000b273',
        duration_ms: 354000,
        release_year: 1975,
      })
      .select()
      .single();

    testSongId = song!.id;

    // Navigate to song detail page
    await page.goto(`/dashboard/teacher/songs/${testSongId}`);

    // Verify Spotify data is displayed
    await expect(page.getByText('Bohemian Rhapsody')).toBeVisible();
    await expect(page.getByText('Queen')).toBeVisible();
    await expect(page.locator('a[href*="spotify.com"]')).toBeVisible();

    // Verify cover image if present
    if (song!.cover_image_url) {
      await expect(page.locator(`img[src*="${song!.cover_image_url}"]`)).toBeVisible();
    }
  });

  test('should allow manual Spotify link entry', async ({ page }) => {
    await page.goto('/dashboard/teacher/songs/new');

    // Fill in basic song details
    await page.fill('[name="title"]', 'Manual Spotify Test');
    await page.fill('[name="author"]', 'Test Artist');
    await page.selectOption('[name="level"]', 'beginner');
    await page.selectOption('[name="key"]', 'G');

    // Manually enter Spotify URL
    await page.fill(
      '[name="spotify_link_url"]',
      'https://open.spotify.com/track/1234567890abcdef'
    );

    // Save song
    await page.click('button[type="submit"]:has-text("Save")');

    await expect(page.getByText(/successfully/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show error message on Spotify API failure', async ({ page }) => {
    // This test simulates an API failure scenario
    // We'll use a network intercept to force a failure

    await page.route('**/api/spotify/search**', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/dashboard/teacher/songs/new');

    // Fill in song details
    await page.fill('[name="title"]', 'Test Song');
    await page.fill('[name="author"]', 'Test Artist');

    // Click "Search Spotify"
    await page.click('text=Search Spotify');

    // Wait for error message
    await expect(page.getByText(/error|failed/i)).toBeVisible({ timeout: 10000 });
  });

  test('should handle rate limit errors gracefully', async ({ page }) => {
    // Mock a 429 rate limit response
    await page.route('**/api/spotify/search**', async (route) => {
      await route.fulfill({
        status: 429,
        headers: {
          'Retry-After': '60',
        },
        body: JSON.stringify({ error: 'Rate limit exceeded' }),
      });
    });

    await page.goto('/dashboard/teacher/songs/new');

    await page.fill('[name="title"]', 'Rate Limit Test');
    await page.fill('[name="author"]', 'Test Artist');

    await page.click('text=Search Spotify');

    // Should show rate limit message
    await expect(page.getByText(/rate limit|too many requests/i)).toBeVisible({ timeout: 10000 });
  });

  test('should update Spotify data when editing existing song', async ({ page }) => {
    // Create a song without Spotify data
    const { data: song } = await supabase
      .from('songs')
      .insert({
        title: 'Yesterday',
        author: 'The Beatles',
        level: 'intermediate',
        key: 'F',
      })
      .select()
      .single();

    testSongId = song!.id;

    // Navigate to edit page
    await page.goto(`/dashboard/teacher/songs/${testSongId}/edit`);

    // Search for Spotify data
    await page.click('text=Search Spotify');

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Wait for results and select first one
    await expect(page.getByText(/Yesterday/i).first()).toBeVisible({ timeout: 15000 });
    await page.click('[data-spotify-result]:first-child button:has-text("Select")');

    // Save changes
    await page.click('button[type="submit"]:has-text("Save")');

    await expect(page.getByText(/successfully/i)).toBeVisible({ timeout: 10000 });

    // Verify Spotify data was saved
    const { data: updatedSong } = await supabase
      .from('songs')
      .select('spotify_link_url')
      .eq('id', testSongId)
      .single();

    expect(updatedSong?.spotify_link_url).toBeTruthy();
    expect(updatedSong?.spotify_link_url).toContain('spotify.com');
  });
});

test.describe('Spotify Match Approval Workflow - Admin Only', () => {
  let supabase: ReturnType<typeof createClient>;
  let testSongId: string;
  let testMatchId: string;

  test.beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  test.beforeEach(async ({ page }) => {
    // Login as admin (teacher@example.com has admin/teacher role)
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'teacher@example.com');
    await page.fill('[name="password"]', 'test123_teacher');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard/teacher', { timeout: 10000 });
  });

  test.afterEach(async () => {
    // Cleanup
    if (testMatchId) {
      await supabase.from('spotify_matches').delete().eq('id', testMatchId);
    }
    if (testSongId) {
      await supabase.from('songs').delete().eq('id', testSongId);
    }
  });

  test('should display pending Spotify matches in admin dashboard', async ({ page }) => {
    // Create a test song
    const { data: song } = await supabase
      .from('songs')
      .insert({
        title: 'Stairway to Heaven',
        author: 'Led Zeppelin',
        level: 'advanced',
        key: 'Am',
      })
      .select()
      .single();

    testSongId = song!.id;

    // Create a pending match
    const { data: match } = await supabase
      .from('spotify_matches')
      .insert({
        song_id: testSongId,
        spotify_track_id: '5CQ30WqJwcep0pYcV4AMNc',
        spotify_track_name: 'Stairway to Heaven - Remaster',
        spotify_artist_name: 'Led Zeppelin',
        spotify_album_name: 'Led Zeppelin IV',
        spotify_url: 'https://open.spotify.com/track/5CQ30WqJwcep0pYcV4AMNc',
        spotify_duration_ms: 482000,
        spotify_release_date: '1971-11-08',
        confidence_score: 75,
        search_query: 'Stairway to Heaven Led Zeppelin',
        match_reason: 'High title and artist similarity',
        status: 'pending',
      })
      .select()
      .single();

    testMatchId = match!.id;

    // Navigate to Spotify matches page
    await page.goto('/dashboard/admin/spotify-matches');

    // Verify match appears
    await expect(page.getByText('Stairway to Heaven')).toBeVisible();
    await expect(page.getByText('75%')).toBeVisible(); // Confidence score

    // Verify approve/reject buttons are present
    await expect(page.getByRole('button', { name: /approve/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /reject/i })).toBeVisible();
  });

  test('should approve a pending match and update song', async ({ page }) => {
    // Create test data
    const { data: song } = await supabase
      .from('songs')
      .insert({
        title: 'Hotel California',
        author: 'Eagles',
        level: 'intermediate',
        key: 'Bm',
      })
      .select()
      .single();

    testSongId = song!.id;

    const { data: match } = await supabase
      .from('spotify_matches')
      .insert({
        song_id: testSongId,
        spotify_track_id: '40riOy7x9W7GXjyGp4pjAv',
        spotify_track_name: 'Hotel California - 2013 Remaster',
        spotify_artist_name: 'Eagles',
        spotify_album_name: 'Hotel California',
        spotify_url: 'https://open.spotify.com/track/40riOy7x9W7GXjyGp4pjAv',
        spotify_cover_image_url: 'https://i.scdn.co/image/ab67616d0000b273',
        spotify_duration_ms: 391000,
        spotify_release_date: '1976-12-08',
        confidence_score: 92,
        search_query: 'Hotel California Eagles',
        match_reason: 'Exact title and artist match',
        status: 'pending',
      })
      .select()
      .single();

    testMatchId = match!.id;

    // Navigate to matches page
    await page.goto('/dashboard/admin/spotify-matches');

    // Click approve button
    await page.click(`[data-match-id="${testMatchId}"] button:has-text("Approve")`);

    // Wait for success message
    await expect(page.getByText(/approved|success/i)).toBeVisible({ timeout: 10000 });

    // Verify match status changed to 'approved'
    const { data: updatedMatch } = await supabase
      .from('spotify_matches')
      .select('status')
      .eq('id', testMatchId)
      .single();

    expect(updatedMatch?.status).toBe('approved');

    // Verify song was updated with Spotify data
    const { data: updatedSong } = await supabase
      .from('songs')
      .select('spotify_link_url, cover_image_url, duration_ms')
      .eq('id', testSongId)
      .single();

    expect(updatedSong?.spotify_link_url).toContain('spotify.com');
    expect(updatedSong?.cover_image_url).toBeTruthy();
    expect(updatedSong?.duration_ms).toBe(391000);
  });

  test('should reject a pending match', async ({ page }) => {
    // Create test data
    const { data: song } = await supabase
      .from('songs')
      .insert({
        title: 'Wonderwall',
        author: 'Oasis',
        level: 'beginner',
        key: 'C',
      })
      .select()
      .single();

    testSongId = song!.id;

    const { data: match } = await supabase
      .from('spotify_matches')
      .insert({
        song_id: testSongId,
        spotify_track_id: 'wrong-track-id',
        spotify_track_name: 'Wonderwall (Wrong Version)',
        spotify_artist_name: 'Wrong Artist',
        spotify_album_name: 'Wrong Album',
        spotify_url: 'https://open.spotify.com/track/wrong-track-id',
        spotify_duration_ms: 123456,
        spotify_release_date: '2020-01-01',
        confidence_score: 45,
        search_query: 'Wonderwall',
        match_reason: 'Low confidence match',
        status: 'pending',
      })
      .select()
      .single();

    testMatchId = match!.id;

    // Navigate to matches page
    await page.goto('/dashboard/admin/spotify-matches');

    // Click reject button
    await page.click(`[data-match-id="${testMatchId}"] button:has-text("Reject")`);

    // Wait for success message
    await expect(page.getByText(/rejected|success/i)).toBeVisible({ timeout: 10000 });

    // Verify match status changed to 'rejected'
    const { data: updatedMatch } = await supabase
      .from('spotify_matches')
      .select('status')
      .eq('id', testMatchId)
      .single();

    expect(updatedMatch?.status).toBe('rejected');

    // Verify song was NOT updated
    const { data: song2 } = await supabase
      .from('songs')
      .select('spotify_link_url')
      .eq('id', testSongId)
      .single();

    expect(song2?.spotify_link_url).toBeNull();
  });

  test('should filter matches by confidence level', async ({ page }) => {
    // Create multiple matches with different confidence scores
    const { data: song1 } = await supabase
      .from('songs')
      .insert({ title: 'Song 1', author: 'Artist 1', level: 'beginner', key: 'C' })
      .select()
      .single();

    const { data: song2 } = await supabase
      .from('songs')
      .insert({ title: 'Song 2', author: 'Artist 2', level: 'beginner', key: 'C' })
      .select()
      .single();

    const match1 = await supabase
      .from('spotify_matches')
      .insert({
        song_id: song1!.id,
        spotify_track_id: 'track1',
        spotify_track_name: 'Match 1',
        spotify_artist_name: 'Artist 1',
        spotify_album_name: 'Album 1',
        spotify_url: 'https://open.spotify.com/track/track1',
        spotify_duration_ms: 180000,
        spotify_release_date: '2020-01-01',
        confidence_score: 95, // High confidence
        search_query: 'query1',
        match_reason: 'High confidence',
        status: 'pending',
      })
      .select()
      .single();

    const match2 = await supabase
      .from('spotify_matches')
      .insert({
        song_id: song2!.id,
        spotify_track_id: 'track2',
        spotify_track_name: 'Match 2',
        spotify_artist_name: 'Artist 2',
        spotify_album_name: 'Album 2',
        spotify_url: 'https://open.spotify.com/track/track2',
        spotify_duration_ms: 180000,
        spotify_release_date: '2020-01-01',
        confidence_score: 50, // Low confidence
        search_query: 'query2',
        match_reason: 'Low confidence',
        status: 'pending',
      })
      .select()
      .single();

    // Navigate to matches page
    await page.goto('/dashboard/admin/spotify-matches');

    // Apply high confidence filter (>= 85%)
    await page.selectOption('[name="confidence-filter"]', '85');

    // Should only see high confidence match
    await expect(page.getByText('Match 1')).toBeVisible();
    await expect(page.getByText('Match 2')).not.toBeVisible();

    // Cleanup
    await supabase.from('spotify_matches').delete().in('id', [match1.data!.id, match2.data!.id]);
    await supabase.from('songs').delete().in('id', [song1!.id, song2!.id]);
  });
});
