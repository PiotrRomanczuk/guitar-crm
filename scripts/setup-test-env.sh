#!/bin/bash
# Wrapper for setup-test-env functionality
exec "$(dirname "$0")/setup/setup-test-env.sh" "$@"
