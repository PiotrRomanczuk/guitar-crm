#!/bin/bash

# Script to create a new feature branch
# Usage: ./scripts/new-feature.sh feature-name

if [ $# -eq 0 ]; then
    echo "Usage: $0 <feature-name>"
    echo "Example: $0 user-authentication"
    exit 1
fi

FEATURE_NAME=$1

# Check for unstaged changes
echo "Checking for unstaged changes..."
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: You have unstaged changes in your working directory."
    echo ""
    echo "Please commit or stash your changes before creating a new feature branch:"
    echo "• To commit: git add . && git commit -m 'Your commit message'"
    echo "• To stash: git stash"
    echo ""
    echo "Current unstaged changes:"
    git status --porcelain
    exit 1
fi

# Check for staged but uncommitted changes
if ! git diff-index --quiet --cached HEAD --; then
    echo "❌ Error: You have staged but uncommitted changes."
    echo ""
    echo "Please commit your staged changes before creating a new feature branch:"
    echo "• To commit: git commit -m 'Your commit message'"
    echo ""
    echo "Current staged changes:"
    git diff --cached --name-only
    exit 1
fi

echo "✅ Working directory is clean"

# Ensure we're on main branch and it's up to date
echo "Switching to main branch..."
git checkout main

echo "Pulling latest changes..."
git pull origin main 2>/dev/null || echo "No remote configured yet"

# Create and switch to new feature branch
echo "Creating feature branch: feature/$FEATURE_NAME"
git checkout -b "feature/$FEATURE_NAME"

echo "✅ Feature branch 'feature/$FEATURE_NAME' created successfully!"
echo ""
echo "🧪 TDD WORKFLOW REMINDER:"
echo "This project follows Test-Driven Development (TDD) practices."
echo ""
echo "TDD Cycle (Red-Green-Refactor):"
echo "1. 📝 Write a failing test first"
echo "2. ✅ Write minimal code to make the test pass"
echo "3. 🔄 Refactor the code while keeping tests green"
echo ""
echo "Commands to get started:"
echo "• Run tests: npm test"
echo "• Run tests in watch mode: npm test -- --watch"
echo "• Create test file: touch __tests__/[feature]/$FEATURE_NAME.test.ts"
echo ""
echo "🧩 SMALL COMPONENTS POLICY:"
echo "Always split UI and logic into the smallest reasonable, composable pieces."
echo "• Favor many tiny components over a monolith"
echo "• Extract presentational pieces from containers"
echo "• Co-locate hooks/helpers next to usage (useX.ts, X.helpers.ts)"
echo "• Keep files < 300 LOC and functions < 80 LOC"
echo "• Place tests under __tests__/components mirroring structure"
echo ""
echo "📋 PREREQUISITES:"
echo "• Working directory must be clean (no unstaged/uncommitted changes)"
echo "• Script will check git status before creating branch"
echo ""
echo "When ready to merge:"
echo "1. Ensure all tests pass: npm test"
echo "2. git add ."
echo "3. git commit -m 'Your commit message'"
echo "4. git checkout main"
echo "5. git merge feature/$FEATURE_NAME"
echo "6. git branch -d feature/$FEATURE_NAME  # Delete the feature branch"