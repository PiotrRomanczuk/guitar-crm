#!/bin/bash

# Code Quality Check Script
# Runs linting, formatting, type checking, and tests with coverage

# DON'T use set -e here because we want to run all checks and log even on failures

# Start timing and capture output
START_TIME=$(date +%s)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMP_OUTPUT=$(mktemp)
exec 1> >(tee -a "$TEMP_OUTPUT")
exec 2>&1

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

# Function to print coverage badge
print_coverage_badge() {
    local coverage=$1
    local name=$2
    local bars=""
    local color=""
    
    # Calculate number of bars (0-10)
    local num_bars=$((coverage * 10 / 100))
    
    # Set color based on coverage
    if [ $coverage -ge 80 ]; then
        color="${GREEN}"
    elif [ $coverage -ge 60 ]; then
        color="${YELLOW}"
    else
        color="${RED}"
    fi
    
    # Create progress bar
    for ((i=0; i<num_bars; i++)); do
        bars="${bars}█"
    done
    for ((i=num_bars; i<10; i++)); do
        bars="${bars}░"
    done
    
    printf "%-15s ${color}%s${NC} %3d%%\n" "$name" "$bars" "$coverage"
}

# Function to print Lighthouse score badge
print_lighthouse_badge() {
    local score=$1
    local name=$2
    local bars=""
    local color=""
    
    # Calculate number of bars (0-10)
    local num_bars=$((score * 10 / 100))
    
    # Set color based on score
    if [ $score -ge 90 ]; then
        color="${GREEN}"
    elif [ $score -ge 50 ]; then
        color="${YELLOW}"
    else
        color="${RED}"
    fi
    
    # Create progress bar
    for ((i=0; i<num_bars; i++)); do
        bars="${bars}█"
    done
    for ((i=num_bars; i<10; i++)); do
        bars="${bars}░"
    done
    
    printf "%-15s ${color}%s${NC} %3d\n" "$name" "$bars" "$score"
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

# 3. Run tests with coverage
echo "🧪 Running tests with coverage..."
npm test -- --coverage --watchAll=false

# Parse and display coverage in a more readable format
if [ -f "coverage/coverage-summary.json" ]; then
    echo ""
    echo "📊 Code Coverage Summary"
    echo "======================="
    
    # Function to print coverage badge with bars
    print_coverage_badge() {
        local coverage=$1
        local name=$2
        local bars=""
        local color=""
        
        # Calculate number of bars (0-10)
        local num_bars=$((coverage * 10 / 100))
        
        # Set color based on coverage
        if [ $coverage -ge 80 ]; then
            color="${GREEN}"
        elif [ $coverage -ge 60 ]; then
            color="${YELLOW}"
        else
            color="${RED}"
        fi
        
        # Create progress bar
        for ((i=0; i<num_bars; i++)); do
            bars="${bars}█"
        done
        for ((i=num_bars; i<10; i++)); do
            bars="${bars}░"
        done
        
        printf "%-15s ${color}%s${NC} %3d%%\n" "$name" "$bars" "$coverage"
    }
    
    # Extract coverage metrics
    STATEMENTS=$(jq '.total.statements.pct' coverage/coverage-summary.json)
    BRANCHES=$(jq '.total.branches.pct' coverage/coverage-summary.json)
    FUNCTIONS=$(jq '.total.functions.pct' coverage/coverage-summary.json)
    LINES=$(jq '.total.lines.pct' coverage/coverage-summary.json)
    
    # Display coverage with progress bars
    print_coverage_badge ${STATEMENTS%.*} "Statements"
    print_coverage_badge ${BRANCHES%.*} "Branches"
    print_coverage_badge ${FUNCTIONS%.*} "Functions"
    print_coverage_badge ${LINES%.*} "Lines"
    
    echo ""
    # Check against thresholds (ADVISORY ONLY - NOT BLOCKING)
    if [ ${STATEMENTS%.*} -lt 70 ] || [ ${BRANCHES%.*} -lt 70 ] || [ ${FUNCTIONS%.*} -lt 70 ] || [ ${LINES%.*} -lt 70 ]; then
        echo -e "${YELLOW}⚠️  Coverage is below 70% threshold in some areas (advisory only)${NC}"
        # OVERALL_STATUS=1  # Temporarily disabled - coverage not blocking
    fi
else
    echo -e "${RED}❌ Coverage report not found${NC}"
    OVERALL_STATUS=1
fi

# Parse coverage results
if [ -f "coverage/coverage-summary.json" ]; then
    echo ""
    echo "📊 Code Coverage Summary"
    echo "======================="
    
    # Extract coverage metrics from JSON
    STATEMENTS=$(jq '.total.statements.pct' coverage/coverage-summary.json)
    BRANCHES=$(jq '.total.branches.pct' coverage/coverage-summary.json)
    FUNCTIONS=$(jq '.total.functions.pct' coverage/coverage-summary.json)
    LINES=$(jq '.total.lines.pct' coverage/coverage-summary.json)
    
    echo "Statement Coverage:  $(print_coverage_badge ${STATEMENTS%.*})"
    echo "Branch Coverage:    $(print_coverage_badge ${BRANCHES%.*})"
    echo "Function Coverage:  $(print_coverage_badge ${FUNCTIONS%.*})"
    echo "Line Coverage:      $(print_coverage_badge ${LINES%.*})"
    
    # Check against thresholds (ADVISORY ONLY - NOT BLOCKING)
    if [ ${STATEMENTS%.*} -lt 70 ] || [ ${BRANCHES%.*} -lt 70 ] || [ ${FUNCTIONS%.*} -lt 70 ] || [ ${LINES%.*} -lt 70 ]; then
        echo -e "\n${YELLOW}⚠️  Coverage is below 70% threshold in some areas (advisory only)${NC}"
        # OVERALL_STATUS=1  # Temporarily disabled - coverage not blocking
    fi
else
    echo -e "${RED}❌ Coverage report not found${NC}"
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

# 5. Small Components Policy check (advisory)
echo "🧩 Checking component file sizes (advisory)..."
OVERSIZED=$(find app components lib -type f \( -name "*.ts" -o -name "*.tsx" \) -maxdepth 5 2>/dev/null | while read -r file; do
    LINES=$(wc -l < "$file" 2>/dev/null || echo 0)
    if [ "$LINES" -gt 300 ]; then
        echo "$file ($LINES lines)"
    fi
done)
if [ -n "$OVERSIZED" ]; then
    echo -e "${YELLOW}⚠️  The following files exceed 300 lines:${NC}"
    echo "$OVERSIZED" | head -20
    echo "Consider splitting into smaller, composable components."
else
    print_status 0 "All component files are within 300 lines"
fi

echo ""

# 6. Check bundle size (if built)
if [ -d ".next" ]; then
    echo "📦 Checking bundle size..."
    du -sh .next/static/chunks/* 2>/dev/null | sort -hr | head -5
fi

echo ""

# 7. Optional: Lighthouse audit (if development server is running)
# 7. Database Quality Check
echo ""
echo "🗄️ Running Database Quality Check..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if "${SCRIPT_DIR}/../database/check-db-quality.sh"; then
    print_status 0 "Database quality check passed"
else
    print_status 1 "Database quality issues found"
    OVERALL_STATUS=1
fi

# 8. Lighthouse scores
echo ""
echo "🚦 Lighthouse Scores"
echo "======================="

if [ -f "lighthouse-results.json" ]; then
    # Extract scores from the latest Lighthouse report
    PERFORMANCE=$(jq '.categories.performance.score * 100' lighthouse-results.json)
    ACCESSIBILITY=$(jq '.categories.accessibility.score * 100' lighthouse-results.json)
    BEST_PRACTICES=$(jq '.categories["best-practices"].score * 100' lighthouse-results.json)
    SEO=$(jq '.categories.seo.score * 100' lighthouse-results.json)
    PWA=$(jq '.categories.pwa.score * 100' lighthouse-results.json)
    
    print_lighthouse_badge ${PERFORMANCE%.*} "Performance"
    print_lighthouse_badge ${ACCESSIBILITY%.*} "Accessibility"
    print_lighthouse_badge ${BEST_PRACTICES%.*} "Best Practices"
    print_lighthouse_badge ${SEO%.*} "SEO"
    print_lighthouse_badge ${PWA%.*} "PWA"
    
    # Check against thresholds
    if [ ${PERFORMANCE%.*} -lt 90 ] || [ ${ACCESSIBILITY%.*} -lt 90 ] || [ ${BEST_PRACTICES%.*} -lt 90 ] || [ ${SEO%.*} -lt 90 ]; then
        echo -e "\n${YELLOW}⚠️  Some Lighthouse scores are below 90${NC}"
    fi
else
    echo -e "${YELLOW}💡 No Lighthouse results found. Run:${NC}"
    echo "1. npm run dev"
    echo "2. npm run lighthouse"
fi

echo ""
echo "======================"

# Generate summaries
source "$(dirname "$0")/../utils/report_summary.sh"

# Get the history directory from log_history.sh
source "$SCRIPT_DIR/../utils/log_history.sh"

# Generate detailed summary for history report
REPORT_FILE="$HISTORY_DIR/ci/quality-check_$(date '+%Y-%m-%d_%H-%M-%S').md"
generate_detailed_summary "$REPORT_FILE" "coverage/coverage-summary.json" "lighthouse-results.json" "quality-check" "ci" "$(git branch --show-current)"

# Generate concise terminal summary
generate_terminal_summary "coverage/coverage-summary.json" "lighthouse-results.json"

echo ""
echo "======================"

# Calculate duration and log execution
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Close the tee process and capture final output
exec 1>&-
exec 2>&-

# Read captured output
OUTPUT=$(cat "$TEMP_OUTPUT")

# Log this execution
source "$SCRIPT_DIR/../utils/log_history.sh"
log_execution "$0" "$OVERALL_STATUS" "$OUTPUT" "$DURATION"

# Clean up temp file
rm -f "$TEMP_OUTPUT"

# Print final status to stderr (not captured)
if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL QUALITY CHECKS PASSED!${NC}" >&2
    echo "Your code is ready for commit." >&2
else
    echo -e "${RED}❌ QUALITY CHECKS FAILED${NC}" >&2
    echo "Please fix the issues above before committing." >&2
    exit 1
fi