#!/bin/bash
# Wrapper for new-feature functionality
exec "$(dirname "$0")/development/new-feature.sh" "$@"
