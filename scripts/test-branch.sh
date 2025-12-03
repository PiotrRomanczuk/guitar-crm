#!/bin/bash
# Wrapper for test-branch functionality
exec "$(dirname "$0")/testing/test-branch.sh" "$@"
