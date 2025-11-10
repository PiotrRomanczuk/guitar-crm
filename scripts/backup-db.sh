#!/bin/bash
# Wrapper for backup-db functionality
exec "$(dirname "$0")/database/backup/backup-db.sh" "$@"
