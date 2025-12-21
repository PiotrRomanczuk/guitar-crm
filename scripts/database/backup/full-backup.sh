#!/bin/bash
set -e

# Full Database Backup Script
# Dumps public, auth, and storage schemas
# WARNING: Contains sensitive data!

# Check for required env vars
if [ -z "$PGHOST" ] || [ -z "$PGPASSWORD" ]; then
  echo "❌ Error: PGHOST and PGPASSWORD environment variables are required."
  exit 1
fi

# Resolve IPv4 address to avoid IPv6 connection issues on GitHub Actions
echo "Resolving IPv4 for $PGHOST..."
PGHOST_IPV4=$(node -e "require('dns').lookup(process.env.PGHOST, { family: 4 }, (err, address) => { if (err) { console.error(err); process.exit(1); } console.log(address); })")
echo "Resolved to: $PGHOST_IPV4"

TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql"

echo "📦 Starting full database backup..."
echo "Target: $PGHOST ($PGHOST_IPV4)"
echo "Schemas: public, auth, storage"

# Dump public, auth, and storage schemas
# --clean: Include commands to drop database objects before creating them
# --if-exists: Use IF EXISTS when dropping objects
# --no-owner: Do not output commands to set ownership of objects
# --no-acl: Do not output commands to set privileges (grant/revoke)
pg_dump \
  -h "$PGHOST_IPV4" \
  -p "${PGPORT:-5432}" \
  -U "${PGUSER:-postgres}" \
  -d "${PGDATABASE:-postgres}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  --schema=public \
  --schema=auth \
  --schema=storage \
  --file="$BACKUP_FILE"

echo "✅ Backup completed: $BACKUP_FILE"
echo "⚠️  WARNING: This backup contains sensitive data (PII, password hashes)."
echo "⚠️  Ensure this artifact is handled securely."
