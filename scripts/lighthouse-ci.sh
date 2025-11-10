#!/bin/bash
# Wrapper for lighthouse-ci functionality
exec "$(dirname "$0")/ci/lighthouse-ci.sh" "$@"
