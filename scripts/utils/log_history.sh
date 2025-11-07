#!/bin/bash

# Utility script for logging script execution history
# Usage: source log_history.sh

# Base directory for history logs - use absolute path to project root
HISTORY_DIR="/Users/piotrromanczuk/Desktop/guitar-crm/scripts/history"

# Function to log script execution
log_execution() {
    local script_path="$1"
    local exit_code="$2"
    local output="$3"
    local duration="$4"
    
    # Get the directory of the current script
    local UTILS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Get the category from the script path
    local category=$(echo "$script_path" | grep -o 'database\|ci\|development\|testing\|setup')
    if [ -z "$category" ]; then
        category="other"
    fi
    
    # Create timestamp
    local timestamp=$(date '+%Y-%m-%d_%H-%M-%S')
    
    # Get script name without path and extension
    local script_name=$(basename "$script_path" | sed 's/\.[^.]*$//')
    
    # Create log directory if it doesn't exist
    local log_dir="$HISTORY_DIR/$category"
    mkdir -p "$log_dir"
    chmod 755 "$log_dir"
    
    # Create log file
    local log_file="$log_dir/${script_name}_${timestamp}.log"
    
    # Write log entry
    {
        echo "Script: $script_path"
        echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "Duration: ${duration}s"
        echo "Exit Code: $exit_code"
        echo "Git Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'N/A')"
        echo "Git Commit: $(git rev-parse HEAD 2>/dev/null || echo 'N/A')"
        echo "User: $USER"
        echo "Node Version: $(node -v 2>/dev/null || echo 'N/A')"
        echo "System: $(uname -a)"
        echo "----------------------------------------"
        echo "Output:"
        echo "$output"
    } > "$log_file"
    
    echo "📝 Execution logged to: $log_file"
    
    # Update the summary file
    bash "$UTILS_DIR/update_summary.sh"
}

# Function to time and log script execution
run_with_logging() {
    local script_path="$1"
    shift
    local start_time=$(date +%s)
    
    # Create temporary file for output
    local temp_output=$(mktemp)
    
    # Run the script and capture both stdout and stderr
    { time bash "$script_path" "$@"; } 2>&1 | tee "$temp_output"
    local exit_code=${PIPESTATUS[0]}
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Get the output from temporary file
    local output=$(cat "$temp_output")
    rm "$temp_output"
    
    # Log the execution
    log_execution "$script_path" "$exit_code" "$output" "$duration"
    
    return $exit_code
}

# Function to view history for a specific script or category
view_history() {
    local search_term="$1"
    local category="$2"
    
    if [ -n "$category" ]; then
        local search_dir="$HISTORY_DIR/$category"
    else
        local search_dir="$HISTORY_DIR"
    fi
    
    if [ -n "$search_term" ]; then
        find "$search_dir" -type f -name "*${search_term}*.log" -exec sh -c 'echo "=== {} ==="; head -n 7 "{}"' \;
    else
        find "$search_dir" -type f -name "*.log" -exec sh -c 'echo "=== {} ==="; head -n 7 "{}"' \;
    fi
}

# Function to clean old history logs
clean_history() {
    local days="$1"
    if [ -z "$days" ]; then
        days=30
    fi
    
    find "$HISTORY_DIR" -type f -name "*.log" -mtime "+$days" -delete
    echo "🧹 Cleaned history logs older than $days days"
}