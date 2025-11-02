#!/bin/bash

# Wrapper script to run commands with history logging
# Usage: ./run_with_history.sh <script_path> [arguments...]

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the logging utilities
source "$SCRIPT_DIR/utils/log_history.sh"

# Show usage if no arguments provided
if [ "$#" -eq 0 ]; then
    echo "Usage: $0 <script_path> [arguments...]"
    echo
    echo "Commands:"
    echo "  view [script_name] [category]  View execution history"
    echo "  clean [days]                   Clean history older than [days] (default: 30)"
    echo
    echo "Examples:"
    echo "  $0 database/seed-db.sh         Run seed-db.sh with logging"
    echo "  $0 view seed-db               View seed-db.sh history"
    echo "  $0 view '' database           View all database scripts history"
    echo "  $0 clean 7                    Clean logs older than 7 days"
    exit 1
fi

# Handle special commands
case "$1" in
    "view")
        view_history "$2" "$3"
        exit $?
        ;;
    "clean")
        clean_history "$2"
        exit $?
        ;;
esac

# Get the script path and verify it exists
SCRIPT_PATH="$1"
if [[ "$SCRIPT_PATH" != /* ]]; then
    SCRIPT_PATH="$SCRIPT_DIR/$SCRIPT_PATH"
fi

if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Script not found: $SCRIPT_PATH"
    exit 1
fi

# Run the script with logging
run_with_logging "$SCRIPT_PATH" "${@:2}"