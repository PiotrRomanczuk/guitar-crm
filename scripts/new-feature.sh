#!/bin/bash

# Script to create a new feature branch
# Usage: ./scripts/new-feature.sh feature-name

if [ $# -eq 0 ]; then
    echo "Usage: $0 <feature-name>"
    echo "Example: $0 user-authentication"
    exit 1
fi

FEATURE_NAME=$1

# Ensure we're on main branch and it's up to date
echo "Switching to main branch..."
git checkout main

echo "Pulling latest changes..."
git pull origin main 2>/dev/null || echo "No remote configured yet"

# Create and switch to new feature branch
echo "Creating feature branch: feature/$FEATURE_NAME"
git checkout -b "feature/$FEATURE_NAME"

echo "✅ Feature branch 'feature/$FEATURE_NAME' created successfully!"
echo "You can now start working on your feature."
echo ""
echo "When ready to merge:"
echo "1. git add ."
echo "2. git commit -m 'Your commit message'"
echo "3. git checkout main"
echo "4. git merge feature/$FEATURE_NAME"
echo "5. git branch -d feature/$FEATURE_NAME  # Delete the feature branch"