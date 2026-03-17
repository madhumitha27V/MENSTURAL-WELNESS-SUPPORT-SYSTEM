@echo off
REM EUPHORIA Hackathon Submission - Quick Start

echo.
echo ╔════════════════════════════════════════════════╗
echo ║   EUPHORIA - Menstrual Health App Submission   ║
echo ║              Hackathon Ready!                   ║
echo ╚════════════════════════════════════════════════╝
echo.

echo What would you like to do?
echo.
echo 1. Start Development Server (Mobile App)
echo 2. Start Backend API Server
echo 3. Setup Database
echo 4. View Documentation
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Starting EUPHORIA Mobile Development Server...
    cd /d "%~dp0EUPHORIA2.0\mobile"
    call node dev-server.js
) else if "%choice%"=="2" (
    echo.
    echo Starting Backend API Server...
    cd /d "%~dp0EUPHORIA2.0\backend"
    call npm start
) else if "%choice%"=="3" (
    echo.
    echo Setting up database...
    cd /d "%~dp0EUPHORIA2.0\backend"
    call node setup-db.js
    echo.
    echo ✅ Database setup complete!
    pause
) else if "%choice%"=="4" (
    echo.
    echo Opening documentation...
    cd /d "%~dp0EUPHORIA2.0"
    start HACKATHON_SUBMISSION.md
) else if "%choice%"=="5" (
    exit /b 0
) else (
    echo Invalid choice. Please try again.
    pause
    goto start
)
