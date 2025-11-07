#!/bin/bash

# Database Backup Script
# Creates secure backups without sensitive data

set -e

echo "💾 DATABASE BACKUP UTILITY"
echo "=========================="

# Create backup directory with timestamp
BACKUP_DIR="supabase/backups/$(date +%Y-%m-%d_%H-%M-%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Creating backup in: $BACKUP_DIR"

# Export schema only (no data)
echo "📋 Backing up database schema..."
supabase db dump --schema-only > "$BACKUP_DIR/schema_backup.sql"

# Export specific tables with anonymized data (if needed)
echo "🔒 Creating anonymized data exports..."

# Create a sanitized version of profiles (remove emails, phones, etc.)
cat > "$BACKUP_DIR/export_sanitized_data.sql" << 'EOL'
-- Sanitized data export for development/testing
-- This removes all personal information

-- Export lessons (safe - no personal data)
COPY (
  SELECT id, title, description, difficulty_level, duration_minutes, 
         created_at, updated_at
  FROM lessons
) TO STDOUT WITH CSV HEADER;

-- Export songs (safe - no personal data)  
COPY (
  SELECT id, title, artist, genre, difficulty_level, 
         chords, tabs, lyrics, created_at, updated_at
  FROM songs
) TO STDOUT WITH CSV HEADER;

-- Export anonymized profiles (remove personal data)
COPY (
  SELECT id, 
         'user_' || id::text as name,
         'test' || id::text || '@example.com' as email,
         role, skill_level, created_at, updated_at
  FROM profiles
) TO STDOUT WITH CSV HEADER;
EOL

# Create README for this backup
cat > "$BACKUP_DIR/README.md" << EOL
# Database Backup - $(date +"%Y-%m-%d %H:%M:%S")

## Contents

- \`schema_backup.sql\` - Complete database schema without data
- \`export_sanitized_data.sql\` - SQL script to export anonymized data

## Usage

### Restore Schema Only
\`\`\`bash
supabase db reset
psql -h localhost -p 54322 -U postgres -d postgres < schema_backup.sql
\`\`\`

### Export Sanitized Data
\`\`\`bash
psql -h localhost -p 54322 -U postgres -d postgres < export_sanitized_data.sql
\`\`\`

## Security Notes

- No personal data (emails, phone numbers, addresses) included
- All user data is anonymized
- Safe for development and testing environments
- Do NOT commit this backup to version control

## Backup Info

- Created: $(date +"%Y-%m-%d %H:%M:%S")
- Schema Version: $(supabase status | grep 'DB version' || echo 'N/A')
- Git Commit: $(git rev-parse HEAD 2>/dev/null || echo 'N/A')
EOL

echo "✅ Backup created successfully!"
echo ""
echo "📁 Backup location: $BACKUP_DIR"
echo "🔒 This backup contains NO sensitive personal data"
echo "📝 See $BACKUP_DIR/README.md for usage instructions"
echo ""
echo "⚠️  Remember: Never commit backups to git!"