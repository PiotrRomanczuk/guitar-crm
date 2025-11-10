#!/bin/bash
# Wrapper for lighthouse-audit functionality
exec "$(dirname "$0")/ci/lighthouse-audit.sh" "$@"
