#!/bin/bash
# Script to fix profile property access from camelCase to snake_case
# Changes: profile.isAdmin -> profile.is_admin, etc.

set -e

echo "🔧 Fixing profile property access..."
echo "========================================"

BACKUP_DIR="scripts/history/profile-props-backup-$(date +%Y-%m-%d_%H-%M-%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backups..."

# Find all TypeScript files in app/api that reference profile properties
find app/api -name "*.ts" -type f | while read -r file; do
  if grep -q "profile\\.is[ATS]" "$file" 2>/dev/null; then
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp "$file" "$BACKUP_DIR/$file"
    echo "  ✅ Backed up: $file"
  fi
done

echo ""
echo "🔄 Applying property access fixes..."

# Fix property access in conditionals and return statements
find app/api -name "*.ts" -type f -exec sed -i '' 's/profile\.isAdmin/profile.is_admin/g' {} \;
find app/api -name "*.ts" -type f -exec sed -i '' 's/profile\.isTeacher/profile.is_teacher/g' {} \;
find app/api -name "*.ts" -type f -exec sed -i '' 's/profile\.isStudent/profile.is_student/g' {} \;

# Fix optional chaining
find app/api -name "*.ts" -type f -exec sed -i '' 's/profile?\.isAdmin/profile?.is_admin/g' {} \;
find app/api -name "*.ts" -type f -exec sed -i '' 's/profile?\.isTeacher/profile?.is_teacher/g' {} \;
find app/api -name "*.ts" -type f -exec sed -i '' 's/profile?\.isStudent/profile?.is_student/g' {} \;

echo "  ✅ Property access updated"

echo ""
echo "✨ Profile property access fixes complete!"
echo "📝 Backups saved to: $BACKUP_DIR"
