---
name: webapp-testing
description: Web application testing toolkit using Playwright for E2E testing. Use when writing automated tests for the Guitar CRM application, testing user flows, or debugging UI issues. Complements existing Cypress tests with Playwright capabilities.
---

# Web Application Testing Toolkit

## Overview

Test Guitar CRM web application using Playwright for comprehensive E2E testing. Use alongside existing Cypress tests for enhanced coverage.

## Quick Start with Playwright

```python
from playwright.sync_api import sync_playwright

def test_login_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to login
        page.goto("http://localhost:3000/login")

        # Wait for page to be ready
        page.wait_for_load_state('networkidle')

        # Fill login form
        page.fill('input[name="email"]', 'student@example.com')
        page.fill('input[name="password"]', 'test123_student')
        page.click('button[type="submit"]')

        # Verify redirect to dashboard
        page.wait_for_url('**/dashboard**')
        assert 'dashboard' in page.url

        browser.close()
```

## Testing Patterns for Guitar CRM

### Test Student Dashboard

```python
def test_student_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Login as student
        login_as_student(page)

        # Check dashboard elements
        page.wait_for_selector('[data-testid="upcoming-lessons"]')
        page.wait_for_selector('[data-testid="song-progress"]')

        # Verify lesson cards
        lessons = page.query_selector_all('[data-testid="lesson-card"]')
        assert len(lessons) > 0

        browser.close()
```

### Test Song Progress Updates

```python
def test_song_status_change():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        login_as_teacher(page)

        # Navigate to student songs
        page.goto("http://localhost:3000/dashboard/students/1/songs")
        page.wait_for_load_state('networkidle')

        # Change song status
        page.click('[data-testid="song-row"]:first-child [data-testid="status-select"]')
        page.click('text=Started')

        # Verify update
        page.wait_for_selector('text=Status updated')

        browser.close()
```

### Test Lesson Scheduling

```python
def test_schedule_lesson():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        login_as_teacher(page)

        # Open new lesson form
        page.goto("http://localhost:3000/dashboard/lessons/new")
        page.wait_for_load_state('networkidle')

        # Fill form
        page.select_option('[name="student_id"]', label='Test Student')
        page.fill('[name="date"]', '2024-02-15')
        page.fill('[name="time"]', '14:00')
        page.fill('[name="duration"]', '60')

        # Submit
        page.click('button[type="submit"]')

        # Verify success
        page.wait_for_url('**/lessons**')

        browser.close()
```

## Helper Functions

```python
def login_as_student(page):
    page.goto("http://localhost:3000/login")
    page.fill('input[name="email"]', 'student@example.com')
    page.fill('input[name="password"]', 'test123_student')
    page.click('button[type="submit"]')
    page.wait_for_url('**/dashboard**')

def login_as_teacher(page):
    page.goto("http://localhost:3000/login")
    page.fill('input[name="email"]', 'teacher@example.com')
    page.fill('input[name="password"]', 'test123_teacher')
    page.click('button[type="submit"]')
    page.wait_for_url('**/dashboard**')

def login_as_admin(page):
    page.goto("http://localhost:3000/login")
    page.fill('input[name="email"]', 'p.romanczuk@gmail.com')
    page.fill('input[name="password"]', 'test123_admin')
    page.click('button[type="submit"]')
    page.wait_for_url('**/dashboard**')
```

## Screenshot and Debug

```python
def debug_page_state(page, name="debug"):
    # Take screenshot
    page.screenshot(path=f"screenshots/{name}.png")

    # Log current URL
    print(f"Current URL: {page.url}")

    # Log page content
    print(page.content()[:500])
```

## Best Practices

1. **Wait for network idle** before interactions: `page.wait_for_load_state('networkidle')`
2. **Use data-testid** attributes for reliable selectors
3. **Handle async operations** with proper waits
4. **Clean up test data** after tests complete
5. **Run headless in CI**, headed for debugging

## Dependencies

Install with: `pip install playwright && playwright install`

## Integration with Existing Cypress Tests

This skill complements the existing Cypress E2E tests in `/cypress`. Use Playwright for:
- Python-based test automation
- Cross-browser testing (Chromium, Firefox, WebKit)
- API testing alongside UI tests
- Visual regression testing
