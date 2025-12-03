#!/bin/bash
# Wrapper for tdd-reminder functionality
exec "$(dirname "$0")/testing/tdd-reminder.sh" "$@"
