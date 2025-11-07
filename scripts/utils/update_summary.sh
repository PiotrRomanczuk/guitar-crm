#!/bin/bash

# Script to update the main summary file of all script executions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HISTORY_DIR="/Users/piotrromanczuk/Desktop/guitar-crm/scripts/history"
SUMMARY_FILE="$HISTORY_DIR/all_executions.md"

# Create or clear the summary file
echo "# Script Execution Summary" > "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"
echo "Last updated: $(date '+%Y-%m-%d %H:%M:%S')" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"
echo "| Timestamp | Script | Category | Duration | Status | Details | Git Branch |" >> "$SUMMARY_FILE"
echo "|-----------|---------|----------|-----------|---------|----------|------------|" >> "$SUMMARY_FILE"

# Find all log files and sort them by modification time (newest first)
find "$HISTORY_DIR" -type f -name "*.log" -print0 | \
    xargs -0 ls -t | \
    while read -r logfile; do
        # Extract metadata from the log file
        category=$(echo "$logfile" | grep -o '/\(database\|ci\|development\|testing\)/[^/]*' | cut -d'/' -f2)
        
        # Read metadata from the markdown summary if it exists
        md_file="${logfile%.log}.md"
        if [ -f "$md_file" ]; then
            # Extract richer metadata from markdown summary
            timestamp=$(grep "Timestamp:" "$md_file" | cut -d':' -f2- | xargs)
            script_name=$(grep "Script:" "$md_file" | cut -d'`' -f2 | tr -d '`')
            duration=$(grep "Duration:" "$md_file" | cut -d':' -f2- | xargs)
            exit_code=$(grep "Exit Code:" "$md_file" | cut -d':' -f2- | xargs)
            git_branch=$(grep "Git Branch:" "$md_file" | cut -d'`' -f2 | tr -d '`')
            
            # Extract test coverage if available
            coverage_summary=""
            if grep -q "Test Coverage" "$md_file"; then
                statements=$(awk '/Statements/{print $3}' "$md_file" | head -1)
                coverage_summary=" (Coverage: $statements)"
            fi
        else
            # Fall back to basic log metadata
            timestamp=$(grep "Timestamp:" "$logfile" | cut -d' ' -f2-)
            script_path=$(grep "Script:" "$logfile" | cut -d' ' -f2-)
            script_name=$(basename "$script_path")
            duration=$(grep "Duration:" "$logfile" | cut -d' ' -f2-)
            exit_code=$(grep "Exit Code:" "$logfile" | cut -d' ' -f3-)
            git_branch=$(grep "Git Branch:" "$logfile" | cut -d' ' -f3-)
            coverage_summary=""
        fi
        
        # Generate status icon
        if [ "$exit_code" -eq 0 ]; then
            status="✅"
        else
            status="❌"
        fi
        
        # Add entry to summary file with coverage info if available
        echo "| $timestamp | \`$script_name\` | $category | ${duration} | ${status} | ${coverage_summary} | \`$git_branch\` |" >> "$SUMMARY_FILE"
    done

# Add footer with statistics
echo "" >> "$SUMMARY_FILE"
echo "## Statistics" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"
echo "### Executions by Category" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# Count executions by category
for category in database ci development testing; do
    count=$(find "$HISTORY_DIR/$category" -type f -name "*.log" | wc -l | tr -d ' ')
    echo "- **${category}**: ${count} executions" >> "$SUMMARY_FILE"
done

# Add total count
total=$(find "$HISTORY_DIR" -type f -name "*.log" | wc -l | tr -d ' ')
echo "- **Total**: ${total} executions" >> "$SUMMARY_FILE"

echo "" >> "$SUMMARY_FILE"
echo "### Most Frequently Run Scripts" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# Find most frequently run scripts (top 5)
find "$HISTORY_DIR" -type f -name "*.log" -exec basename {} \; | \
    sed 's/_[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_[0-9]\{2\}-[0-9]\{2\}-[0-9]\{2\}.log//' | \
    sort | uniq -c | sort -rn | head -n 5 | \
    while read -r count script; do
        echo "- \`$script\`: $count times" >> "$SUMMARY_FILE"
    done

chmod 644 "$SUMMARY_FILE"