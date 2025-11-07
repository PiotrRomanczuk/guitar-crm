#!/bin/bash

# GitHub Actions Setup Script
# This script helps configure GitHub secrets for CI/CD

set -e

echo "🚀 GitHub Actions CI/CD Setup"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Install it with: brew install gh"
    echo "Then run: gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI is installed and authenticated${NC}"
echo ""

# Get repository info
REPO_OWNER=$(gh repo view --json owner --jq .owner.login)
REPO_NAME=$(gh repo view --json name --jq .name)

echo "Repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Function to set secret
set_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}⚠️  Skipping $secret_name (no value provided)${NC}"
        return
    fi
    
    echo "$secret_value" | gh secret set "$secret_name"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Set $secret_name${NC}"
    else
        echo -e "${RED}❌ Failed to set $secret_name${NC}"
    fi
}

# Check for .env.local
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ Found .env.local file${NC}"
    echo ""
    
    # Source the .env.local file
    set -a
    source .env.local
    set +a
    
    echo "📝 Setting Supabase secrets from .env.local..."
    
    # Set Supabase secrets
    if [ ! -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        set_secret "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL"
    else
        echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_URL not found in .env.local${NC}"
    fi
    
    if [ ! -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        set_secret "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
    else
        echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local${NC}"
    fi
    
    if [ ! -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        set_secret "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
    else
        echo -e "${YELLOW}⚠️  SUPABASE_SERVICE_ROLE_KEY not found in .env.local${NC}"
    fi
    
else
    echo -e "${YELLOW}⚠️  No .env.local file found${NC}"
    echo "Create one with:"
    echo "  NEXT_PUBLIC_SUPABASE_URL=your-url"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key"
    echo "  SUPABASE_SERVICE_ROLE_KEY=your-service-key"
    echo ""
fi

# Vercel secrets
echo ""
echo "📝 Vercel Configuration"
echo "======================="
echo ""

# Check for .vercel directory
if [ -d ".vercel" ]; then
    echo -e "${GREEN}✅ Found .vercel directory${NC}"
    
    if [ -f ".vercel/project.json" ]; then
        VERCEL_ORG_ID=$(jq -r '.orgId' .vercel/project.json)
        VERCEL_PROJECT_ID=$(jq -r '.projectId' .vercel/project.json)
        
        echo "Vercel Org ID: $VERCEL_ORG_ID"
        echo "Vercel Project ID: $VERCEL_PROJECT_ID"
        echo ""
        
        set_secret "VERCEL_ORG_ID" "$VERCEL_ORG_ID"
        set_secret "VERCEL_PROJECT_ID" "$VERCEL_PROJECT_ID"
    fi
else
    echo -e "${YELLOW}⚠️  No .vercel directory found${NC}"
    echo "Run 'vercel link' to connect your project"
    echo ""
fi

# Vercel token (manual input)
echo ""
echo "🔑 Vercel Token"
echo "==============="
echo "Get your token from: https://vercel.com/account/tokens"
echo ""
read -p "Enter your Vercel token (or press Enter to skip): " VERCEL_TOKEN

if [ ! -z "$VERCEL_TOKEN" ]; then
    set_secret "VERCEL_TOKEN" "$VERCEL_TOKEN"
else
    echo -e "${YELLOW}⚠️  Skipped Vercel token${NC}"
fi

# Codecov token (optional)
echo ""
echo "📊 Codecov Token (Optional)"
echo "==========================="
echo "Get your token from: https://codecov.io"
echo ""
read -p "Enter your Codecov token (or press Enter to skip): " CODECOV_TOKEN

if [ ! -z "$CODECOV_TOKEN" ]; then
    set_secret "CODECOV_TOKEN" "$CODECOV_TOKEN"
else
    echo -e "${YELLOW}⚠️  Skipped Codecov token${NC}"
fi

# Summary
echo ""
echo "✨ Setup Complete!"
echo "=================="
echo ""
echo "Current secrets:"
gh secret list
echo ""
echo "Next steps:"
echo "1. Verify secrets in GitHub: https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
echo "2. Push a commit to trigger the workflow"
echo "3. Monitor workflow: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
echo ""
echo -e "${GREEN}✅ GitHub Actions CI/CD is ready!${NC}"
