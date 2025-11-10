#!/bin/bash
# Wrapper for setup-db functionality
exec "$(dirname "$0")/setup/setup-db.sh" "$@"
