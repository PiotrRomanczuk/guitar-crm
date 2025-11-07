#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p scripts/history/database

# Generate timestamp and log file name
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="scripts/history/database/db-reset_${TIMESTAMP}.log"
REPORT_FILE="scripts/history/database/db-quality-report_${TIMESTAMP}.md"

# Run supabase db reset and capture output
echo "Running database reset at ${TIMESTAMP}..." | tee -a "$LOG_FILE"
echo "----------------------------------------" | tee -a "$LOG_FILE"

# Run the command and capture both stdout and stderr
(supabase db reset) 2>&1 | tee -a "$LOG_FILE"

# Capture the exit code
EXIT_CODE=${PIPESTATUS[0]}

# If reset was successful, update dev user passwords via API
if [ $EXIT_CODE -eq 0 ]; then
    echo "" | tee -a "$LOG_FILE"
    echo "Updating development user passwords via API..." | tee -a "$LOG_FILE"
    echo "----------------------------------------" | tee -a "$LOG_FILE"
    (node scripts/database/update-dev-passwords-via-api.js) 2>&1 | tee -a "$LOG_FILE"
    SEED_EXIT_CODE=${PIPESTATUS[0]}
    
    if [ $SEED_EXIT_CODE -ne 0 ]; then
        echo "⚠️  Warning: Password update failed with exit code: $SEED_EXIT_CODE" | tee -a "$LOG_FILE"
    fi
fi

# Create quality report
echo "# Database Reset Quality Report" > "$REPORT_FILE"
echo "## Date: ${TIMESTAMP}" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ $EXIT_CODE -eq 0 ]; then
    echo "### ✅ Reset successful" >> "$REPORT_FILE"
else
    echo "### ❌ Reset failed" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "## Details" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
cat "$LOG_FILE" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"

# Make the script executable
chmod +x "$0"

echo "----------------------------------------"
echo "Database reset completed with exit code: $EXIT_CODE"
echo "Full log saved to: $LOG_FILE"
echo "Quality report saved to: $REPORT_FILE"

exit $EXIT_CODE