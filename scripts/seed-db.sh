#!/bin/bash
# Wrapper for seed-db functionality
exec "$(dirname "$0")/database/seeding/local/seed-db.sh" "$@"
