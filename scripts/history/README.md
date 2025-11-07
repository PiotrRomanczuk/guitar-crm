# Script History Logging

This directory contains execution logs for all scripts in the project. Each script execution is logged with detailed information including:

- Timestamp
- Duration
- Exit code
- Git branch and commit
- User information
- Node.js version
- System information
- Complete output

## Directory Structure

```
history/
├── database/    # Database script logs
├── ci/          # CI/CD script logs
├── development/ # Development workflow logs
└── testing/     # Testing script logs
```

## Log Format

Each log file is named using the pattern: `script-name_YYYY-MM-DD_HH-MM-SS.log`

Example log content:

```
Script: /scripts/database/seed-db.sh
Timestamp: 2025-11-02 14:30:45
Duration: 3s
Exit Code: 0
Git Branch: feature/song-crud-implementation
Git Commit: abc123...
User: piotrromanczuk
Node Version: v18.0.0
System: Darwin macbook 21.0.1
----------------------------------------
Output:
[script output here]
```

## Viewing History

Use the `run_with_history.sh` script to view execution history:

```bash
# View all history for a specific script
./run_with_history.sh view seed-db

# View all database script history
./run_with_history.sh view "" database

# View specific script in category
./run_with_history.sh view seed-db database
```

## Cleaning Old Logs

Clean up old log files:

```bash
# Clean logs older than 30 days (default)
./run_with_history.sh clean

# Clean logs older than 7 days
./run_with_history.sh clean 7
```
