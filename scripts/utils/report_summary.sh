#!/bin/bash

# Function to generate a detailed Markdown report
generate_detailed_summary() {
    local report_file=$1
    local coverage_file=$2
    local lighthouse_file=$3
    local type=$4
    local context=$5
    local branch=$6
    
    echo "# Quality Check Report" > "$report_file"
    echo "**Date:** $(date)" >> "$report_file"
    echo "**Branch:** $branch" >> "$report_file"
    echo "**Type:** $type ($context)" >> "$report_file"
    echo "" >> "$report_file"
    
    echo "## 📊 Code Coverage" >> "$report_file"
    if [ -f "$coverage_file" ]; then
        echo "\`\`\`json" >> "$report_file"
        cat "$coverage_file" >> "$report_file"
        echo "\`\`\`" >> "$report_file"
    else
        echo "No coverage data available." >> "$report_file"
    fi
    
    echo "" >> "$report_file"
    echo "## 🚦 Lighthouse Scores" >> "$report_file"
    if [ -f "$lighthouse_file" ]; then
        echo "\`\`\`json" >> "$report_file"
        cat "$lighthouse_file" >> "$report_file"
        echo "\`\`\`" >> "$report_file"
    else
        echo "No Lighthouse results found." >> "$report_file"
    fi
    
    echo "" >> "$report_file"
    echo "## 📝 Execution Log" >> "$report_file"
    echo "See logs/execution.log for run history." >> "$report_file"
    
    echo "Report generated at: $report_file"
}

# Function to generate a concise terminal summary
generate_terminal_summary() {
    local coverage_file=$1
    local lighthouse_file=$2
    
    echo "📊 Summary Generated"
    if [ -f "$coverage_file" ]; then
        echo "- Coverage data processed"
    fi
    if [ -f "$lighthouse_file" ]; then
        echo "- Lighthouse data processed"
    fi
}
