#!/bin/bash

# Worktree Dev Server Manager
# Start/stop/status a Next.js dev server from a git worktree

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Project root (main working directory)
PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "")"
if [ -z "$PROJECT_ROOT" ]; then
  echo -e "${RED}Error: Not inside a git repository${NC}"
  exit 1
fi

# Worktree base directory
WT_BASE="$PROJECT_ROOT/.claude/worktrees"

# Resolve worktree path
resolve_worktree() {
  local name="$1"
  local wt_path="$WT_BASE/$name"
  if [ ! -d "$wt_path" ]; then
    echo -e "${RED}Error: Worktree '$name' not found at $wt_path${NC}"
    echo -e "Available worktrees:"
    ls -1 "$WT_BASE" 2>/dev/null || echo "  (none)"
    exit 1
  fi
  echo "$wt_path"
}

# PID/log file paths (in /tmp, auto-cleaned on reboot)
pid_file() { echo "/tmp/wt-$1-pid"; }
log_file() { echo "/tmp/wt-$1-log"; }

# Check if port is in use
check_port() {
  lsof -Pi :"$1" -sTCP:LISTEN -t >/dev/null 2>&1
}

# Kill process on port
kill_port() {
  if check_port "$1"; then
    echo -e "${YELLOW}Killing existing process on port $1${NC}"
    lsof -ti:"$1" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

# --- Subcommands ---

cmd_start() {
  local name="$1"
  local port="${2:-3001}"
  local wt_path
  wt_path="$(resolve_worktree "$name")"

  echo -e "${BLUE}Starting dev server for worktree '$name' on port $port${NC}"

  # Check if already running
  local pf
  pf="$(pid_file "$name")"
  if [ -f "$pf" ] && kill -0 "$(cat "$pf")" 2>/dev/null; then
    echo -e "${YELLOW}Server already running (PID $(cat "$pf"))${NC}"
    echo -e "Stop it first: $0 stop $name"
    exit 1
  fi

  # Kill anything on the target port
  if check_port "$port"; then
    echo -e "${YELLOW}Port $port is occupied${NC}"
    kill_port "$port"
  fi

  # Install node_modules if missing
  if [ ! -d "$wt_path/node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    (cd "$wt_path" && npm install --prefer-offline --no-audit --no-fund)
  fi

  # Symlink .env.local if missing
  if [ ! -f "$wt_path/.env.local" ] && [ -f "$PROJECT_ROOT/.env.local" ]; then
    echo -e "${YELLOW}Symlinking .env.local${NC}"
    ln -sf "$PROJECT_ROOT/.env.local" "$wt_path/.env.local"
  fi

  # Start Next.js dev server (bypass nodemon — simpler from worktree)
  local lf
  lf="$(log_file "$name")"
  NODE_OPTIONS='--max-http-header-size=65536' PORT="$port" \
    npx --prefix "$wt_path" next dev "$wt_path" > "$lf" 2>&1 &
  local pid=$!
  echo "$pid" > "$pf"

  echo -e "${BLUE}Server starting (PID $pid)...${NC}"

  # Poll for readiness (15 attempts, 2s apart = 30s max)
  local attempts=0
  local max_attempts=15
  while [ $attempts -lt $max_attempts ]; do
    sleep 2
    if curl -s -o /dev/null -w '' "http://localhost:$port" 2>/dev/null; then
      echo ""
      echo -e "${GREEN}Server ready at http://localhost:$port${NC}"
      echo -e "  Worktree: $wt_path"
      echo -e "  Branch:   $(git -C "$wt_path" branch --show-current)"
      echo -e "  PID:      $pid"
      echo -e "  Logs:     $lf"
      return 0
    fi
    # Check if process died
    if ! kill -0 "$pid" 2>/dev/null; then
      echo ""
      echo -e "${RED}Server failed to start. Last 20 lines of log:${NC}"
      tail -20 "$lf" 2>/dev/null
      rm -f "$pf"
      return 1
    fi
    attempts=$((attempts + 1))
    printf "."
  done

  echo ""
  echo -e "${YELLOW}Server may still be starting (timed out after 30s)${NC}"
  echo -e "Check manually: curl http://localhost:$port"
  echo -e "Logs: tail -f $lf"
}

cmd_stop() {
  local name="$1"
  local pf
  pf="$(pid_file "$name")"

  if [ -f "$pf" ]; then
    local pid
    pid="$(cat "$pf")"
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      sleep 1
      # Force kill if still alive
      kill -0 "$pid" 2>/dev/null && kill -9 "$pid" 2>/dev/null || true
      echo -e "${GREEN}Stopped server for '$name' (PID $pid)${NC}"
    else
      echo -e "${YELLOW}Server was not running (stale PID file)${NC}"
    fi
    rm -f "$pf"
  else
    echo -e "${YELLOW}No PID file found for '$name'${NC}"
  fi

  # Clean up log file
  local lf
  lf="$(log_file "$name")"
  [ -f "$lf" ] && rm -f "$lf"
}

cmd_status() {
  local name="$1"
  local pf
  pf="$(pid_file "$name")"

  if [ -f "$pf" ] && kill -0 "$(cat "$pf")" 2>/dev/null; then
    local pid
    pid="$(cat "$pf")"
    echo -e "${GREEN}Running${NC} (PID $pid)"
    echo -e "  Logs: $(log_file "$name")"
  else
    echo -e "${RED}Not running${NC}"
    [ -f "$pf" ] && rm -f "$pf"
  fi
}

cmd_logs() {
  local name="$1"
  local lf
  lf="$(log_file "$name")"

  if [ -f "$lf" ]; then
    tail -50 "$lf"
  else
    echo -e "${YELLOW}No log file found for '$name'${NC}"
  fi
}

# --- Main ---

COMMAND="${1:-help}"
NAME="$2"
PORT_ARG="$3"

case "$COMMAND" in
  start)
    [ -z "$NAME" ] && { echo -e "${RED}Usage: $0 start <name> [port]${NC}"; exit 1; }
    cmd_start "$NAME" "$PORT_ARG"
    ;;
  stop)
    [ -z "$NAME" ] && { echo -e "${RED}Usage: $0 stop <name>${NC}"; exit 1; }
    cmd_stop "$NAME"
    ;;
  status)
    [ -z "$NAME" ] && { echo -e "${RED}Usage: $0 status <name>${NC}"; exit 1; }
    cmd_status "$NAME"
    ;;
  logs)
    [ -z "$NAME" ] && { echo -e "${RED}Usage: $0 logs <name>${NC}"; exit 1; }
    cmd_logs "$NAME"
    ;;
  help|*)
    echo "Worktree Dev Server Manager"
    echo ""
    echo "Usage: $0 <command> <worktree-name> [port]"
    echo ""
    echo "Commands:"
    echo "  start <name> [port]  Start Next.js dev server (default port: 3001)"
    echo "  stop <name>          Stop the dev server"
    echo "  status <name>        Check if server is running"
    echo "  logs <name>          Show last 50 lines of server log"
    echo "  help                 Show this help"
    ;;
esac
