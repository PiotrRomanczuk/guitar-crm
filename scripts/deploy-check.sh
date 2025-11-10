#!/bin/bash
# Wrapper for deploy-check functionality
exec "$(dirname "$0")/ci/deploy-check.sh" "$@"
