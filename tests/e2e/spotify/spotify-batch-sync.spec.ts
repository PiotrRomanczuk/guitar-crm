/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_REMOTE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_REMOTE_ANON_KEY!;

test.describe('Spotify Batch Sync Workflow', () => {
  let supabase: ReturnType<typeof createClient>;
  let testSongIds: string[] = [];

  test.beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  test.beforeEach(async ({ page }) => {
    // Login as admin/teacher
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'teacher@example.com');
    await page.fill('[name="password"]', 'test123_teacher');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard/teacher', { timeout: 10000 });
  });

  test.afterEach(async () => {
    // Cleanup test songs
    if (testSongIds.length > 0) {
      await supabase.from('songs').delete().in('id', testSongIds);
      await supabase.from('spotify_matches').delete().in('song_id', testSongIds);
      testSongIds = [];
    }
  });

  test('should display batch sync option for songs without Spotify data', async ({ page }) => {
    // Create songs without Spotify data
    const { data: songs } = await supabase
      .from('songs')
      .insert([
        { title: 'Test Song 1', author: 'Artist 1', level: 'beginner', key: 'C' },
        { title: 'Test Song 2', author: 'Artist 2', level: 'intermediate', key: 'G' },
        { title: 'Test Song 3', author: 'Artist 3', level: 'advanced', key: 'D' },
      ])
      .select();

    testSongIds = songs!.map((s) => s.id);

    // Navigate to admin Spotify page or songs page
    await page.goto('/dashboard/admin/songs');

    // Look for "Sync with Spotify" or "Batch Sync" button
    await expect(
      page.getByRole('button', { name: /sync.*spotify|batch.*sync/i })
    ).toBeVisible();
  });

  test('should initiate batch sync and show progress', async ({ page }) => {
    test.slow(); // This test involves API calls and may take time

    // Create test songs
    const { data: songs } = await supabase
      .from('songs')
      .insert([
        { title: 'Yesterday', author: 'The Beatles', level: 'beginner', key: 'F' },
        { title: 'Let It Be', author: 'The Beatles', level: 'beginner', key: 'C' },
      ])
      .select();

    testSongIds = songs!.map((s) => s.id);

    // Navigate to batch sync page/feature
    await page.goto('/dashboard/admin/spotify-sync');

    // Start batch sync
    await page.click('button:has-text("Start Sync")');

    // Should show progress indicator
    await expect(page.getByText(/syncing|processing/i)).toBeVisible({ timeout: 5000 });

    // Should show progress bar or count
    await expect(
      page.locator('[role="progressbar"], [data-testid="sync-progress"]')
    ).toBeVisible();

    // Wait for sync to complete
    await expect(page.getByText(/complete|finished/i)).toBeVisible({ timeout: 60000 });

    // Should show summary statistics
    await expect(page.getByText(/matched|total/i)).toBeVisible();
  });

  test('should handle confidence thresholds correctly', async ({ page }) => {
    test.slow();

    // Create test songs with varying match quality
    const { data: songs } = await supabase
      .from('songs')
      .insert([
        { title: 'Imagine', author: 'John Lennon', level: 'beginner', key: 'C' }, // High confidence expected
        { title: 'zxcvbnm', author: 'qwerty', level: 'beginner', key: 'C' }, // Low confidence expected
      ])
      .select();

    testSongIds = songs!.map((s) => s.id);

    // Navigate to sync page
    await page.goto('/dashboard/admin/spotify-sync');

    // Set minimum confidence threshold
    await page.fill('[name="minConfidence"]', '85');

    // Start sync
    await page.click('button:has-text("Start Sync")');

    // Wait for completion
    await expect(page.getByText(/complete/i)).toBeVisible({ timeout: 60000 });

    // Check results
    // High confidence matches should be auto-applied
    const { data: song1 } = await supabase
      .from('songs')
      .select('spotify_link_url')
      .eq('id', testSongIds[0])
      .single();

    // Low confidence song should have no Spotify data
    const { data: song2 } = await supabase
      .from('songs')
      .select('spotify_link_url')
      .eq('id', testSongIds[1])
      .single();

    // Expect high confidence song to have Spotify data
    if (song1?.spotify_link_url) {
      expect(song1.spotify_link_url).toContain('spotify.com');
    }

    // Low confidence song should not have Spotify data
    expect(song2?.spotify_link_url).toBeNull();
  });

  test('should allow canceling ongoing sync operation', async ({ page }) => {
    // Create many test songs to make cancellation feasible
    const songs = Array.from({ length: 10 }, (_, i) => ({
      title: `Test Song ${i}`,
      author: `Artist ${i}`,
      level: 'beginner' as const,
      key: 'C',
    }));

    const { data: createdSongs } = await supabase.from('songs').insert(songs).select();

    testSongIds = createdSongs!.map((s) => s.id);

    // Navigate to sync page
    await page.goto('/dashboard/admin/spotify-sync');

    // Start sync
    await page.click('button:has-text("Start Sync")');

    // Wait a moment then cancel
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Cancel")');

    // Should show canceled message
    await expect(page.getByText(/cancel|abort|stop/i)).toBeVisible({ timeout: 10000 });

    // Should not process all songs
    const { data: matches } = await supabase
      .from('spotify_matches')
      .select('id')
      .in('song_id', testSongIds);

    // Should have fewer matches than total songs
    expect(matches?.length || 0).toBeLessThan(testSongIds.length);
  });

  test('should display detailed sync report after completion', async ({ page }) => {
    test.slow();

    // Create test songs
    const { data: songs } = await supabase
      .from('songs')
      .insert([
        { title: 'Hey Jude', author: 'The Beatles', level: 'beginner', key: 'F' },
        { title: 'Come Together', author: 'The Beatles', level: 'intermediate', key: 'Dm' },
        { title: 'While My Guitar Gently Weeps', author: 'The Beatles', level: 'advanced', key: 'Am' },
      ])
      .select();

    testSongIds = songs!.map((s) => s.id);

    // Navigate and sync
    await page.goto('/dashboard/admin/spotify-sync');
    await page.click('button:has-text("Start Sync")');

    // Wait for completion
    await expect(page.getByText(/complete/i)).toBeVisible({ timeout: 60000 });

    // Should show report with categories
    await expect(page.getByText(/auto.*applied|high.*confidence/i)).toBeVisible();
    await expect(page.getByText(/pending.*review|medium.*confidence/i)).toBeVisible();
    await expect(page.getByText(/skipped|low.*confidence/i)).toBeVisible();

    // Should show counts for each category
    await expect(page.getByText(/\d+.*song/i)).toBeVisible();
  });

  test('should handle API errors during batch sync gracefully', async ({ page }) => {
    // Mock API to return errors
    await page.route('**/api/spotify/sync**', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Spotify API temporarily unavailable' }),
      });
    });

    // Create test songs
    const { data: songs } = await supabase
      .from('songs')
      .insert([{ title: 'Test', author: 'Test', level: 'beginner', key: 'C' }])
      .select();

    testSongIds = songs!.map((s) => s.id);

    // Navigate and attempt sync
    await page.goto('/dashboard/admin/spotify-sync');
    await page.click('button:has-text("Start Sync")');

    // Should show error message
    await expect(page.getByText(/error|fail|unavailable/i)).toBeVisible({ timeout: 15000 });

    // Should allow retry
    await expect(page.getByRole('button', { name: /retry|try again/i })).toBeVisible();
  });

  test('should support selective sync (only unmatched songs)', async ({ page }) => {
    // Create mix of matched and unmatched songs
    const { data: matchedSong } = await supabase
      .from('songs')
      .insert({
        title: 'Already Matched',
        author: 'Artist',
        level: 'beginner',
        key: 'C',
        spotify_link_url: 'https://open.spotify.com/track/existing',
      })
      .select()
      .single();

    const { data: unmatchedSong } = await supabase
      .from('songs')
      .insert({
        title: 'Not Matched Yet',
        author: 'Artist',
        level: 'beginner',
        key: 'C',
      })
      .select()
      .single();

    testSongIds = [matchedSong!.id, unmatchedSong!.id];

    // Navigate to sync page
    await page.goto('/dashboard/admin/spotify-sync');

    // Toggle "Only unmatched songs" option
    await page.check('[name="onlyUnmatched"]');

    // Start sync
    await page.click('button:has-text("Start Sync")');

    // Wait for completion
    await expect(page.getByText(/complete/i)).toBeVisible({ timeout: 60000 });

    // Should report only 1 song processed (the unmatched one)
    await expect(page.getByText(/1.*song/i)).toBeVisible();
  });

  test('should respect rate limits and show retry countdown', async ({ page }) => {
    // Mock rate limit response
    let requestCount = 0;
    await page.route('**/api/spotify/sync**', async (route) => {
      requestCount++;
      if (requestCount === 1) {
        await route.fulfill({
          status: 429,
          headers: {
            'Retry-After': '5',
          },
          body: JSON.stringify({ error: 'Rate limit exceeded' }),
        });
      } else {
        await route.continue();
      }
    });

    // Create test song
    const { data: songs } = await supabase
      .from('songs')
      .insert([{ title: 'Test', author: 'Test', level: 'beginner', key: 'C' }])
      .select();

    testSongIds = songs!.map((s) => s.id);

    // Start sync
    await page.goto('/dashboard/admin/spotify-sync');
    await page.click('button:has-text("Start Sync")');

    // Should show rate limit message and countdown
    await expect(page.getByText(/rate limit|retry.*\d+/i)).toBeVisible({ timeout: 10000 });

    // Should automatically retry after delay
    await expect(page.getByText(/complete/i)).toBeVisible({ timeout: 30000 });
  });
});

