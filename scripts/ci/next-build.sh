#!/bin/bash

# Run the Next.js build command and capture the output
echo "🏗️ Running Next.js build..."
next build

# Store the exit code
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed with exit code $EXIT_CODE"
fi

exit $EXIT_CODE