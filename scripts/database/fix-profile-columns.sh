#!/bin/bash
# Script to fix profile column references across the codebase
# Changes: user_id -> id, camelCase columns -> snake_case

set -e

echo "🔧 Fixing profile column references..."
echo "========================================"

# Files to update
FILES=(
  "app/api/teacher/students/route.ts"
  "app/api/lessons/create/route.ts"
  "app/api/dashboard/stats/route.ts"
  "app/api/song/stats/route.ts"
  "app/api/song/export/route.ts"
  "app/api/admin/users/route.ts"
  "app/api/profiles/route.ts"
)

# Backup directory
BACKUP_DIR="scripts/history/profile-fixes-backup-$(date +%Y-%m-%d_%H-%M-%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backups in $BACKUP_DIR..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/$(basename $file)"
    echo "  ✅ Backed up: $file"
  fi
done

echo ""
echo "🔄 Applying fixes..."

# Fix 1: Change user_id to id in profiles queries
find app/api -name "*.ts" -type f -exec sed -i '' 's/\.eq('\''user_id'\'', userId)/\.eq('\''id'\'', userId)/g' {} \;

# Fix 2: Change SELECT column names from camelCase to snake_case
find app/api -name "*.ts" -type f -exec sed -i '' "s/\.select('isAdmin, isTeacher, isStudent')/\.select('is_admin, is_teacher, is_student')/g" {} \;
find app/api -name "*.ts" -type f -exec sed -i '' 's/\.select("isAdmin, isTeacher, isStudent")/\.select("is_admin, is_teacher, is_student")/g' {} \;
find app/api -name "*.ts" -type f -exec sed -i '' "s/\.select('isAdmin, isTeacher')/\.select('is_admin, is_teacher')/g" {} \;
find app/api -name "*.ts" -type f -exec sed -i '' 's/\.select("isAdmin, isTeacher")/\.select("is_admin, is_teacher")/g' {} \;
find app/api -name "*.ts" -type f -exec sed -i '' "s/\.select('isAdmin')/\.select('is_admin')/g" {} \;
find app/api -name "*.ts" -type f -exec sed -i '' 's/\.select("isAdmin")/\.select("is_admin")/g' {} \;
find app/api -name "*.ts" -type f -exec sed -i '' "s/\.select('user_id, full_name, isStudent')/\.select('id, full_name, is_student')/g" {} \;

# Fix 3: Change eq() filters for boolean columns
find app/api -name "*.ts" -type f -exec sed -i '' "s/\.eq('isStudent', true)/\.eq('is_student', true)/g" {} \;
find app/api -name "*.ts" -type f -exec sed -i '' 's/\.eq("isStudent", true)/\.eq("is_student", true)/g' {} \;
find app/api -name "*.ts" -type f -exec sed -i '' "s/\.eq('isTeacher', true)/\.eq('is_teacher', true)/g" {} \;
find app/api -name "*.ts" -type f -exec sed -i '' 's/\.eq("isTeacher", true)/\.eq("is_teacher", true)/g' {} \;

echo "  ✅ Column names updated"

echo ""
echo "✨ Profile column fixes complete!"
echo ""
echo "⚠️  Note: You'll need to update the JavaScript code that accesses"
echo "   these properties to use the correct snake_case field names:"
echo "   - profile.isAdmin  -> profile.is_admin"
echo "   - profile.isTeacher -> profile.is_teacher"
echo "   - profile.isStudent -> profile.is_student"
echo ""
echo "📝 Backups saved to: $BACKUP_DIR"