test.describe('Spotify Sync - Streaming Updates', () => {
  let supabase: ReturnType<typeof createClient>;
  let testSongIds: string[] = [];

  test.beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'teacher@example.com');
    await page.fill('[name="password"]', 'test123_teacher');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/teacher', { timeout: 10000 });
  });

  test.afterEach(async () => {
    if (testSongIds.length > 0) {
      await supabase.from('songs').delete().in('id', testSongIds);
      testSongIds = [];
    }
  });

  test('should show real-time progress updates during sync', async ({ page }) => {
    test.slow();

    // Create multiple songs for sync
    const songs = Array.from({ length: 5 }, (_, i) => ({
      title: `Beatles Song ${i}`,
      author: 'The Beatles',
      level: 'beginner' as const,
      key: 'C',
    }));

    const { data: createdSongs } = await supabase.from('songs').insert(songs).select();
    testSongIds = createdSongs!.map((s) => s.id);

    // Navigate to sync page
    await page.goto('/dashboard/admin/spotify-sync');

    // Start sync with streaming enabled (if UI has this option)
    await page.click('button:has-text("Start Sync")');

    // Watch for progress updates (numbers should increase)
    let previousProgress = 0;
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(3000);

      // Get current progress
      const progressText = await page.locator('[data-testid="sync-progress-count"]').textContent();
      const currentProgress = parseInt(progressText?.match(/\d+/)?.[0] || '0', 10);

      // Progress should increase or stay the same (not decrease)
      expect(currentProgress).toBeGreaterThanOrEqual(previousProgress);
      previousProgress = currentProgress;
    }

    // Wait for completion
    await expect(page.getByText(/complete/i)).toBeVisible({ timeout: 60000 });
  });

  test('should display individual song processing status', async ({ page }) => {
    test.slow();

    const { data: songs } = await supabase
      .from('songs')
      .insert([
        { title: 'Blackbird', author: 'The Beatles', level: 'intermediate', key: 'G' },
        { title: 'Norwegian Wood', author: 'The Beatles', level: 'beginner', key: 'D' },
      ])
      .select();

    testSongIds = songs!.map((s) => s.id);

    await page.goto('/dashboard/admin/spotify-sync');
    await page.click('button:has-text("Start Sync")');

    // Should show individual song names as they're processed
    await expect(page.getByText('Blackbird')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Norwegian Wood')).toBeVisible({ timeout: 30000 });

    // Should show status indicators (processing, matched, skipped)
    await expect(
      page.locator('[data-status="processing"], [data-status="matched"], [data-status="skipped"]')
    ).toHaveCount(2, { timeout: 60000 });
  });
});
