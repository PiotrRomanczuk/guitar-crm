#!/bin/bash
# Wrapper for dev-server functionality
exec "$(dirname "$0")/development/dev-server.sh" "$@"
