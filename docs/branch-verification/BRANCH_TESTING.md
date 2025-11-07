# Branch-Based Test Organization System 🧪

This system allows you to run only the tests that are relevant to your current branch or feature, improving development efficiency and reducing test execution time.

## 📋 Quick Reference

### Common Commands

```bash
# Run tests for current branch
npm run test:branch

# Run tests with watch mode for current branch
npm run test:branch:watch

# Run tests with coverage for current branch
npm run test:branch:coverage

# List all available categories and branch mappings
npm run test:categories

# Run tests for specific category
./scripts/test-branch.sh auth
./scripts/test-branch.sh core
./scripts/test-branch.sh admin

# Run with options
./scripts/test-branch.sh auth --watch
./scripts/test-branch.sh --coverage
```

## 🏗️ System Architecture

### Test Categories

The system organizes tests into logical categories with dependencies:

- **`core`** - Foundation tests (schemas, setup) - Always included
- **`auth`** - Authentication/authorization tests - Depends on: core
- **`navigation`** - Navigation/layout tests - Depends on: core, auth
- **`admin`** - Admin functionality tests - Depends on: core, auth, navigation
- **`songs`** - Song management tests - Depends on: core, auth
- **`lessons`** - Lesson management tests - Depends on: core, auth, songs
- **`ui`** - UI components tests - Depends on: core

### Branch Mappings

Each branch automatically runs relevant test categories:

```
main                          -> core
feature/authorization         -> core, auth
feature/admin-user-management -> core, auth, navigation, admin
feature/song-management       -> core, auth, songs
feature/lesson-management     -> core, auth, songs, lessons
feature/ui-components         -> core, ui
feature/navigation            -> core, auth, navigation
feature/user-management       -> core, auth, admin
```

## 🎯 Benefits

### Development Efficiency

- **Faster feedback loops** - Run only relevant tests
- **Reduced noise** - No irrelevant test failures
- **Branch-specific focus** - Only test what you're working on

### Performance Improvements

```bash
# Full test suite: ~3-4 seconds, 110 tests
npm test

# Core only: ~0.8 seconds, 10 tests
./scripts/test-branch.sh core

# Auth category: ~3.8 seconds, 104 tests
./scripts/test-branch.sh auth
```

### Smart Dependencies

- Dependencies are automatically included
- No need to remember which tests depend on what
- Ensures foundational tests always run

## 📁 Configuration

### jest.config.branches.json

Main configuration file defining:

- Test categories and their patterns
- Dependency relationships
- Branch mappings

Example category definition:

```json
{
	"testCategories": {
		"admin": {
			"description": "Admin functionality tests",
			"patterns": ["__tests__/components/admin", "__tests__/app/admin"],
			"dependencies": ["core", "auth", "navigation"],
			"branches": ["feature/admin-user-management", "feature/admin"]
		}
	}
}
```

### Pattern Matching

Uses Jest's `testPathPattern` for efficient filtering:

- Patterns match directory paths
- Automatically includes subdirectories and files
- Dependencies are resolved recursively

## 🚀 Usage Examples

### During Feature Development

```bash
# Start working on admin features
git checkout feature/admin-user-management

# Run relevant tests automatically
npm run test:branch:watch

# Only runs: core + auth + navigation + admin tests
# Skips: songs, lessons, ui tests
```

### Testing Specific Areas

```bash
# Only test authentication
./scripts/test-branch.sh auth
# Runs: core + auth (104 tests)

# Only test core functionality
./scripts/test-branch.sh core
# Runs: setup + schemas (10 tests)

# Test admin with coverage
./scripts/test-branch.sh admin --coverage
# Runs: core + auth + navigation + admin with coverage
```

### Integration with TDD

```bash
# TDD workflow now uses branch-specific tests
npm run tdd

# Automatically runs:
# 1. Shows TDD reminder
# 2. Starts watch mode for current branch's test categories
# 3. Only re-runs relevant tests on file changes
```

## 🔧 Adding New Categories

### 1. Add to Configuration

Edit `jest.config.branches.json`:

```json
{
	"testCategories": {
		"newFeature": {
			"description": "New feature tests",
			"patterns": [
				"__tests__/components/newFeature",
				"__tests__/app/newFeature"
			],
			"dependencies": ["core", "auth"],
			"branches": ["feature/new-feature"]
		}
	},
	"branchMapping": {
		"feature/new-feature": ["core", "auth", "newFeature"]
	}
}
```

### 2. Create Test Directory Structure

```bash
mkdir -p __tests__/components/newFeature
mkdir -p __tests__/app/newFeature
```

### 3. Test the Configuration

```bash
# Verify category is recognized
npm run test:categories

# Test the new category
./scripts/test-branch.sh newFeature
```

## 🧪 Integration with Existing Workflow

### Replaces Standard Commands

Old workflow:

```bash
npm test              # Runs ALL tests always
npm run test:watch    # Watches ALL tests always
```

New workflow:

```bash
npm run test:branch         # Runs branch-relevant tests
npm run test:branch:watch   # Watches branch-relevant tests
npm run test:branch:coverage # Branch tests with coverage
```

### Backwards Compatibility

Original commands still work:

```bash
npm test          # Still runs full test suite
npm run test:watch # Still watches all tests
```

### Updated TDD Workflow

The `npm run tdd` command now:

1. Shows TDD reminder
2. Automatically runs `test:branch:watch` instead of `test:watch`
3. Only watches tests relevant to your current branch

## 🎛️ Advanced Usage

### Multiple Categories

```bash
# Test multiple specific categories (if needed)
# Note: Dependencies are automatically included
./scripts/test-branch.sh songs --verbose
```

### Debugging

```bash
# Verbose output to see pattern matching
./scripts/test-branch.sh --verbose

# See exactly which patterns are being used
./scripts/test-branch.sh auth --verbose
```

### Custom Patterns

For special cases, you can still use Jest directly:

```bash
# Test specific files
npx jest __tests__/components/auth/SignInForm.test.tsx

# Test with custom pattern
npx jest --testPathPattern="SignIn|SignUp"
```

## 📊 Performance Comparison

| Command                       | Time  | Tests | Use Case             |
| ----------------------------- | ----- | ----- | -------------------- |
| `npm test`                    | ~3.4s | 110   | Full validation      |
| `npm run test:branch` (core)  | ~0.8s | 10    | Schema/setup changes |
| `npm run test:branch` (auth)  | ~3.8s | 104   | Auth feature work    |
| `npm run test:branch` (admin) | ~3.5s | 110   | Admin feature work   |

## 🔄 Migration Guide

### For Existing Branches

If you're on a branch not in the mapping:

```bash
# Falls back to 'core' category
npm run test:branch  # Runs core tests only

# Or specify manually
./scripts/test-branch.sh auth
```

### For New Features

1. Create feature branch with descriptive name
2. Add branch mapping to config if needed
3. Use `npm run test:branch:watch` for development
4. Use `npm run test:branch:coverage` before commits

This system makes testing faster, more focused, and aligns with the branch-based development workflow while maintaining full backwards compatibility.
