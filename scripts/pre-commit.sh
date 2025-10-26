#!/bin/bash

# Pre-commit Hook Script
# Runs before every git commit to ensure code quality

set -e

echo "🔍 PRE-COMMIT CHECKS"
echo "==================="

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
    echo "ℹ️  No TypeScript/JavaScript files to check"
    exit 0
fi

echo "📁 Checking staged files:"
echo "$STAGED_FILES" | sed 's/^/  • /'
echo ""

# 1. Run ESLint on staged files
echo "🧹 Running ESLint on staged files..."
if echo "$STAGED_FILES" | xargs npm run lint --; then
    echo "✅ ESLint passed"
else
    echo "❌ ESLint failed. Please fix the issues and try again."
    exit 1
fi

# 2. Run TypeScript type checking
echo ""
echo "🔧 Running TypeScript type check..."
if npx tsc --noEmit; then
    echo "✅ TypeScript types are valid"
else
    echo "❌ TypeScript type errors found. Please fix and try again."
    exit 1
fi

# 3. Run tests related to changed files
echo ""
echo "🧪 Running tests for changed files..."
if npm test -- --passWithNoTests --findRelatedTests $STAGED_FILES --watchAll=false; then
    echo "✅ All related tests passed"
else
    echo "❌ Tests failed. Please fix the issues and try again."
    exit 1
fi

# 4. Check for forbidden patterns
echo ""
echo "🚫 Checking for forbidden patterns..."
FORBIDDEN_PATTERNS=(
    "console\.log"
    "debugger"
    "TODO:"
    "FIXME:"
    "xxx"
    "\.only\("
    "\.skip\("
)

VIOLATIONS=0
for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
    if echo "$STAGED_FILES" | xargs grep -l "$pattern" 2>/dev/null; then
        echo "❌ Found forbidden pattern: $pattern"
        echo "$STAGED_FILES" | xargs grep -n "$pattern" 2>/dev/null | head -5
        VIOLATIONS=$((VIOLATIONS + 1))
    fi
done

if [ $VIOLATIONS -gt 0 ]; then
    echo ""
    echo "❌ Found $VIOLATIONS forbidden patterns. Please remove them and try again."
    echo ""
    echo "To temporarily bypass this check, use: git commit --no-verify"
    exit 1
fi

echo "✅ No forbidden patterns found"

# 5. Check commit message format (if provided)
COMMIT_MSG_FILE="$1"
if [ -n "$COMMIT_MSG_FILE" ] && [ -f "$COMMIT_MSG_FILE" ]; then
    COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")
    
    # Check if commit message follows conventional commits format
    if ! echo "$COMMIT_MSG" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"; then
        echo ""
        echo "⚠️  Commit message doesn't follow conventional commits format"
        echo "Expected format: type(scope): description"
        echo "Examples:"
        echo "  feat: add user authentication"
        echo "  fix(database): resolve connection timeout"
        echo "  docs: update API documentation"
        echo ""
        echo "Types: feat, fix, docs, style, refactor, test, chore"
    fi
fi

echo ""
echo "🎉 All pre-commit checks passed!"
echo "Your code is ready to be committed."