@echo off
echo ================================================
echo Starting Ollama Web Interface...
echo ================================================
echo.

REM Check if Ollama is running
echo Checking Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Ollama is running
) else (
    echo [WARNING] Ollama is not running
    echo Please start Ollama: ollama serve
    echo.
)

REM Start backend
echo.
echo Starting backend...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -q -r requirements.txt

echo [OK] Backend starting on http://localhost:8000
start /B python -m app.main

timeout /t 3 /nobreak >nul

REM Start frontend
echo.
echo Starting frontend...
cd ..\frontend

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo [OK] Frontend starting on http://localhost:5173
start /B npm run dev

echo.
echo ================================================
echo   Ollama Web Interface is running!
echo ================================================
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo   Press Ctrl+C to stop
echo ================================================
echo.

pause
