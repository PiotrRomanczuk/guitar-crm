# Database Management Scripts

This directory contains scripts for managing the Guitar CRM database, including backup, restore, seeding, and quality checks.

## Available Scripts

### Backup and Restore

- `backup-db.sh` - Create secure database backups without sensitive data
- `import-json-to-db.js` - Import data from JSON files into the database

### Data Seeding

- `generate-seed-sql.py` - Generate SQL seed data from templates
- `seed-assignments.ts` - Create sample lesson assignments
- `seed-db.sh` - Populate database with development data
- `seed-test-user.ts` - Create test user accounts
- `seed-remote.sh` - Seed remote database instances
- `seed-via-sql-editor.sql` - Direct SQL seeding script

### Quality Management

- `check-db-quality.sh` - Validate database structure and constraints
