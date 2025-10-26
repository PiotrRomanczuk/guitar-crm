#!/bin/bash

# Database Setup and Management Script
# Handles Supabase local development setup

set -e  # Exit on any error

echo "🗄️  SUPABASE DATABASE SETUP"
echo "=========================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check if Docker is running (required for local Supabase)
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Start Supabase local development
echo "🚀 Starting Supabase local development..."
supabase start

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 5

# Apply migrations
echo "📋 Applying database migrations..."
supabase db reset

# Show connection info
echo ""
echo "✅ Database setup complete!"
echo ""
echo "🔗 Connection Details:"
echo "API URL: http://localhost:54321"
echo "GraphQL URL: http://localhost:54321/graphql/v1"
echo "DB URL: postgresql://postgres:postgres@localhost:54322/postgres"
echo "Studio URL: http://localhost:54323"
echo "Inbucket URL: http://localhost:54324"
echo "JWT secret: super-secret-jwt-token-with-at-least-32-characters-long"
echo "anon key: $(supabase status | grep 'anon key' | cut -d':' -f2 | xargs)"
echo "service_role key: $(supabase status | grep 'service_role key' | cut -d':' -f2 | xargs)"
echo ""
echo "💡 Don't forget to update your .env.local file with these values!"