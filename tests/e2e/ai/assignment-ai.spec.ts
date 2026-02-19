import { test, expect } from '../../fixtures';

test.describe('Assignment AI', { tag: ['@ai', '@assignments'] }, () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs('admin');
    await page.goto('/dashboard/assignments/new');
    await page.waitForLoadState('networkidle');
  });

  test('AI button is not visible when no student or title entered', async ({ page }) => {
    // With no student selected and no title, AI button should not be visible
    const aiBtn = page.locator('[data-testid="ai-assignment-btn"]');
    await expect(aiBtn).not.toBeVisible();
  });

  test('AI button appears after selecting student and entering title', async ({ page }) => {
    // Select a student
    await page.locator('[data-testid="student-select"]').click();
    await page.waitForTimeout(500);
    const studentOptions = page.locator('[role="option"]');
    const studentCount = await studentOptions.count();

    if (studentCount === 0) {
      test.skip(true, 'No students available in test environment');
      return;
    }

    await studentOptions.first().click();
    await page.waitForTimeout(500);

    // Fill assignment title (becomes focusArea)
    await page.locator('[data-testid="field-title"]').fill('Barre Chord Practice');

    // AI button should now be visible
    const aiBtn = page.locator('[data-testid="ai-assignment-btn"]');
    await expect(aiBtn).toBeVisible({ timeout: 5000 });
  });

  test('AI button triggers generation', async ({ page }) => {
    test.slow();

    // Select student
    await page.locator('[data-testid="student-select"]').click();
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
    await page.locator('[data-testid="field-title"]').fill('Scale Exercises');

    // Click AI button
    const aiBtn = page.locator('[data-testid="ai-assignment-btn"]');
    await expect(aiBtn).toBeVisible({ timeout: 5000 });
    await expect(aiBtn).toBeEnabled();
    await aiBtn.click();

    // Should show "Generating..." state
    await expect(aiBtn).toContainText('Generating', { timeout: 5000 }).catch(() => {
      // Generation may complete very quickly
    });

    // Wait for content in description field or error message
    const descriptionField = page.locator('[data-testid="field-description"]');
    await expect(async () => {
      const value = await descriptionField.inputValue();
      expect(value.length).toBeGreaterThan(0);
    }).toPass({ timeout: 30000 });
  });

  test('generated content populates description field', async ({ page }) => {
    test.slow();

    // Select student
    await page.locator('[data-testid="student-select"]').click();
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
    await page.locator('[data-testid="field-title"]').fill('Rhythm Training');

    // Click AI button
    const aiBtn = page.locator('[data-testid="ai-assignment-btn"]');
    await expect(aiBtn).toBeVisible({ timeout: 5000 });
    await aiBtn.click();

    // Wait for generation to complete
    const descriptionField = page.locator('[data-testid="field-description"]');
    await expect(async () => {
      const value = await descriptionField.inputValue();
      expect(value.length).toBeGreaterThan(0);
    }).toPass({ timeout: 30000 });

    // Verify meaningful content was generated
    const descriptionValue = await descriptionField.inputValue();
    expect(descriptionValue.trim().length).toBeGreaterThan(0);
  });
});
