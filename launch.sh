#!/usr/bin/env bash
#
# CERTUS Turnkey Application Launcher
# Starts local Ollama, Backend API, and Frontend, then launches the Workbench App.
#

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

mkdir -p storage/logs

GREEN='\033[0;32m'
LIME='\033[38;2;212;242;74m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m' # No Color

print_banner() {
  echo -e "${LIME}"
  echo "  ╔═══════════════════════════════════════════════════════════╗"
  echo "  ║   ██████╗███████╗██████╗ ████████╗██╗   ██╗███████╗       ║"
  echo "  ║  ██╔════╝██╔════╝██╔══██╗╚══██╔══╝██║   ██║██╔════╝       ║"
  echo "  ║  ██║     █████╗  ██████╔╝   ██║   ██║   ██║███████╗       ║"
  echo "  ║  ██║     ██╔══╝  ██╔══██╗   ██║   ██║   ██║╚════██║       ║"
  echo "  ║  ╚██████╗███████╗██║  ██║   ██║   ╚██████╔╝███████║       ║"
  echo "  ║   ╚═════╝╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚══════╝       ║"
  echo "  ║      ON-PREMISE AGENTIC AI WORKBENCH · AIR-GAPPED         ║"
  echo "  ╚═══════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

print_banner

# 1. Check or start Ollama
echo -e "${CYAN}▸ [1/4] Checking Local Ollama Model Engine...${NC}"
if curl -sf -o /dev/null --max-time 2 "http://127.0.0.1:11434/api/tags"; then
  echo -e "  ${GREEN}✓${NC} Ollama is online on http://127.0.0.1:11434"
else
  if command -v ollama >/dev/null 2>&1; then
    echo -e "  ${YELLOW}!${NC} Ollama not running. Starting Ollama daemon in background..."
    if [ -x "scripts/start-ollama.sh" ]; then
      ./scripts/start-ollama.sh --tier laptop-16gb > storage/logs/ollama.log 2>&1 &
    else
      ollama serve > storage/logs/ollama.log 2>&1 &
    fi
    for i in {1..15}; do
      if curl -sf -o /dev/null --max-time 1 "http://127.0.0.1:11434/api/tags"; then
        echo -e "  ${GREEN}✓${NC} Ollama started successfully"
        break
      fi
      sleep 1
    done
  else
    echo -e "  ${YELLOW}!${NC} Ollama CLI not found on PATH. If Ollama runs in Docker or another host, verify http://127.0.0.1:11434"
  fi
fi

# List installed models
INSTALLED_MODELS=$(curl -s "http://127.0.0.1:11434/api/tags" 2>/dev/null | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | tr '\n' ' ' || true)
if [ -n "$INSTALLED_MODELS" ]; then
  echo -e "  ${DIM}Installed models:${NC} ${INSTALLED_MODELS}"
else
  echo -e "  ${YELLOW}!${NC} No models found in Ollama yet."
  echo -e "    Recommended: ${LIME}ollama pull qwen2.5:3b${NC} and ${LIME}ollama pull nomic-embed-text${NC}"
fi

# 2. Check or start Backend API
echo -e "${CYAN}▸ [2/4] Checking CERTUS Backend API...${NC}"
if curl -sf -o /dev/null --max-time 2 "http://127.0.0.1:8000/api/ready"; then
  echo -e "  ${GREEN}✓${NC} Backend API is already running on port 8000"
else
  echo -e "  ${YELLOW}!${NC} Starting Backend API server on 127.0.0.1:8000..."
  PYTHON="python3"
  if [ -x ".venv/bin/python" ]; then
    PYTHON=".venv/bin/python"
  fi
  SOVEREIGN_PROFILE=laptop-16gb nohup "$PYTHON" -m uvicorn backend.api.main:app --host 127.0.0.1 --port 8000 --timeout-keep-alive 75 > storage/logs/api.log 2>&1 &
  for i in {1..20}; do
    if curl -sf -o /dev/null --max-time 1 "http://127.0.0.1:8000/"; then
      echo -e "  ${GREEN}✓${NC} Backend API is up and running"
      break
    fi
    sleep 1
  done
fi

# 3. Check or start Frontend Console
echo -e "${CYAN}▸ [3/4] Checking CERTUS Web Console...${NC}"
if curl -sf -o /dev/null --max-time 2 "http://127.0.0.1:3000/"; then
  echo -e "  ${GREEN}✓${NC} Web console is already running on port 3000"
else
  echo -e "  ${YELLOW}!${NC} Starting Web console on 127.0.0.1:3000..."
  if [ ! -d "frontend/.next" ]; then
    echo -e "  ${DIM}Building frontend for first run...${NC}"
    (cd frontend && npm run build > ../storage/logs/build.log 2>&1)
  fi
  (cd frontend && nohup npx next start -H 127.0.0.1 -p 3000 > ../storage/logs/web.log 2>&1 &)
  for i in {1..20}; do
    if curl -sf -o /dev/null --max-time 1 "http://127.0.0.1:3000/"; then
      echo -e "  ${GREEN}✓${NC} Web console is ready"
      break
    fi
    sleep 1
  done
fi

# 4. Open Application Window
echo -e "${CYAN}▸ [4/4] Launching CERTUS App Interface...${NC}"
APP_URL="http://localhost:3000"

open_app() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -d "/Applications/Google Chrome.app" ]; then
      # Opens as a clean, native-feeling standalone app window without address bar or browser tabs!
      open -na "Google Chrome" --args --app="$APP_URL"
    else
      open "$APP_URL"
    fi
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v google-chrome >/dev/null 2>&1; then
      google-chrome --app="$APP_URL" >/dev/null 2>&1 &
    elif command -v chromium >/dev/null 2>&1; then
      chromium --app="$APP_URL" >/dev/null 2>&1 &
    else
      xdg-open "$APP_URL" >/dev/null 2>&1 &
    fi
  elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "win32"* ]]; then
    start "" "$APP_URL"
  else
    echo "Please open $APP_URL in your browser."
  fi
}

