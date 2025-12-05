#!/bin/bash

# Get project root relative to this script (scripts/utils/log_history.sh -> ../../)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOGS_DIR="$PROJECT_ROOT/logs"
HISTORY_DIR="$LOGS_DIR/history"

# Ensure directories exist
mkdir -p "$LOGS_DIR"
mkdir -p "$HISTORY_DIR/ci"
mkdir -p "$HISTORY_DIR/deploy"

# Function to log execution details
log_execution() {
    local script_name=$1
    local status=$2
    local output=$3
    local duration=$4
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_file="$LOGS_DIR/execution.log"
    local status_icon="✅"
    
    if [ "$status" -ne 0 ]; then
        status_icon="❌"
    fi
    
    # Append to main log file
    echo "[$timestamp] $status_icon $script_name | Duration: ${duration}s" >> "$log_file"
}
