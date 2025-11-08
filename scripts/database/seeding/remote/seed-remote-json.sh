#!/bin/bash

# Script to seed remote Supabase database from JSON backups using REST API
# This bypasses the CLI connection issues

set -e

echo "🚀 Seeding Remote Database from JSON Backups"
echo "============================================="
echo ""

# Configuration
BACKUP_DIR="supabase/backups/2025-10-26"
REMOTE_URL="https://tpnndkcdsjzvrziajeyb.supabase.co"

# Check for service role key
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not set"
    echo ""
    echo "Please get your service role key from:"
    echo "https://supabase.com/dashboard/project/tpnndkcdsjzvrziajeyb/settings/api"
    echo ""
    read -p "Enter your service role key: " SUPABASE_SERVICE_ROLE_KEY
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        echo "❌ Service role key is required"
        exit 1
    fi
fi

echo "✅ Configuration loaded"
echo ""

# Function to get allowed columns for a table
get_columns() {
    case "$1" in
        "profiles")
            echo "user_id,username,email,firstName,lastName,bio,isAdmin,isTeacher,isStudent,isActive,isTest,created_at,updated_at"
            ;;
        "songs")
            echo "title,author,level,key,chords,audio_files,ultimate_guitar_link,short_title,created_at,updated_at"
            ;;
        "lessons")
            echo "student_id,teacher_id,creator_user_id,date,time,start_time,status,lesson_number,lesson_teacher_number,title,notes,created_at,updated_at"
            ;;
        "lesson_songs")
            echo "lesson_id,song_id,student_id,song_status,created_at,updated_at"
            ;;
        "task_management")
            echo "user_id,title,description,status,priority,due_date,created_by_user_id,assigned_to_user_id,created_at,updated_at"
            ;;
        *)
            echo ""
            ;;
    esac
}

# Function to import data from JSON file
import_table() {
    local table=$1
    local file="$BACKUP_DIR/$table.json"
    
    if [ ! -f "$file" ]; then
        echo "⚠️  File not found: $file (skipping)"
        return
    fi
    
    local count=$(jq '. | length' "$file")
    
    if [ "$count" -eq 0 ]; then
        echo "⚠️  $table: No data to import (skipping)"
        return
    fi
    
    echo "📝 Importing $table ($count records)..."
    
    # Get allowed columns for this table
    local columns=$(get_columns "$table")
    
    if [ -z "$columns" ]; then
        echo "   ❌ No column mapping defined for $table"
        return 1
    fi
    
    # Filter to only allowed columns (removes id, canEdit, etc.)
    local temp_file=$(mktemp)
    jq --arg cols "$columns" '
        ($cols | split(",")) as $allowed_cols |
        map(
            . as $item |
            $allowed_cols | 
            map(. as $col | {($col): $item[$col]}) | 
            add
        )
    ' "$file" > "$temp_file"
    
    # Use curl to POST data via Supabase REST API
    response=$(curl -s -w "\n%{http_code}" -X POST \
        "$REMOTE_URL/rest/v1/$table" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=minimal" \
        -d @"$temp_file")
    
    http_code=$(echo "$response" | tail -n1)
    
    rm "$temp_file"
    
    if [ "$http_code" -eq 201 ] || [ "$http_code" -eq 200 ]; then
        echo "   ✅ $table imported successfully"
    else
        echo "   ❌ Failed to import $table (HTTP $http_code)"
        echo "$response" | head -n-1
        return 1
    fi
}

# Confirm before proceeding
echo "⚠️  This will insert data into your remote database!"
echo "📊 Tables to import:"
for file in "$BACKUP_DIR"/*.json; do
    if [ -f "$file" ]; then
        table=$(basename "$file" .json)
        count=$(jq '. | length' "$file")
        echo "   - $table: $count records"
    fi
done
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Aborted"
    exit 0
fi

echo ""
echo "🔄 Starting data import..."
echo ""

# Import in correct order (respecting foreign keys)
import_table "profiles"
import_table "songs"
import_table "lessons"
import_table "lesson_songs"
import_table "task_management"

echo ""
echo "🎉 Data import completed!"
echo ""
echo "🔍 Verify your data at:"
echo "https://supabase.com/dashboard/project/tpnndkcdsjzvrziajeyb/editor"
echo ""
