#!/bin/bash
# Wrapper for setup-env functionality
exec "$(dirname "$0")/setup/setup-env.sh" "$@"
