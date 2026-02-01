/**
 * Teacher Assignment Templates Test
 *
 * Tests assignment templates functionality for teachers:
 * 1. List rendering - Verify templates table displays correctly
 * 2. Create template - Create a new assignment template
 * 3. Edit template - Edit an existing template
 * 4. Delete template - Delete a template
 * 5. Navigation - Navigate between templates pages
 * 6. Form validation - Verify required field validation
 *
 * Prerequisites:
 * - Admin user with is_teacher=true: p.romanczuk@gmail.com / test123_admin
 *
 * @tags @teacher @assignments @templates @crud
 */
import { test, expect } from '../../../fixtures';

// Test data with unique identifiers - shared across all tests in this suite
const timestamp = Date.now();
const testData = {
  title: `E2E Template ${timestamp}`,
  titleEdited: `E2E Template ${timestamp} EDITED`,
  description: 'E2E Test template description for teacher',
  descriptionEdited: 'E2E Test template description EDITED',
};

test.describe(
  'Teacher Assignment Templates',
  { tag: ['@teacher', '@assignments', '@templates'] },
  () => {
    // Set viewport to desktop to avoid mobile-hidden elements
    test.beforeEach(async ({ page, loginAs }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      // Login as admin (who has is_teacher=true)
      await loginAs('admin');
    });

    test.describe('List Rendering', () => {
      test('should display templates list page with header', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments/templates');
        await page.waitForLoadState('networkidle');

        // Verify we're on the templates page
        await expect(page).toHaveURL(/\/dashboard\/assignments\/templates/);

        // Verify header is displayed
        await expect(
          page.locator('h1:has-text("Assignment Templates")')
        ).toBeVisible();
        await expect(
          page.locator('text=A list of reusable assignment templates')
        ).toBeVisible();
      });

      test('should display "Create Template" button for teachers', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments/templates');
        await page.waitForLoadState('networkidle');

        // Verify "Create Template" button is visible
        const createButton = page.locator('a:has-text("Create Template")');
        await expect(createButton).toBeVisible();
        await expect(createButton).toHaveAttribute(
          'href',
          '/dashboard/assignments/templates/new'
        );
      });

      test('should display table or empty state', async ({ page }) => {
        await page.goto('/dashboard/assignments/templates');
        await page.waitForLoadState('networkidle');

        // Wait for loading to complete
        await page.waitForTimeout(1000);

        // Either table with templates or empty state should be visible
        const table = page.locator('table');
        const emptyState = page.locator('text=No templates');

        const hasTable = await table.isVisible().catch(() => false);
        const hasEmptyState = await emptyState.isVisible().catch(() => false);

        expect(hasTable || hasEmptyState).toBeTruthy();
      });

      test('should display table headers when templates exist', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments/templates');
        await page.waitForLoadState('networkidle');

        // Check if table is visible (might be empty state instead)
        const table = page.locator('table');
        const hasTable = await table.isVisible().catch(() => false);

        if (hasTable) {
          // Verify table headers
          await expect(page.locator('th:has-text("Title")')).toBeVisible();
          await expect(
            page.locator('th:has-text("Description")')
          ).toBeVisible();
        }
      });
    });

    test.describe('CRUD Operations', () => {
      test('1. CREATE: should create a new template', async ({ page }) => {
        await page.goto('/dashboard/assignments/templates/new');
        await page.waitForLoadState('networkidle');

        // Verify we're on the create page
        await expect(
          page.locator('h1:has-text("Create Assignment Template")')
        ).toBeVisible();

        // Wait for form to be ready
        const titleInput = page.locator('input#title');
        await titleInput.waitFor({ state: 'visible', timeout: 10000 });

        // Fill in template form - title
        await titleInput.clear();
        await titleInput.fill(testData.title);

        // Fill in template form - description
        const descriptionInput = page.locator('textarea#description');
        await descriptionInput.waitFor({ state: 'visible' });
        await descriptionInput.clear();
        await descriptionInput.fill(testData.description);

        // Submit the form
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeVisible();
        await expect(submitButton).toBeEnabled();
        await expect(submitButton).toHaveText('Create Template');
        await submitButton.click();

        // Should redirect to templates list
        await expect(page).toHaveURL('/dashboard/assignments/templates', {
          timeout: 15000,
        });
      });

      test('2. VERIFY CREATE: should find created template in list', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments/templates');
        await page.waitForLoadState('networkidle');

        // Wait for table to load
        await page.waitForSelector('table', { timeout: 10000 });

        // Look for the template title
        await expect(page.locator(`text=${testData.title}`)).toBeVisible({
          timeout: 10000,
        });
      });

      test('3. EDIT: should update the template', async ({ page }) => {
        await page.goto('/dashboard/assignments/templates');
        await page.waitForLoadState('networkidle');

        // Wait for table to load
        await page.waitForSelector('table', { timeout: 10000 });

        // Find the template row and click Edit link
        const templateRow = page.locator('tr', {
          has: page.locator(`text=${testData.title}`),
        });
        await expect(templateRow).toBeVisible();

        const editLink = templateRow.locator('a:has-text("Edit")');
        await editLink.click();

        // Should be on edit page
        await expect(page).toHaveURL(/\/dashboard\/assignments\/templates\/[^/]+$/);
        await page.waitForLoadState('networkidle');

        // Verify we're on the edit page
        await expect(
          page.locator('h1:has-text("Edit Assignment Template")')
        ).toBeVisible();

        // Update the title
        const titleInput = page.locator('input#title');
        await titleInput.waitFor({ state: 'visible', timeout: 10000 });
        await titleInput.clear();
        await titleInput.fill(testData.titleEdited);

        // Update the description
        const descriptionInput = page.locator('textarea#description');
        await descriptionInput.clear();
        await descriptionInput.fill(testData.descriptionEdited);

        // Save changes
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeVisible();
        await expect(submitButton).toBeEnabled();
        await expect(submitButton).toHaveText('Update Template');
        await submitButton.click();

        // Should redirect to templates list
        await expect(page).toHaveURL('/dashboard/assignments/templates', {
          timeout: 15000,
        });
      });

      test('4. VERIFY EDIT: should find edited template in list', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments/templates');
        await page.waitForLoadState('networkidle');

        // Wait for table to load
        await page.waitForSelector('table', { timeout: 10000 });

        // Verify edited title appears
        await expect(page.locator(`text=${testData.titleEdited}`)).toBeVisible({
          timeout: 10000,
        });

        // Original title should not exist
        await expect(page.locator(`td:has-text("${testData.title}")`)).not.toBeVisible();
      });

      test('5. DELETE: should delete the template', async ({ page }) => {
        await page.goto('/dashboard/assignments/templates');
        await page.waitForLoadState('networkidle');

        // Wait for table to load
        await page.waitForSelector('table', { timeout: 10000 });

        // Set up dialog handler for confirm dialog
        page.on('dialog', async (dialog) => {
          expect(dialog.type()).toBe('confirm');
          expect(dialog.message()).toContain('Are you sure');
          await dialog.accept();
        });

        // Find the template row and click Delete button
        const templateRow = page.locator('tr', {
          has: page.locator(`text=${testData.titleEdited}`),
        });
        await expect(templateRow).toBeVisible();

        const deleteButton = templateRow.locator('button:has-text("Delete")');
        await deleteButton.click();

        // Wait for page to refresh and verify deletion
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      });

      test('6. VERIFY DELETE: should not find deleted template in list', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments/templates');
        await page.waitForLoadState('networkidle');

        // Wait for page to load
        await page.waitForTimeout(1000);

        // Verify deleted template is not in the list
        await expect(
          page.locator(`td:has-text("${testData.titleEdited}")`)
        ).not.toBeVisible();
      });
    });

    test.describe('Navigation', () => {
      test('should navigate to create template page from list', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments/templates');
        await page.waitForLoadState('networkidle');

        // Click "Create Template" button
        const createButton = page.locator('a:has-text("Create Template")');
        await createButton.click();

        // Should navigate to new template page
        await expect(page).toHaveURL('/dashboard/assignments/templates/new');
      });

      test('should navigate back using Cancel button', async ({ page }) => {
        await page.goto('/dashboard/assignments/templates/new');
        await page.waitForLoadState('networkidle');

        // Click Cancel button
        const cancelButton = page.locator('button:has-text("Cancel")');
        await cancelButton.click();

        // Should navigate back to templates list
        await expect(page).toHaveURL('/dashboard/assignments/templates');
      });

      test('should navigate to templates page from assignments list', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Click "Templates" button
        const templatesButton = page.locator('a:has-text("Templates")');
        await templatesButton.click();

        // Should navigate to templates page
        await expect(page).toHaveURL('/dashboard/assignments/templates');
      });

      test('should display "Assign" link for each template', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments/templates');
        await page.waitForLoadState('networkidle');

        // Check if table is visible (might be empty state instead)
        const table = page.locator('table');
        const hasTable = await table.isVisible().catch(() => false);

        if (hasTable) {
          // Check for at least one row
          const templateRows = page.locator('table tbody tr');
          const rowCount = await templateRows.count();

          if (rowCount > 0) {
            // Each row should have an "Assign" link
            const firstRow = templateRows.first();
            const assignLink = firstRow.locator('a:has-text("Assign")');
            await expect(assignLink).toBeVisible();

            // Assign link should point to new assignment page with templateId
            await expect(assignLink).toHaveAttribute(
              'href',
              /\/dashboard\/assignments\/new\?templateId=/
            );
          }
        }
      });
    });

    test.describe('Form Validation', () => {
      test('should require title field', async ({ page }) => {
        await page.goto('/dashboard/assignments/templates/new');
        await page.waitForLoadState('networkidle');

        // Try to submit without filling title (but fill description)
        const descriptionInput = page.locator('textarea#description');
        await descriptionInput.fill('Test description');

        // Submit form
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Should stay on the page (HTML5 validation prevents submission)
        await expect(page).toHaveURL('/dashboard/assignments/templates/new');

        // Check that title input has required attribute
        const titleInput = page.locator('input#title');
        await expect(titleInput).toHaveAttribute('required', '');
      });

      test('should allow empty description', async ({ page }) => {
        await page.goto('/dashboard/assignments/templates/new');
        await page.waitForLoadState('networkidle');

        const uniqueTitle = `Empty Desc Template ${Date.now()}`;

        // Fill only title
        const titleInput = page.locator('input#title');
        await titleInput.fill(uniqueTitle);

        // Submit form
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Should redirect to templates list (description is optional)
        await expect(page).toHaveURL('/dashboard/assignments/templates', {
          timeout: 15000,
        });

        // Verify template was created
        await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible({
          timeout: 10000,
        });

        // Cleanup: delete the created template
        page.on('dialog', async (dialog) => {
          await dialog.accept();
        });

        const templateRow = page.locator('tr', {
          has: page.locator(`text=${uniqueTitle}`),
        });
        const deleteButton = templateRow.locator('button:has-text("Delete")');
        await deleteButton.click();
        await page.waitForLoadState('networkidle');
      });
    });

    test.describe('Access Control', () => {
      test('should allow admin to access templates page', async ({ page }) => {
        await page.goto('/dashboard/assignments/templates');
        await page.waitForLoadState('networkidle');

        // Should be on templates page, not redirected
        await expect(page).toHaveURL(/\/dashboard\/assignments\/templates/);
        await expect(
          page.locator('h1:has-text("Assignment Templates")')
        ).toBeVisible();
      });

      test('should allow admin to create templates', async ({ page }) => {
        await page.goto('/dashboard/assignments/templates/new');
        await page.waitForLoadState('networkidle');

        // Should be on new template page, not redirected
        await expect(page).toHaveURL(/\/dashboard\/assignments\/templates\/new/);
        await expect(
          page.locator('h1:has-text("Create Assignment Template")')
        ).toBeVisible();
      });
    });

    test.describe('Empty State', () => {
      test('should display empty state with create link when no templates', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments/templates');
        await page.waitForLoadState('networkidle');

        // Check if empty state is visible (only if no templates exist)
        const emptyState = page.locator('text=No templates');
        const hasEmptyState = await emptyState.isVisible().catch(() => false);

        if (hasEmptyState) {
          // Empty state should have a create link
          const createLink = page.locator(
            '.text-center a:has-text("Create Template")'
          );
          await expect(createLink).toBeVisible();
          await expect(createLink).toHaveAttribute(
            'href',
            '/dashboard/assignments/templates/new'
          );

          // Should also display helpful text
          await expect(
            page.locator('text=Get started by creating a new assignment template')
          ).toBeVisible();
        }
      });
    });

    test.describe('Error Handling', () => {
      test('should show 404 for non-existent template', async ({ page }) => {
        await page.goto(
          '/dashboard/assignments/templates/00000000-0000-0000-0000-000000000000'
        );
        await page.waitForLoadState('networkidle');

        // Should display 404 page
        const notFoundText = page.locator('text=/not found|404/i');
        await expect(notFoundText).toBeVisible();
      });
    });
  }
);

test.describe(
  'Student Assignment Templates Access',
  { tag: ['@student', '@assignments', '@templates', '@access'] },
  () => {
    test.beforeEach(async ({ page, loginAs }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      // Login as student
      await loginAs('student');
    });

    test('should redirect student away from templates page', async ({
      page,
    }) => {
      await page.goto('/dashboard/assignments/templates');
      await page.waitForLoadState('networkidle');

      // Student should be redirected to dashboard (not templates page)
      await expect(page).not.toHaveURL(/\/templates$/);
    });

    test('should redirect student away from create template page', async ({
      page,
    }) => {
      await page.goto('/dashboard/assignments/templates/new');
      await page.waitForLoadState('networkidle');

      // Student should be redirected (not on create page)
      await expect(page).not.toHaveURL(/\/templates\/new$/);
    });
  }
);
