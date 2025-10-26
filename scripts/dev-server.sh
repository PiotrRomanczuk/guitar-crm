#!/bin/bash

# Development Server Manager
# Manages multiple development services

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 GUITAR CRM - DEVELOPMENT SERVER${NC}"
echo "=================================="

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    if check_port $1; then
        echo -e "${YELLOW}🔄 Killing process on port $1${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Parse command line arguments
COMMAND=${1:-"start"}
SERVICE=${2:-"all"}

case $COMMAND in
    "start")
        echo "🎯 Starting development services..."
        
        case $SERVICE in
            "all")
                echo "🗄️  Starting Supabase..."
                supabase start
                
                echo "⚛️  Starting Next.js..."
                npm run dev
                ;;
            "next")
                echo "⚛️  Starting Next.js only..."
                npm run dev
                ;;
            "db")
                echo "🗄️  Starting Supabase only..."
                supabase start
                ;;
            *)
                echo -e "${RED}❌ Unknown service: $SERVICE${NC}"
                echo "Available services: all, next, db"
                exit 1
                ;;
        esac
        ;;
        
    "stop")
        echo "🛑 Stopping development services..."
        
        case $SERVICE in
            "all")
                echo "🗄️  Stopping Supabase..."
                supabase stop
                
                echo "⚛️  Stopping Next.js..."
                kill_port 3000
                ;;
            "next")
                echo "⚛️  Stopping Next.js..."
                kill_port 3000
                ;;
            "db")
                echo "🗄️  Stopping Supabase..."
                supabase stop
                ;;
            *)
                echo -e "${RED}❌ Unknown service: $SERVICE${NC}"
                echo "Available services: all, next, db"
                exit 1
                ;;
        esac
        ;;
        
    "restart")
        echo "🔄 Restarting development services..."
        $0 stop $SERVICE
        sleep 3
        $0 start $SERVICE
        ;;
        
    "status")
        echo "📊 Development services status:"
        
        # Check Next.js
        if check_port 3000; then
            echo -e "${GREEN}✅ Next.js running on http://localhost:3000${NC}"
        else
            echo -e "${RED}❌ Next.js not running${NC}"
        fi
        
        # Check Supabase services
        if check_port 54321; then
            echo -e "${GREEN}✅ Supabase API running on http://localhost:54321${NC}"
        else
            echo -e "${RED}❌ Supabase API not running${NC}"
        fi
        
        if check_port 54323; then
            echo -e "${GREEN}✅ Supabase Studio running on http://localhost:54323${NC}"
        else
            echo -e "${RED}❌ Supabase Studio not running${NC}"
        fi
        
        if check_port 54322; then
            echo -e "${GREEN}✅ PostgreSQL running on localhost:54322${NC}"
        else
            echo -e "${RED}❌ PostgreSQL not running${NC}"
        fi
        ;;
        
    "logs")
        case $SERVICE in
            "db")
                echo "📜 Showing Supabase logs..."
                supabase logs
                ;;
            *)
                echo "📜 Available logs: db"
                ;;
        esac
        ;;
        
    "help"|*)
        echo "Guitar CRM Development Server Manager"
        echo ""
        echo "Usage: $0 <command> [service]"
        echo ""
        echo "Commands:"
        echo "  start [all|next|db]  - Start development services"
        echo "  stop [all|next|db]   - Stop development services"
        echo "  restart [all|next|db] - Restart development services"
        echo "  status               - Show services status"
        echo "  logs [db]           - Show service logs"
        echo "  help                - Show this help"
        echo ""
        echo "Services:"
        echo "  all  - All services (default)"
        echo "  next - Next.js development server"
        echo "  db   - Supabase database services"
        echo ""
        echo "Examples:"
        echo "  $0 start           # Start all services"
        echo "  $0 start next      # Start only Next.js"
        echo "  $0 stop db         # Stop only database"
        echo "  $0 restart all     # Restart everything"
        echo "  $0 status          # Check what's running"
        ;;
esac