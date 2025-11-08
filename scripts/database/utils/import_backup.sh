#!/bin/bash

# Script to import backup data from remote Supabase into local development environment
# This script reads the JSON backups and inserts them into the local database

BACKUP_DIR="supabase/backups/$(date +%Y-%m-%d)"
LOCAL_API_URL="http://127.0.0.1:54321"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

echo "🔄 Starting data import from backup to local Supabase..."

# Function to import data to a table
import_table() {
    local table_name=$1
    local file_path=$2
    
    echo "📝 Importing $table_name..."
    
    # Check if file exists and has data
    if [ ! -f "$file_path" ] || [ ! -s "$file_path" ]; then
        echo "⚠️  Skipping $table_name - no data found"
        return
    fi
    
    # Get record count
    local count=$(jq length "$file_path")
    echo "   Found $count records"
    
    if [ "$count" -gt 0 ]; then
        # Import the data using curl
        curl -X POST "$LOCAL_API_URL/rest/v1/$table_name" \
             -H "apikey: $SERVICE_ROLE_KEY" \
             -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
             -H "Content-Type: application/json" \
             -H "Prefer: resolution=merge-duplicates" \
             -d @"$file_path"
        
        echo "   ✅ $table_name imported successfully"
    fi
}

# Clear existing data (optional - uncomment if you want to start fresh)
# echo "🗑️  Clearing existing data..."
# curl -X DELETE "$LOCAL_API_URL/rest/v1/profiles" -H "apikey: $SERVICE_ROLE_KEY" -H "Authorization: Bearer $SERVICE_ROLE_KEY"
# curl -X DELETE "$LOCAL_API_URL/rest/v1/songs" -H "apikey: $SERVICE_ROLE_KEY" -H "Authorization: Bearer $SERVICE_ROLE_KEY"
# curl -X DELETE "$LOCAL_API_URL/rest/v1/lessons" -H "apikey: $SERVICE_ROLE_KEY" -H "Authorization: Bearer $SERVICE_ROLE_KEY"
# curl -X DELETE "$LOCAL_API_URL/rest/v1/lesson_songs" -H "apikey: $SERVICE_ROLE_KEY" -H "Authorization: Bearer $SERVICE_ROLE_KEY"
# curl -X DELETE "$LOCAL_API_URL/rest/v1/task_management" -H "apikey: $SERVICE_ROLE_KEY" -H "Authorization: Bearer $SERVICE_ROLE_KEY"

# Important: Import in the correct order due to foreign key constraints
# 1. First import profiles (referenced by other tables)
import_table "profiles" "$BACKUP_DIR/profiles.json"

# 2. Then import songs (independent table)
import_table "songs" "$BACKUP_DIR/songs.json"

# 3. Then import lessons (references profiles)
import_table "lessons" "$BACKUP_DIR/lessons.json"

# 4. Then import lesson_songs (references both lessons and songs)
import_table "lesson_songs" "$BACKUP_DIR/lesson_songs.json"

# 5. Finally import task_management (references profiles)
import_table "task_management" "$BACKUP_DIR/task_management.json"

echo "🎉 Data import completed!"
echo ""
echo "📊 Summary:"
echo "   - Profiles: $(jq length $BACKUP_DIR/profiles.json 2>/dev/null || echo 0) records"
echo "   - Songs: $(jq length $BACKUP_DIR/songs.json 2>/dev/null || echo 0) records"
echo "   - Lessons: $(jq length $BACKUP_DIR/lessons.json 2>/dev/null || echo 0) records"
echo "   - Lesson Songs: $(jq length $BACKUP_DIR/lesson_songs.json 2>/dev/null || echo 0) records"
echo "   - Task Management: $(jq length $BACKUP_DIR/task_management.json 2>/dev/null || echo 0) records"
echo ""
echo "🌐 You can now verify the data at: http://127.0.0.1:54323"