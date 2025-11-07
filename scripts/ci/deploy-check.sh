#!/bin/bash

# Production Build and Deployment Check Script
# Validates the application is ready for production

set -e

echo "🚀 PRODUCTION DEPLOYMENT CHECK"
echo "=============================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0

# Function to check and report
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

# 1. Environment variables check
echo "🔧 Checking environment variables..."
ENV_ERRORS=0

required_env_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
)

for var in "${required_env_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Missing environment variable: $var${NC}"
        ENV_ERRORS=$((ENV_ERRORS + 1))
    fi
done

check_status $ENV_ERRORS "Environment variables configured"

# 2. Dependencies check
echo ""
echo "📦 Checking dependencies..."
if npm audit --audit-level=high; then
    check_status 0 "No high-severity vulnerabilities found"
else
    check_status 1 "High-severity vulnerabilities found"
fi

# 3. Build the application
echo ""
echo "🏗️  Building application..."
if npm run build; then
    check_status 0 "Application builds successfully"
else
    check_status 1 "Build failed"
fi

# 4. Run all tests
echo ""
echo "🧪 Running full test suite..."
if npm test -- --coverage --watchAll=false; then
    check_status 0 "All tests pass"
else
    check_status 1 "Tests failed"
fi

# 5. Check test coverage
echo ""
echo "📊 Checking test coverage..."
COVERAGE_THRESHOLD=70

if [ -f "coverage/coverage-summary.json" ]; then
    COVERAGE=$(node -e "
        const coverage = require('./coverage/coverage-summary.json');
        console.log(coverage.total.lines.pct);
    " 2>/dev/null || echo "0")
    
    if (( $(echo "$COVERAGE >= $COVERAGE_THRESHOLD" | bc -l) )); then
        check_status 0 "Test coverage ($COVERAGE%) meets threshold ($COVERAGE_THRESHOLD%)"
    else
        check_status 1 "Test coverage ($COVERAGE%) below threshold ($COVERAGE_THRESHOLD%)"
    fi
else
    check_status 1 "Coverage report not found"
fi

# 6. Check for production-ready optimizations
echo ""
echo "⚡ Checking build optimizations..."
if [ -d ".next" ]; then
    # Check if images are optimized
    IMAGE_COUNT=$(find public -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" 2>/dev/null | wc -l)
    if [ $IMAGE_COUNT -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found $IMAGE_COUNT images in public folder. Consider optimization.${NC}"
    fi
    
    # Check bundle size
    BUNDLE_SIZE=$(du -sh .next/static 2>/dev/null | cut -f1 || echo "0")
    echo "📦 Bundle size: $BUNDLE_SIZE"
    
    check_status 0 "Build artifacts generated"
else
    check_status 1 "Build artifacts not found"
fi

# 7. Database migration check
echo ""
echo "🗄️  Checking database migrations..."
if supabase db diff --check 2>/dev/null; then
    check_status 0 "Database migrations are up to date"
else
    echo -e "${YELLOW}⚠️  Database schema may have uncommitted changes${NC}"
fi

# 8. Security checks
echo ""
echo "🔒 Running security checks..."

# Check for secrets in code
SECRET_PATTERNS=(
    "password\s*=\s*['\"][^'\"]+['\"]"
    "secret\s*=\s*['\"][^'\"]+['\"]"
    "api_key\s*=\s*['\"][^'\"]+['\"]"
    "private_key"
)

SECRET_VIOLATIONS=0
for pattern in "${SECRET_PATTERNS[@]}"; do
    if find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -iE "$pattern" 2>/dev/null; then
        SECRET_VIOLATIONS=$((SECRET_VIOLATIONS + 1))
    fi
done

check_status $SECRET_VIOLATIONS "No hardcoded secrets found"

# 9. Performance check
echo ""
echo "⚡ Performance check..."
if [ -f ".next/analyze" ]; then
    echo "📊 Bundle analysis available"
else
    echo -e "${YELLOW}💡 Consider adding bundle analysis: npm install @next/bundle-analyzer${NC}"
fi

# Final report
echo ""
echo "=============================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 DEPLOYMENT READY!${NC}"
    echo "Your application is ready for production deployment."
    echo ""
    echo "Next steps:"
    echo "1. Set up production environment variables"
    echo "2. Configure production database"
    echo "3. Set up CI/CD pipeline"
    echo "4. Deploy to your hosting platform"
else
    echo -e "${RED}❌ DEPLOYMENT NOT READY${NC}"
    echo "Found $ERRORS issues that need to be resolved."
    echo ""
    echo "Please fix the issues above before deploying to production."
    exit 1
fi