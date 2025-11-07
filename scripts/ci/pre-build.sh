#!/bin/bash

# Pre-build script that runs quality checks before building
# Usage: ./pre-build.sh

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔍 Running pre-build checks..."

# Run quality check first
echo "⚙️ Running quality check..."
"$SCRIPT_DIR/../run_with_history.sh" ci/quality-check.sh
QUALITY_EXIT_CODE=$?

if [ $QUALITY_EXIT_CODE -ne 0 ]; then
    echo "❌ Quality check failed. Please fix the issues before building."
    exit 1
fi

echo "✅ Pre-build checks passed. Proceeding with build..."
exit 0