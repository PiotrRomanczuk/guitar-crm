#!/bin/bash

# Function to generate a detailed summary for history reports
generate_detailed_summary() {
    local output_file=$1
    local coverage_file=$2
    local lighthouse_file=$3
    local script_name=$4
    local category=$5
    local git_branch=$6

    # Write detailed header
    echo "# Execution Summary Report" > "$output_file"
    echo "" >> "$output_file"
    echo "## Overview" >> "$output_file"
    echo "- **Script**: \`$script_name\`" >> "$output_file"
    echo "- **Category**: $category" >> "$output_file"
    echo "- **Timestamp**: $(date '+%Y-%m-%d %H:%M:%S')" >> "$output_file"
    echo "- **Git Branch**: \`$git_branch\`" >> "$output_file"
    echo "" >> "$output_file"

    # Add coverage summary if available
    if [ -f "$coverage_file" ]; then
        echo "## Test Coverage" >> "$output_file"
        echo "\`\`\`" >> "$output_file"
        echo "Statements : $(jq '.total.statements.pct' "$coverage_file")%" >> "$output_file"
        echo "Branches   : $(jq '.total.branches.pct' "$coverage_file")%" >> "$output_file"
        echo "Functions  : $(jq '.total.functions.pct' "$coverage_file")%" >> "$output_file"
        echo "Lines      : $(jq '.total.lines.pct' "$coverage_file")%" >> "$output_file"
        echo "\`\`\`" >> "$output_file"
        echo "" >> "$output_file"
    fi

    # Add Lighthouse scores if available
    if [ -f "$lighthouse_file" ]; then
        echo "## Lighthouse Scores" >> "$output_file"
        echo "\`\`\`" >> "$output_file"
        echo "Performance    : $(jq '.categories.performance.score * 100' "$lighthouse_file")%" >> "$output_file"
        echo "Accessibility : $(jq '.categories.accessibility.score * 100' "$lighthouse_file")%" >> "$output_file"
        echo "Best Practices: $(jq '.categories["best-practices"].score * 100' "$lighthouse_file")%" >> "$output_file"
        echo "SEO           : $(jq '.categories.seo.score * 100' "$lighthouse_file")%" >> "$output_file"
        echo "PWA           : $(jq '.categories.pwa.score * 100' "$lighthouse_file")%" >> "$output_file"
        echo "\`\`\`" >> "$output_file"
        echo "" >> "$output_file"
    fi
}

# Function to generate concise terminal summary
generate_terminal_summary() {
    local coverage_file=$1
    local lighthouse_file=$2
    
    echo ""
    echo "📊 EXECUTION SUMMARY"
    echo "==================="
    
    if [ -f "$coverage_file" ]; then
        statements=$(jq '.total.statements.pct' "$coverage_file")
        branches=$(jq '.total.branches.pct' "$coverage_file")
        functions=$(jq '.total.functions.pct' "$coverage_file")
        lines=$(jq '.total.lines.pct' "$coverage_file")
        
        echo "Test Coverage:"
        printf "%-12s %6.2f%%  %s\n" "Statements:" "$statements" "$(get_status_icon "$statements" 70)"
        printf "%-12s %6.2f%%  %s\n" "Branches:" "$branches" "$(get_status_icon "$branches" 70)"
        printf "%-12s %6.2f%%  %s\n" "Functions:" "$functions" "$(get_status_icon "$functions" 70)"
        printf "%-12s %6.2f%%  %s\n" "Lines:" "$lines" "$(get_status_icon "$lines" 70)"
    fi
    
    if [ -f "$lighthouse_file" ]; then
        performance=$(jq '.categories.performance.score * 100' "$lighthouse_file")
        accessibility=$(jq '.categories.accessibility.score * 100' "$lighthouse_file")
        practices=$(jq '.categories["best-practices"].score * 100' "$lighthouse_file")
        seo=$(jq '.categories.seo.score * 100' "$lighthouse_file")
        
        echo ""
        echo "Lighthouse:"
        printf "%-15s %6.2f%%  %s\n" "Performance:" "$performance" "$(get_status_icon "$performance" 90)"
        printf "%-15s %6.2f%%  %s\n" "Accessibility:" "$accessibility" "$(get_status_icon "$accessibility" 90)"
        printf "%-15s %6.2f%%  %s\n" "Best Practices:" "$practices" "$(get_status_icon "$practices" 90)"
        printf "%-15s %6.2f%%  %s\n" "SEO:" "$seo" "$(get_status_icon "$seo" 90)"
    fi
}

# Helper function to get status icon based on threshold
get_status_icon() {
    local value=$1
    local threshold=$2
    
    if [ $(echo "$value >= $threshold" | bc -l) -eq 1 ]; then
        echo "✅"
    else
        echo "❌"
    fi
}

# Export functions
export -f generate_detailed_summary
export -f generate_terminal_summary
export -f get_status_icon