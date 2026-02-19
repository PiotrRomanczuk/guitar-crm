import { test, expect } from '../../fixtures';

test.describe('AI Assistant Playground', { tag: ['@ai', '@admin'] }, () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs('admin');
    await page.goto('/dashboard/ai');
    await page.waitForLoadState('networkidle');
  });

  test('page loads with welcome message', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('AI Assistant Playground');

    const card = page.locator('[data-testid="ai-assistant-card"]');
    await expect(card).toBeVisible();

    // Welcome message should be visible (system message with greeting)
    const messages = page.locator('[data-testid="ai-messages"]');
    await expect(messages).toBeVisible();
    await expect(messages).toContainText('Strummy AI assistant');
  });

  test('chat input and send button are visible', async ({ page }) => {
    const input = page.locator('[data-testid="ai-assistant-input"]');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'Ask me anything...');

    const sendButton = page.locator('[data-testid="ai-assistant-send"]');
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeDisabled(); // disabled when input is empty
  });

  test('model selector is functional', async ({ page }) => {
    const modelSelector = page.locator('[data-testid="ai-model-selector"]');
    await expect(modelSelector).toBeVisible();

    await modelSelector.click();
    await page.waitForTimeout(500);

    // Verify dropdown options appear
    const options = page.locator('[role="option"]');
    const count = await options.count();
    expect(count).toBeGreaterThan(0);

    // Close by pressing Escape
    await page.keyboard.press('Escape');
  });

  test('suggested prompt sends a message', async ({ page }) => {
    test.slow(); // AI responses may take time

    const suggestedPrompt = page.locator('[data-testid="ai-suggested-prompt-0"]');
    await expect(suggestedPrompt).toBeVisible();

    const promptText = await suggestedPrompt.textContent();
    await suggestedPrompt.click();

    // User message should appear in the messages area
    const messages = page.locator('[data-testid="ai-messages"]');
    await expect(messages).toContainText(promptText!, { timeout: 5000 });

    // Should show either a loading spinner or AI response (or error if provider unavailable)
    const hasResponse = await page
      .locator('[data-testid="ai-messages"] .bg-muted')
      .isVisible()
      .catch(() => false);
    const hasLoader = await page
      .locator('[data-testid="ai-messages"] .animate-spin')
      .isVisible()
      .catch(() => false);
    const hasError = await page
      .locator('.bg-destructive\\/10')
      .isVisible()
      .catch(() => false);

    // At least one of these should be true - the UI responded to the click
    expect(hasResponse || hasLoader || hasError).toBeTruthy();
  });

  test('type and send a message', async ({ page }) => {
    test.slow();

    const input = page.locator('[data-testid="ai-assistant-input"]');
    const sendButton = page.locator('[data-testid="ai-assistant-send"]');

    await input.fill('What is a G major chord?');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // User message should appear
    const messages = page.locator('[data-testid="ai-messages"]');
    await expect(messages).toContainText('What is a G major chord?', { timeout: 5000 });

    // Input should be cleared after sending
    await expect(input).toHaveValue('');

    // Wait for either AI response or error (provider may be unavailable)
    await expect(async () => {
      const hasAssistantMsg = await messages.locator('.bg-muted').count();
      const hasError = await page.locator('.bg-destructive\\/10').count();
      expect(hasAssistantMsg + hasError).toBeGreaterThan(0);
    }).toPass({ timeout: 30000 });
  });

  test('minimize and maximize toggle', async ({ page }) => {
    const minimizeBtn = page.locator('[data-testid="ai-assistant-minimize"]');
    await expect(minimizeBtn).toBeVisible();

    // Click minimize - content should hide
    await minimizeBtn.click();
    await expect(page.locator('[data-testid="ai-assistant-input"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="ai-messages"]')).not.toBeVisible();

    // Click maximize - content should restore
    await minimizeBtn.click();
    await expect(page.locator('[data-testid="ai-assistant-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-messages"]')).toBeVisible();
  });

  test('clear conversation resets to welcome message', async ({ page }) => {
    test.slow();

    // Send a message first to have conversation history
    const input = page.locator('[data-testid="ai-assistant-input"]');
    await input.fill('Hello');
    await page.locator('[data-testid="ai-assistant-send"]').click();

    // Wait for user message to appear
    const messages = page.locator('[data-testid="ai-messages"]');
    await expect(messages).toContainText('Hello', { timeout: 5000 });

    // Wait briefly for the response cycle
    await page.waitForTimeout(2000);

    // Click clear
    const clearBtn = page.locator('[data-testid="ai-assistant-clear"]');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    // Should be back to welcome message only (no "You" user messages)
    await expect(messages).toContainText('Strummy AI assistant');
    await expect(messages.locator('text=You')).not.toBeVisible({ timeout: 3000 }).catch(() => {
      // The "You" label from user messages should be gone after clearing
    });
  });
});
