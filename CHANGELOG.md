# Changelog

All notable changes to Strummy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Enhanced CLAUDE.md with comprehensive development workflow
- Added Linear integration guidelines
- Created CHANGELOG.md for version tracking

## [0.65.0] - 2026-02-09

### Added
- Notification system with email templates
- Student welcome emails
- Lesson reminder notifications
- Assignment due reminders
- Song mastery achievement notifications
- Teacher daily summary emails
- Weekly progress digest for students
- Notification service with tests
- Database migrations for notification system

### Fixed
- CI security test failures
- Lint errors in authentication pages
- Teacher isolation test suite
- Cleanup test helper functions

### Changed
- Improved Playwright test configuration
- Enhanced password input component
- Updated test cleanup procedures

## [0.64.0] - 2026-02-08

### Added
- Calendar conflict resolution feature
- Claude Code Review GitHub Actions workflow
- Claude PR Assistant GitHub Actions workflow

## How to Update This File

When making changes to the codebase:

1. Add your changes under `[Unreleased]` section
2. Use these categories:
   - **Added** for new features
   - **Changed** for changes in existing functionality
   - **Deprecated** for soon-to-be removed features
   - **Removed** for now removed features
   - **Fixed** for any bug fixes
   - **Security** for vulnerability fixes

3. Include Linear ticket ID in square brackets:
   ```markdown
   ### Added
   - Lesson reminder system [STRUM-123]
   - User notification preferences [STRUM-123]
   ```

4. When releasing a version, move `[Unreleased]` items to a new version section:
   ```markdown
   ## [0.66.0] - 2026-02-10
   ```

## Version Numbering

- **MAJOR** (X.0.0): Breaking changes, major rewrites
- **MINOR** (0.X.0): New features, enhancements
- **PATCH** (0.0.X): Bug fixes, small improvements

Always update this file when bumping version in `package.json`.
