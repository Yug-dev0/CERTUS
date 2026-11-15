@echo off
REM CERTUS Turnkey Application Launcher for Windows
echo ========================================================
echo   CERTUS - Sovereign Industrial AI Workbench
echo ========================================================
echo.

REM 1. Check Ollama
echo [1/3] Checking Ollama engine...
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Ollama...
    start /B ollama serve
    timeout /t 3 /nobreak >nul
) else (
    echo Ollama is online.
)

REM 2. Check Backend API
echo [2/3] Checking Backend API on port 8000...
curl -s http://127.0.0.1:8000/api/ready >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Backend API...
    start /B python -m uvicorn backend.api.main:app --host 127.0.0.1 --port 8000 --timeout-keep-alive 75
    timeout /t 3 /nobreak >nul
) else (
    echo Backend API is online.
)

REM 3. Check Frontend
echo [3/3] Checking Frontend Console on port 3000...
curl -s http://127.0.0.1:3000/ >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Web Console...
    cd frontend && start /B npx next start -H 127.0.0.1 -p 3000 && cd ..
    timeout /t 3 /nobreak >nul
) else (
    echo Web Console is online.
)

echo.
echo Launching Workbench interface...
start "" "http://localhost:3000"
echo CERTUS is running at http://localhost:3000
pause
