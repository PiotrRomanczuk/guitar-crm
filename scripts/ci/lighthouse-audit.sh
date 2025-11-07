#!/bin/bash

# Lighthouse Performance and Quality Audit Script
# Runs Lighthouse against the local development server

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🏠 LIGHTHOUSE QUALITY AUDIT${NC}"
echo "============================"

# Configuration
PORT=${1:-3000}
URL="http://localhost:$PORT"
OUTPUT_DIR="lighthouse-reports"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
REPORT_FILE="$OUTPUT_DIR/lighthouse-report-$TIMESTAMP"

# Create reports directory
mkdir -p "$OUTPUT_DIR"

# Check if the development server is running
echo "🔍 Checking if development server is running on $URL..."
if ! curl -s --head "$URL" > /dev/null; then
    echo -e "${RED}❌ Development server is not running on $URL${NC}"
    echo ""
    echo "Please start the development server first:"
    echo "  npm run dev"
    echo ""
    echo "Or specify a different port:"
    echo "  $0 3001"
    exit 1
fi

echo -e "${GREEN}✅ Development server is running${NC}"
echo ""

# Run Lighthouse audit
echo "🚢 Running Lighthouse audit..."
echo "📊 URL: $URL"
echo "📁 Reports will be saved to: $OUTPUT_DIR/"
echo ""

# Run Lighthouse with comprehensive checks
lighthouse "$URL" \
    --output=html,json \
    --output-path="$REPORT_FILE" \
    --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" \
    --quiet \
    --view=false

# Check if reports were generated
if [ -f "$REPORT_FILE.json" ]; then
    echo ""
    echo -e "${GREEN}✅ Lighthouse audit completed!${NC}"
    
    # Parse and display key metrics
    echo ""
    echo "📊 KEY METRICS:"
    echo "==============="
    
    # Extract scores using Node.js (more reliable than jq)
    node << EOF
const fs = require('fs');
const report = JSON.parse(fs.readFileSync('$REPORT_FILE.json', 'utf8'));

const categories = report.categories;
const scores = {
    'Performance': categories.performance?.score * 100,
    'Accessibility': categories.accessibility?.score * 100,
    'Best Practices': categories['best-practices']?.score * 100,
    'SEO': categories.seo?.score * 100,
    'PWA': categories.pwa?.score * 100
};

console.log('Category                Score   Status');
console.log('--------------------------------------');

Object.entries(scores).forEach(([category, score]) => {
    if (score !== undefined) {
        const status = score >= 90 ? '🟢 Excellent' : 
                      score >= 70 ? '🟡 Good' : 
                      score >= 50 ? '🟠 Needs Work' : '🔴 Poor';
        console.log(\`\${category.padEnd(18)} \${Math.round(score).toString().padStart(3)}     \${status}\`);
    }
});

// Display core web vitals
const audits = report.audits;
console.log('\\n⚡ CORE WEB VITALS:');
console.log('==================');

const vitals = {
    'First Contentful Paint': audits['first-contentful-paint']?.displayValue,
    'Largest Contentful Paint': audits['largest-contentful-paint']?.displayValue,
    'Cumulative Layout Shift': audits['cumulative-layout-shift']?.displayValue,
    'Total Blocking Time': audits['total-blocking-time']?.displayValue,
    'Speed Index': audits['speed-index']?.displayValue
};

Object.entries(vitals).forEach(([metric, value]) => {
    if (value) {
        console.log(\`\${metric.padEnd(25)} \${value}\`);
    }
});

// Check for critical issues
const issues = [];
if (scores.Performance < 70) issues.push('Performance below 70');
if (scores.Accessibility < 90) issues.push('Accessibility below 90');
if (scores['Best Practices'] < 80) issues.push('Best Practices below 80');

if (issues.length > 0) {
    console.log('\\n⚠️  RECOMMENDATIONS:');
    console.log('===================');
    issues.forEach(issue => console.log(\`• \${issue}\`));
}
EOF

    echo ""
    echo "📁 REPORTS GENERATED:"
    echo "===================="
    echo "• HTML Report: $REPORT_FILE.html"
    echo "• JSON Report: $REPORT_FILE.json"
    echo ""
    echo "🌐 Open HTML report:"
    echo "open $REPORT_FILE.html"
    
else
    echo -e "${RED}❌ Lighthouse audit failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Lighthouse audit completed successfully!${NC}"