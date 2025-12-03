#!/bin/bash
# Wrapper for seed-remote functionality
exec "$(dirname "$0")/database/seeding/remote/seed-remote.sh" "$@"
