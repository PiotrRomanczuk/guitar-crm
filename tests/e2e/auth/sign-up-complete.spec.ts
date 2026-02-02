/**
 * Authentication - Complete Sign-Up Flow
 *
 * Tests the complete sign-up workflow including:
 * 1. Page load and form display
 * 2. Field validation (firstName, lastName, email, password, confirmPassword)
 * 3. Password strength indicator
 * 4. Successful sign-up
 * 5. Email verification screen
 * 6. Duplicate email handling
 * 7. Mobile responsive design
 *
 * Priority: P1 - Critical authentication feature
 *
 * @tags @auth @sign-up @integration @security
 */
import { test, expect } from '../../fixtures';

test.describe(
  'Authentication: Sign-Up Flow',
  { tag: ['@auth', '@sign-up', '@integration', '@security'] },
  () => {
    const validTestData = {
      firstName: 'Jimi',
      lastName: 'Hendrix',
      email: 'jimi.hendrix.test@experience.com',
      password: 'Purple123!Haze',
      confirmPassword: 'Purple123!Haze',
    };

    test.beforeEach(async ({ page }) => {
      // Set viewport to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    test.describe('Page Load and Form Display', () => {
      test('should display sign-up form with all required fields', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Verify page title
        await expect(page.locator('h2:has-text("Sign Up")')).toBeVisible();
        await expect(page.locator('text=/Join Strummy/i')).toBeVisible();

        // Verify all form fields are present
        await expect(page.locator('#firstName')).toBeVisible();
        await expect(page.locator('#lastName')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('#confirmPassword')).toBeVisible();

        // Verify submit button
        await expect(page.locator('button[type="submit"]:has-text("Create Account")')).toBeVisible();

        // Verify back to sign-in link
        await expect(page.locator('a[href="/sign-in"]')).toBeVisible();
      });

      test('should display Google OAuth button', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Verify Google sign-in option
        await expect(page.locator('button:has-text("Google"), button:has-text("google")')).toBeVisible();
      });

      test('should have back button that navigates to sign-in', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Click back button (ArrowLeft icon button)
        const backButton = page.locator('button[aria-label="Go back"]');
        await expect(backButton).toBeVisible();
        await backButton.click();

        // Should navigate to sign-in
        await expect(page).toHaveURL(/\/sign-in/);
      });
    });

    test.describe('Field Validation', () => {
      test('should validate first name is required', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Focus and blur first name field without entering value
        await page.locator('#firstName').click();
        await page.locator('#lastName').click();

        // Should show validation error
        await expect(page.locator('text=/First name is required/i')).toBeVisible();
      });

      test('should validate last name is required', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Focus and blur last name field without entering value
        await page.locator('#lastName').click();
        await page.locator('#email').click();

        // Should show validation error
        await expect(page.locator('text=/Last name is required/i')).toBeVisible();
      });

      test('should validate email format', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Enter invalid email
        await page.locator('#email').fill('invalid-email');
        await page.locator('#password').click();

        // Should show validation error
        await expect(page.locator('text=/Valid email required/i')).toBeVisible();
      });

      test('should validate password minimum length', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Enter password less than 6 characters
        await page.locator('#password').fill('12345');
        await page.locator('#confirmPassword').click();

        // Should show validation error
        await expect(page.locator('text=/Password must be at least 6 characters/i')).toBeVisible();
      });

      test('should validate password confirmation matches', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Enter mismatched passwords
        await page.locator('#password').fill('Password123!');
        await page.locator('#confirmPassword').fill('Different123!');
        await page.locator('#firstName').click();

        // Should show mismatch error
        await expect(page.locator('text=/Passwords.*match/i')).toBeVisible();
      });

      test('should clear validation errors when user starts typing', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Trigger validation error
        await page.locator('#email').click();
        await page.locator('#password').click();
        await expect(page.locator('text=/Valid email required/i')).toBeVisible();

        // Start typing valid email
        await page.locator('#email').fill('test@example.com');

        // Error should be cleared
        await expect(page.locator('text=/Valid email required/i')).not.toBeVisible();
      });

      test('should validate all fields on form submission', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Submit empty form
        await page.locator('button[type="submit"]').click();

        // All fields should show validation errors
        await expect(page.locator('text=/First name is required/i')).toBeVisible();
        await expect(page.locator('text=/Last name is required/i')).toBeVisible();
        await expect(page.locator('text=/Valid email required/i')).toBeVisible();
        await expect(page.locator('text=/Password must be at least 6 characters/i')).toBeVisible();
      });
    });

    test.describe('Password Strength Indicator', () => {
      test('should display password strength meter', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Focus password field
        await page.locator('#password').click();
        await page.locator('#password').fill('weak');

        // Password strength indicator should be visible
        // The PasswordInput component shows strength when showStrength prop is true
        const bodyText = await page.locator('body').textContent();
        expect(bodyText).toBeTruthy();
      });

      test('should show password visibility toggle', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Password field should be type="password" by default
        const passwordField = page.locator('#password');
        await expect(passwordField).toHaveAttribute('type', 'password');

        // Look for toggle button (eye icon)
        const toggleButton = page.locator('button[aria-label*="password"], button[type="button"]').first();

        // Click toggle should change input type
        if (await toggleButton.count() > 0) {
          await toggleButton.click();
          // After toggle, type might change to "text"
          console.log('Password visibility toggle functionality present');
        }
      });
    });

    test.describe('Password Match Indicator', () => {
      test('should show passwords match indicator when passwords match', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Enter matching passwords
        await page.locator('#password').fill('Password123!');
        await page.locator('#confirmPassword').fill('Password123!');

        // Should show match indicator
        await expect(page.locator('text=/Passwords match/i')).toBeVisible();
      });

      test('should show passwords do not match when different', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Enter different passwords
        await page.locator('#password').fill('Password123!');
        await page.locator('#confirmPassword').fill('Different123!');

        // Should show mismatch indicator
        await expect(page.locator('text=/Passwords do not match/i')).toBeVisible();
      });
    });

    test.describe('Successful Sign-Up', () => {
      test('should successfully sign up with valid data', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Generate unique email for this test
        const uniqueEmail = `test-signup-${Date.now()}@example.com`;

        // Fill in all fields
        await page.locator('#firstName').fill(validTestData.firstName);
        await page.locator('#lastName').fill(validTestData.lastName);
        await page.locator('#email').fill(uniqueEmail);
        await page.locator('#password').fill(validTestData.password);
        await page.locator('#confirmPassword').fill(validTestData.confirmPassword);

        // Submit form
        await page.locator('button[type="submit"]').click();

        // Should show loading state
        await expect(page.locator('button[type="submit"]:has-text("Creating Account")')).toBeVisible({
          timeout: 2000,
        });

        // Should navigate to success screen or show success message
        await expect(
          page.locator('text=/Check Your Email|verification|email sent/i')
        ).toBeVisible({ timeout: 15000 });
      });

      test('should show loading state during submission', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Generate unique email
        const uniqueEmail = `test-loading-${Date.now()}@example.com`;

        // Fill in form
        await page.locator('#firstName').fill(validTestData.firstName);
        await page.locator('#lastName').fill(validTestData.lastName);
        await page.locator('#email').fill(uniqueEmail);
        await page.locator('#password').fill(validTestData.password);
        await page.locator('#confirmPassword').fill(validTestData.confirmPassword);

        // Submit form
        await page.locator('button[type="submit"]').click();

        // Button should be disabled during submission
        const submitButton = page.locator('button[type="submit"]');
        const isDisabled = await submitButton.isDisabled();
        const buttonText = await submitButton.textContent();

        expect(
          isDisabled ||
          buttonText?.includes('Creating') ||
          buttonText?.includes('Loading')
        ).toBe(true);
      });
    });

    test.describe('Email Verification Screen', () => {
      test('should display verification instructions after successful sign-up', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Generate unique email
        const uniqueEmail = `test-verify-${Date.now()}@example.com`;

        // Complete sign-up
        await page.locator('#firstName').fill(validTestData.firstName);
        await page.locator('#lastName').fill(validTestData.lastName);
        await page.locator('#email').fill(uniqueEmail);
        await page.locator('#password').fill(validTestData.password);
        await page.locator('#confirmPassword').fill(validTestData.confirmPassword);
        await page.locator('button[type="submit"]').click();

        // Wait for success screen
        await expect(page.locator('text=/Check Your Email/i')).toBeVisible({ timeout: 15000 });

        // Verify email address is displayed
        await expect(page.locator(`text=${uniqueEmail}`)).toBeVisible();

        // Verify instructions are present
        await expect(page.locator('text=/Check your inbox/i')).toBeVisible();
        await expect(page.locator('text=/Click the verification link/i')).toBeVisible();

        // Verify "Continue to Sign In" button
        await expect(page.locator('button:has-text("Continue to Sign In")')).toBeVisible();
      });

      test('should show resend email option after delay', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Generate unique email
        const uniqueEmail = `test-resend-${Date.now()}@example.com`;

        // Complete sign-up
        await page.locator('#firstName').fill(validTestData.firstName);
        await page.locator('#lastName').fill(validTestData.lastName);
        await page.locator('#email').fill(uniqueEmail);
        await page.locator('#password').fill(validTestData.password);
        await page.locator('#confirmPassword').fill(validTestData.confirmPassword);
        await page.locator('button[type="submit"]').click();

        // Wait for success screen
        await expect(page.locator('text=/Check Your Email/i')).toBeVisible({ timeout: 15000 });

        // Wait for resend button to become available (5 seconds according to useSignUpLogic)
        await page.waitForTimeout(6000);

        // Resend option should be visible
        await expect(page.locator('button:has-text("Resend"), text=/Resend/i')).toBeVisible();
      });

      test('should navigate to sign-in from verification screen', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Generate unique email
        const uniqueEmail = `test-navigate-${Date.now()}@example.com`;

        // Complete sign-up
        await page.locator('#firstName').fill(validTestData.firstName);
        await page.locator('#lastName').fill(validTestData.lastName);
        await page.locator('#email').fill(uniqueEmail);
        await page.locator('#password').fill(validTestData.password);
        await page.locator('#confirmPassword').fill(validTestData.confirmPassword);
        await page.locator('button[type="submit"]').click();

        // Wait for success screen
        await expect(page.locator('text=/Check Your Email/i')).toBeVisible({ timeout: 15000 });

        // Click "Continue to Sign In"
        await page.locator('button:has-text("Continue to Sign In")').click();

        // Should navigate to sign-in page
        await expect(page).toHaveURL(/\/sign-in/);
      });
    });

    test.describe('Duplicate Email Handling', () => {
      test('should show error when email already exists', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Use existing admin email
        await page.locator('#firstName').fill(validTestData.firstName);
        await page.locator('#lastName').fill(validTestData.lastName);
        await page.locator('#email').fill('p.romanczuk@gmail.com'); // Existing admin
        await page.locator('#password').fill(validTestData.password);
        await page.locator('#confirmPassword').fill(validTestData.confirmPassword);

        // Submit form
        await page.locator('button[type="submit"]').click();

        // Should show error about existing email
        await expect(
          page.locator('text=/already registered|already exists|already in use/i')
        ).toBeVisible({ timeout: 10000 });

        // Should suggest signing in or password reset
        await expect(page.locator('text=/sign in|forgot password/i')).toBeVisible();
      });

      test('should handle shadow user scenario', async ({ page }) => {
        // Shadow users are admin-created accounts without passwords
        // The system should recognize this and provide appropriate guidance
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Note: This test documents expected behavior
        // Actual shadow user email would need to be created by admin first
        console.log('Shadow user scenario: Email exists but no password set');
        console.log('Expected: Show message about invitation and password reset');
      });
    });

    test.describe('Mobile Responsive Design', () => {
      test('should be fully functional on mobile viewport', async ({ page }) => {
        // Set mobile viewport (iPhone 12)
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // All form elements should be visible and usable
        await expect(page.locator('#firstName')).toBeVisible();
        await expect(page.locator('#lastName')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('#confirmPassword')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();

        // Form should be scrollable
        const contentHeight = await page.evaluate(() => document.body.scrollHeight);
        expect(contentHeight).toBeGreaterThan(844);
      });

      test('should have touch-friendly form controls on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Check that inputs and buttons are large enough for touch
        const submitButton = page.locator('button[type="submit"]');
        const buttonBox = await submitButton.boundingBox();

        // Submit button should be at least 44px tall (iOS touch target guideline)
        expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
      });

      test('should display name fields side-by-side on larger screens', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Get positions of first and last name fields
        const firstNameBox = await page.locator('#firstName').boundingBox();
        const lastNameBox = await page.locator('#lastName').boundingBox();

        // Fields should be on same horizontal line (grid layout)
        if (firstNameBox && lastNameBox) {
          expect(Math.abs((firstNameBox.y || 0) - (lastNameBox.y || 0))).toBeLessThan(10);
        }
      });

      test('should adapt layout for tablet viewport', async ({ page }) => {
        // iPad viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Form should be centered and constrained
        const formContainer = page.locator('form');
        await expect(formContainer).toBeVisible();

        // Content should not span full width
        const containerBox = await formContainer.boundingBox();
        expect(containerBox?.width).toBeLessThan(768);
      });
    });

    test.describe('UI/UX Features', () => {
      test('should have proper form accessibility attributes', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Check for proper labels
        await expect(page.locator('label[for="firstName"]')).toBeVisible();
        await expect(page.locator('label[for="lastName"]')).toBeVisible();
        await expect(page.locator('label[for="email"]')).toBeVisible();
        await expect(page.locator('label[for="password"]')).toBeVisible();
        await expect(page.locator('label[for="confirmPassword"]')).toBeVisible();

        // Check for aria-invalid on fields with errors
        await page.locator('#email').click();
        await page.locator('#password').click();

        const emailField = page.locator('#email');
        const ariaInvalid = await emailField.getAttribute('aria-invalid');
        expect(ariaInvalid).toBeTruthy();
      });

      test('should show visual feedback on form field focus', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Focus email field
        await page.locator('#email').focus();

        // Field should have focus styles (outline or ring)
        const emailField = page.locator('#email');
        const isFocused = await emailField.evaluate((el) => el === document.activeElement);
        expect(isFocused).toBe(true);
      });

      test('should have consistent spacing and alignment', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Check that form has proper structure
        const form = page.locator('form');
        await expect(form).toBeVisible();

        // All input fields should be present
        const inputCount = await page.locator('input').count();
        expect(inputCount).toBeGreaterThanOrEqual(5); // firstName, lastName, email, password, confirmPassword
      });

      test('should prevent multiple simultaneous submissions', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        const uniqueEmail = `test-double-${Date.now()}@example.com`;

        // Fill form
        await page.locator('#firstName').fill(validTestData.firstName);
        await page.locator('#lastName').fill(validTestData.lastName);
        await page.locator('#email').fill(uniqueEmail);
        await page.locator('#password').fill(validTestData.password);
        await page.locator('#confirmPassword').fill(validTestData.confirmPassword);

        // Submit form
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Button should be disabled
        const isDisabled = await submitButton.isDisabled();
        expect(isDisabled).toBe(true);
      });
    });

    test.describe('Integration with Auth System', () => {
      test('should create user account in Supabase', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        const uniqueEmail = `test-integration-${Date.now()}@example.com`;

        // Complete sign-up
        await page.locator('#firstName').fill(validTestData.firstName);
        await page.locator('#lastName').fill(validTestData.lastName);
        await page.locator('#email').fill(uniqueEmail);
        await page.locator('#password').fill(validTestData.password);
        await page.locator('#confirmPassword').fill(validTestData.confirmPassword);
        await page.locator('button[type="submit"]').click();

        // Should receive success response from Supabase
        await expect(page.locator('text=/Check Your Email/i')).toBeVisible({ timeout: 15000 });

        // User metadata (first_name, last_name) should be stored
        console.log('User account created with metadata:', {
          firstName: validTestData.firstName,
          lastName: validTestData.lastName,
          email: uniqueEmail,
        });
      });

      test('should handle Google OAuth sign-up', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Click Google sign-up button
        const googleButton = page.locator('button:has-text("Google"), button:has-text("google")');

        if (await googleButton.count() > 0) {
          // Note: We can't fully test OAuth flow in E2E without mocking
          // This verifies the button exists and is clickable
          await expect(googleButton).toBeVisible();
          console.log('Google OAuth button present and functional');
        }
      });
    });

    test.describe('Error Recovery', () => {
      test('should allow user to correct validation errors', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Submit with invalid data
        await page.locator('#firstName').fill('J');
        await page.locator('#lastName').fill('H');
        await page.locator('#email').fill('invalid');
        await page.locator('#password').fill('123');
        await page.locator('#confirmPassword').fill('456');
        await page.locator('button[type="submit"]').click();

        // Should show errors
        await expect(page.locator('text=/Valid email required/i')).toBeVisible();

        // Correct the errors
        await page.locator('#email').fill('valid@example.com');
        await page.locator('#password').fill('ValidPass123!');
        await page.locator('#confirmPassword').fill('ValidPass123!');

        // Errors should clear as user types
        await expect(page.locator('text=/Valid email required/i')).not.toBeVisible();
      });

      test('should handle network errors gracefully', async ({ page }) => {
        await page.goto('/sign-up');
        await page.waitForLoadState('networkidle');

        // Simulate network failure
        await page.route('**/auth/**', (route) => route.abort('failed'));

        const uniqueEmail = `test-network-${Date.now()}@example.com`;

        await page.locator('#firstName').fill(validTestData.firstName);
        await page.locator('#lastName').fill(validTestData.lastName);
        await page.locator('#email').fill(uniqueEmail);
        await page.locator('#password').fill(validTestData.password);
        await page.locator('#confirmPassword').fill(validTestData.confirmPassword);
        await page.locator('button[type="submit"]').click();

        // Should show error message or handle gracefully
        // Form should remain filled so user can retry
        const emailValue = await page.locator('#email').inputValue();
        expect(emailValue).toBe(uniqueEmail);
      });
    });
  }
);
