#!/bin/bash

# Enhanced script to import backup data with schema compatibility fixes
BACKUP_DIR="supabase/backups/$(date +%Y-%m-%d)"
LOCAL_API_URL="http://127.0.0.1:54321"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

echo "🔄 Starting enhanced data import..."

# Import profiles without auto-generated ID
if [ -f "$BACKUP_DIR/profiles.json" ]; then
    echo "📝 Importing profiles (without ID field)..."
    
    # Remove the 'id' field since it's auto-generated
    jq 'map(del(.id))' "$BACKUP_DIR/profiles.json" > /tmp/profiles_clean.json
    
    count=$(jq length /tmp/profiles_clean.json)
    echo "   Processing $count profiles..."
    
    curl -X POST "$LOCAL_API_URL/rest/v1/profiles" \
         -H "apikey: $SERVICE_ROLE_KEY" \
         -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
         -H "Content-Type: application/json" \
         -d @/tmp/profiles_clean.json
    
    rm /tmp/profiles_clean.json
    echo "   ✅ Profiles processed"
fi

# Import songs with chord array fix
if [ -f "$BACKUP_DIR/songs.json" ]; then
    echo "📝 Importing songs (fixing chord arrays)..."
    
    # Fix the chords field - convert string to proper array format
    jq 'map(
        if .chords and (.chords | type) == "string" then
            .chords = (.chords | split(",") | map(gsub("^\\s+|\\s+$"; "")))
        else
            .
        end
    )' "$BACKUP_DIR/songs.json" > /tmp/songs_clean.json
    
    count=$(jq length /tmp/songs_clean.json)
    echo "   Processing $count songs..."
    
    curl -X POST "$LOCAL_API_URL/rest/v1/songs" \
         -H "apikey: $SERVICE_ROLE_KEY" \
         -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
         -H "Content-Type: application/json" \
         -d @/tmp/songs_clean.json
    
    rm /tmp/songs_clean.json
    echo "   ✅ Songs processed"
fi

echo "🎉 Enhanced import completed!"
echo ""
echo "🔍 Verifying imported data..."

# Check what was actually imported
profiles_count=$(curl -s "$LOCAL_API_URL/rest/v1/profiles?select=count" -H "apikey: $SERVICE_ROLE_KEY" -H "Authorization: Bearer $SERVICE_ROLE_KEY" -H "Prefer: count=exact" | jq '.[0].count')
songs_count=$(curl -s "$LOCAL_API_URL/rest/v1/songs?select=count" -H "apikey: $SERVICE_ROLE_KEY" -H "Authorization: Bearer $SERVICE_ROLE_KEY" -H "Prefer: count=exact" | jq '.[0].count')

echo "📊 Actually imported:"
echo "   - Profiles: $profiles_count records"
echo "   - Songs: $songs_count records"
echo ""
echo "🌐 View your data at: http://127.0.0.1:54323"