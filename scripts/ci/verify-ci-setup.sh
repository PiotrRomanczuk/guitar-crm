#!/bin/bash

# GitHub Actions Readiness Check
# Verifies that all components are in place before pushing

set -e

echo "🔍 GitHub Actions Readiness Check"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Function to check if file exists
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $description"
        ((CHECKS_PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC} $description"
        echo -e "   ${RED}Missing: $file${NC}"
        ((CHECKS_FAILED++))
        return 1
    fi
}

# Function to check if directory exists
check_dir() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅${NC} $description"
        ((CHECKS_PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC} $description"
        echo -e "   ${RED}Missing: $dir${NC}"
        ((CHECKS_FAILED++))
        return 1
    fi
}

# Function for warnings
warn() {
    local message=$1
    echo -e "${YELLOW}⚠️  $message${NC}"
    ((WARNINGS++))
}

# Function for info
info() {
    local message=$1
    echo -e "${BLUE}ℹ️  $message${NC}"
}

echo "📁 Checking Required Files..."
echo "------------------------------"
check_file ".github/workflows/ci-cd.yml" "Main CI/CD workflow file"
check_file "scripts/setup-github-actions.sh" "Setup automation script"
check_file "docs/GITHUB_ACTIONS_SETUP.md" "Setup documentation"
check_file "docs/CI_CD_STATUS.md" "Quick reference guide"
check_file ".github/workflows/README.md" "Workflow documentation"
check_file "jest.config.ts" "Jest configuration"
check_file "jest.setup.js" "Jest setup file"
check_file "cypress.config.ts" "Cypress configuration"
check_file "package.json" "Package configuration"
echo ""

echo "📦 Checking npm Scripts..."
echo "--------------------------"
required_scripts=("test:ci" "lint" "build" "dev" "quality")

for script in "${required_scripts[@]}"; do
    if grep -q "\"$script\":" package.json; then
        echo -e "${GREEN}✅${NC} npm run $script"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌${NC} npm run $script"
        ((CHECKS_FAILED++))
    fi
done
echo ""

echo "🔧 Checking Tool Availability..."
echo "--------------------------------"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅${NC} Node.js ($NODE_VERSION)"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌${NC} Node.js not installed"
    ((CHECKS_FAILED++))
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅${NC} npm ($NPM_VERSION)"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌${NC} npm not installed"
    ((CHECKS_FAILED++))
fi

# Check git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✅${NC} git ($GIT_VERSION)"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌${NC} git not installed"
    ((CHECKS_FAILED++))
fi

# Check GitHub CLI (optional but recommended)
if command -v gh &> /dev/null; then
    GH_VERSION=$(gh --version | head -1)
    echo -e "${GREEN}✅${NC} GitHub CLI ($GH_VERSION)"
    ((CHECKS_PASSED++))
else
    warn "GitHub CLI not installed (recommended for secret management)"
    echo -e "   ${YELLOW}Install: brew install gh${NC}"
fi

# Check Vercel CLI (optional but recommended)
if command -v vercel &> /dev/null; then
    VERCEL_VERSION=$(vercel --version)
    echo -e "${GREEN}✅${NC} Vercel CLI ($VERCEL_VERSION)"
    ((CHECKS_PASSED++))
else
    warn "Vercel CLI not installed (required for deployment)"
    echo -e "   ${YELLOW}Install: npm i -g vercel${NC}"
fi

# Check Supabase CLI (optional)
if command -v supabase &> /dev/null; then
    SUPABASE_VERSION=$(supabase --version)
    echo -e "${GREEN}✅${NC} Supabase CLI ($SUPABASE_VERSION)"
    ((CHECKS_PASSED++))
else
    warn "Supabase CLI not installed (needed for local E2E tests)"
    echo -e "   ${YELLOW}Install: brew install supabase/tap/supabase${NC}"
fi

echo ""

echo "🔐 Checking Local Configuration..."
echo "-----------------------------------"

# Check .env.local
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅${NC} .env.local exists"
    ((CHECKS_PASSED++))
    
    # Check for required env vars
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo -e "${GREEN}✅${NC} NEXT_PUBLIC_SUPABASE_URL configured"
        ((CHECKS_PASSED++))
    else
        warn "NEXT_PUBLIC_SUPABASE_URL not in .env.local"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo -e "${GREEN}✅${NC} NEXT_PUBLIC_SUPABASE_ANON_KEY configured"
        ((CHECKS_PASSED++))
    else
        warn "NEXT_PUBLIC_SUPABASE_ANON_KEY not in .env.local"
    fi
else
    warn ".env.local not found (needed for local development)"
    echo -e "   ${YELLOW}Create with: npm run setup${NC}"
fi

# Check .vercel directory
if [ -d ".vercel" ]; then
    echo -e "${GREEN}✅${NC} .vercel directory exists"
    ((CHECKS_PASSED++))
    
    if [ -f ".vercel/project.json" ]; then
        echo -e "${GREEN}✅${NC} Vercel project linked"
        ((CHECKS_PASSED++))
    else
        warn "Vercel project not linked"
        echo -e "   ${YELLOW}Run: vercel link${NC}"
    fi
else
    warn ".vercel directory not found (needed for deployment)"
    echo -e "   ${YELLOW}Run: vercel link${NC}"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅${NC} Dependencies installed"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌${NC} Dependencies not installed"
    echo -e "   ${RED}Run: npm ci${NC}"
    ((CHECKS_FAILED++))
fi

echo ""

echo "🎯 Checking Code Quality..."
echo "---------------------------"

# Run lint check
info "Running ESLint..."
if npm run lint -- --max-warnings=100 > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} ESLint passed"
    ((CHECKS_PASSED++))
else
    warn "ESLint has warnings/errors"
    echo -e "   ${YELLOW}Run: npm run lint${NC}"
fi

# Run type check
info "Running TypeScript check..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} TypeScript check passed"
    ((CHECKS_PASSED++))
else
    warn "TypeScript has errors"
    echo -e "   ${YELLOW}Run: npx tsc --noEmit${NC}"
fi

echo ""

echo "📋 Summary"
echo "=========="
echo -e "${GREEN}✅ Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}❌ Failed: $CHECKS_FAILED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure GitHub secrets:"
    echo -e "   ${BLUE}./scripts/setup-github-actions.sh${NC}"
    echo ""
    echo "2. Push to GitHub:"
    echo -e "   ${BLUE}git add .${NC}"
    echo -e "   ${BLUE}git commit -m 'Add GitHub Actions CI/CD'${NC}"
    echo -e "   ${BLUE}git push${NC}"
    echo ""
    echo "3. Monitor workflow:"
    echo -e "   ${BLUE}https://github.com/PiotrRomanczuk/guitar-crm/actions${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some critical checks failed!${NC}"
    echo ""
    echo "Please fix the failed checks before proceeding."
    echo "Run this script again after fixes: ./scripts/verify-ci-setup.sh"
    echo ""
    exit 1
fi
