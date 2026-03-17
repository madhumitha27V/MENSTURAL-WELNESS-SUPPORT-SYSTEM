@echo off
REM EUPHORIA Mobile App - Quick Start Script
REM This script helps you get started with the React Native Expo app

echo.
echo =====================================
echo   EUPHORIA Mobile App - Quick Start
echo =====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [OK] npm found:
npm --version
echo.

REM Check if Expo CLI is installed globally
expo --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing Expo CLI globally...
    call npm install -g expo-cli
)

echo [OK] Expo CLI found
expo --version
echo.

REM Menu
:menu
cls
echo.
echo =====================================
echo   EUPHORIA Mobile App - Menu
echo =====================================
echo.
echo 1. Start Expo Server (npm start)
echo 2. Run on Android Emulator
echo 3. Run on iOS Simulator
echo 4. Run on Web
echo 5. Install Dependencies
echo 6. Clear Cache and Reinstall
echo 7. Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto start_expo
if "%choice%"=="2" goto android
if "%choice%"=="3" goto ios
if "%choice%"=="4" goto web
if "%choice%"=="5" goto install
if "%choice%"=="6" goto clean_install
if "%choice%"=="7" goto exit

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto menu

:start_expo
echo.
echo Starting Expo development server...
echo Scan the QR code with Expo Go app on your phone or press 'a' for Android or 'i' for iOS
echo.
npm start
pause
goto menu

:android
echo.
echo Starting on Android Emulator...
npm run android
pause
goto menu

:ios
echo.
echo Starting on iOS Simulator...
npm run ios
pause
goto menu

:web
echo.
echo Starting on Web...
npm run web
pause
goto menu

:install
echo.
echo Installing dependencies...
npm install --legacy-peer-deps
pause
goto menu

:clean_install
echo.
echo Clearing npm cache...
npm cache clean --force
echo Removing node_modules...
if exist node_modules rmdir /s /q node_modules
echo Removing package-lock.json...
if exist package-lock.json del package-lock.json
echo Installing fresh dependencies...
npm install --legacy-peer-deps
pause
goto menu

:exit
echo.
echo Exiting...
exit /b 0