open_app

echo
echo -e "  ${LIME}● CERTUS IS LIVE & CONNECTED${NC}"
echo -e "  ${DIM}------------------------------------------------------------${NC}"
echo -e "  Workbench URL : ${GREEN}${APP_URL}${NC}"
echo -e "  Backend API   : ${GREEN}http://127.0.0.1:8000${NC}"
echo -e "  Ollama Engine : ${GREEN}http://127.0.0.1:11434${NC}"
echo -e "  Default Login : ${CYAN}engineer${NC} / ${CYAN}workbench${NC}"
echo -e "  ${DIM}------------------------------------------------------------${NC}"
echo
echo -e "  [o] Re-open app window"
echo -e "  [m] Pull recommended models (qwen2.5:3b + nomic-embed-text)"
echo -e "  [s] Check platform readiness status"
echo -e "  [q] Stop services and exit"
echo

stop_all() {
  echo -e "\n${YELLOW}Stopping CERTUS services...${NC}"
  pkill -f "next-server" 2>/dev/null || true
  pkill -f "uvicorn backend.api.main" 2>/dev/null || true
  echo -e "${GREEN}✓ Services stopped.${NC}"
}

while true; do
  read -r -p "Select option [o/m/s/q]: " choice || break
  case "$choice" in
    o|O)
      echo "Opening app window..."
      open_app
      ;;
    m|M)
      echo "Pulling recommended models..."
      ollama pull qwen2.5:3b
      ollama pull nomic-embed-text
      echo -e "${GREEN}✓ Models downloaded.${NC}"
      ;;
    s|S)
      echo -e "\nSystem readiness report:"
      curl -s "http://127.0.0.1:8000/api/ready" | jq . 2>/dev/null || curl -s "http://127.0.0.1:8000/api/ready"
      echo
      ;;
    q|Q)
      stop_all
      exit 0
      ;;
    *)
      ;;
  esac
done
