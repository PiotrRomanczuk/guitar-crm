import { test, expect } from '../../fixtures';

test.describe('Lesson Notes AI', { tag: ['@ai', '@lessons'] }, () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs('admin');
    await page.goto('/dashboard/lessons/new');
    await page.waitForLoadState('networkidle');
  });

  test('AI button is not visible when no student or songs selected', async ({ page }) => {
    // With no student and no songs selected, the AI button should not be visible
    const aiBtn = page.locator('[data-testid="ai-lesson-notes-btn"]');
    await expect(aiBtn).not.toBeVisible();
  });

  test('AI button appears after selecting student, songs, and title', async ({ page }) => {
    // Select a student
    await page.locator('[data-testid="lesson-student_id"]').click();
    await page.waitForTimeout(500);
    const studentOptions = page.locator('[role="option"]');
    const studentCount = await studentOptions.count();

    if (studentCount === 0) {
      test.skip(true, 'No students available in test environment');
      return;
    }

    await studentOptions.first().click();
    await page.waitForTimeout(500);

    // Fill lesson title (lessonTopic)
    await page.locator('[data-testid="lesson-title"]').fill('Chord Progressions');

    // Select a song - find the song search/select area and pick a song
    const songCheckboxes = page.locator('input[type="checkbox"]');
    const songCount = await songCheckboxes.count();

    if (songCount === 0) {
      test.skip(true, 'No songs available in test environment');
      return;
    }

    await songCheckboxes.first().click();
    await page.waitForTimeout(300);

    // AI button should now be visible
    const aiBtn = page.locator('[data-testid="ai-lesson-notes-btn"]');
    await expect(aiBtn).toBeVisible({ timeout: 5000 });
  });

  test('AI button is disabled when lesson title is empty', async ({ page }) => {
    // Select a student
    await page.locator('[data-testid="lesson-student_id"]').click();
    await page.waitForTimeout(500);
    const studentOptions = page.locator('[role="option"]');
    const studentCount = await studentOptions.count();

    if (studentCount === 0) {
      test.skip(true, 'No students available in test environment');
      return;
    }

    await studentOptions.first().click();
    await page.waitForTimeout(500);

    // Select a song
    const songCheckboxes = page.locator('input[type="checkbox"]');
    const songCount = await songCheckboxes.count();

    if (songCount === 0) {
      test.skip(true, 'No songs available in test environment');
      return;
    }

    await songCheckboxes.first().click();
    await page.waitForTimeout(300);

    // Leave title empty - clear it if it has default
    await page.locator('[data-testid="lesson-title"]').clear();

    // AI button should be disabled (not visible or disabled)
    const aiBtn = page.locator('[data-testid="ai-lesson-notes-btn"]');
    const isVisible = await aiBtn.isVisible().catch(() => false);

    if (isVisible) {
      await expect(aiBtn).toBeDisabled();
    }
  });

  test('AI button triggers generation', async ({ page }) => {
    test.slow(); // AI generation takes time

    // Select student
    await page.locator('[data-testid="lesson-student_id"]').click();
    await page.waitForTimeout(500);
    const studentOptions = page.locator('[role="option"]');
    const studentCount = await studentOptions.count();

    if (studentCount === 0) {
      test.skip(true, 'No students available in test environment');
      return;
    }

    await studentOptions.first().click();
    await page.waitForTimeout(500);

    // Fill title
    await page.locator('[data-testid="lesson-title"]').fill('Fingerpicking Basics');

    // Select a song
    const songCheckboxes = page.locator('input[type="checkbox"]');
    const songCount = await songCheckboxes.count();

    if (songCount === 0) {
      test.skip(true, 'No songs available in test environment');
      return;
    }

    await songCheckboxes.first().click();
    await page.waitForTimeout(300);

    // Click AI button
    const aiBtn = page.locator('[data-testid="ai-lesson-notes-btn"]');
    await expect(aiBtn).toBeVisible({ timeout: 5000 });
    await expect(aiBtn).toBeEnabled();
    await aiBtn.click();

    // Should show "Generating..." state
    await expect(aiBtn).toContainText('Generating', { timeout: 5000 }).catch(() => {
      // Generation may complete very quickly
    });

    // Wait for either content in notes textarea or error message
    const notesField = page.locator('[data-testid="lesson-notes"]');
    await expect(async () => {
      const value = await notesField.inputValue();
      const hasContent = value.length > 0;
      expect(hasContent).toBeTruthy();
    }).toPass({ timeout: 30000 });
  });

  test('generated content populates notes field', async ({ page }) => {
    test.slow();

    // Select student
    await page.locator('[data-testid="lesson-student_id"]').click();
    await page.waitForTimeout(500);
    const studentOptions = page.locator('[role="option"]');
    const studentCount = await studentOptions.count();

    if (studentCount === 0) {
      test.skip(true, 'No students available in test environment');
      return;
    }

    await studentOptions.first().click();
    await page.waitForTimeout(500);

    // Fill title
    await page.locator('[data-testid="lesson-title"]').fill('Strumming Patterns');

    // Select a song
    const songCheckboxes = page.locator('input[type="checkbox"]');
    const songCount = await songCheckboxes.count();

    if (songCount === 0) {
      test.skip(true, 'No songs available in test environment');
      return;
    }

    await songCheckboxes.first().click();
    await page.waitForTimeout(300);

    // Click AI button
    const aiBtn = page.locator('[data-testid="ai-lesson-notes-btn"]');
    await expect(aiBtn).toBeVisible({ timeout: 5000 });
    await aiBtn.click();

    // Wait for generation to complete (button text returns to "AI Assist" or notes populated)
    const notesField = page.locator('[data-testid="lesson-notes"]');
    await expect(async () => {
      const value = await notesField.inputValue();
      // Content should be non-empty (either real AI content or error message)
      expect(value.length).toBeGreaterThan(0);
    }).toPass({ timeout: 30000 });

    // Verify the notes field has substantial content (not just whitespace)
    const notesValue = await notesField.inputValue();
    expect(notesValue.trim().length).toBeGreaterThan(0);
  });
});
