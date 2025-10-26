#!/bin/bash

# Code Quality Check Script
# Runs linting, formatting, type checking, and tests

set -e

echo "🔍 CODE QUALITY CHECK"
echo "===================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Track overall status
OVERALL_STATUS=0

# 1. TypeScript type checking
echo "🔧 Running TypeScript type check..."
if npx tsc --noEmit; then
    print_status 0 "TypeScript types are valid"
else
    print_status 1 "TypeScript type errors found"
    OVERALL_STATUS=1
fi

echo ""

# 2. ESLint
echo "🧹 Running ESLint..."
if npm run lint; then
    print_status 0 "ESLint passed"
else
    print_status 1 "ESLint errors found"
    OVERALL_STATUS=1
fi

echo ""

# 3. Run tests
echo "🧪 Running tests..."
if npm test -- --passWithNoTests --watchAll=false; then
    print_status 0 "All tests passed"
else
    print_status 1 "Test failures found"
    OVERALL_STATUS=1
fi

echo ""

# 4. Check for TODO/FIXME comments
echo "📝 Checking for TODO/FIXME comments..."
TODO_COUNT=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -i "TODO\|FIXME" | wc -l)
if [ $TODO_COUNT -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $TODO_COUNT TODO/FIXME comments${NC}"
    find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -in "TODO\|FIXME" | head -10
    if [ $TODO_COUNT -gt 10 ]; then
        echo "... and $(($TODO_COUNT - 10)) more"
    fi
else
    print_status 0 "No TODO/FIXME comments found"
fi

echo ""

# 5. Check bundle size (if built)
if [ -d ".next" ]; then
    echo "📦 Checking bundle size..."
    du -sh .next/static/chunks/* 2>/dev/null | sort -hr | head -5
fi

echo ""

# 6. Optional: Lighthouse audit (if development server is running)
echo "🚢 Checking for Lighthouse audit availability..."
if curl -s --head "http://localhost:3000" > /dev/null 2>&1; then
    echo -e "${YELLOW}💡 Development server detected. Run Lighthouse audit:${NC}"
    echo "   npm run lighthouse"
else
    echo -e "${YELLOW}💡 Start dev server (npm run dev) and run: npm run lighthouse${NC}"
fi

echo ""
echo "======================"

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL QUALITY CHECKS PASSED!${NC}"
    echo "Your code is ready for commit."
else
    echo -e "${RED}❌ QUALITY CHECKS FAILED${NC}"
    echo "Please fix the issues above before committing."
    exit 1
fi