@echo off
echo 🚀 Quick Test - School Attendance System
echo ========================================

cd /d "D:\school attendance\project"

echo 📍 Location: %CD%
echo.

REM Quick checks
if exist "src\App.tsx" (
    echo ✅ React App found
) else (
    echo ❌ React App missing
    goto :error
)

if exist "backend\server.js" (
    echo ✅ Backend server found
) else (
    echo ❌ Backend server missing
    goto :error
)

echo.
echo 🔧 Starting quick test...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not installed
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js ready

echo.
echo Choose test type:
echo 1. Backend only (API test)
echo 2. Frontend only (UI test)  
echo 3. Full system test
echo.
set /p choice="Choice (1-3): "

if "%choice%"=="1" (
    echo 🔧 Testing backend...
    cd backend
    if not exist "node_modules" npm install
    start "Backend Test" cmd /k "npm start"
    echo Backend started on http://localhost:3000
)

if "%choice%"=="2" (
    echo 📱 Testing frontend...
    if not exist "node_modules" npm install
    start "Frontend Test" cmd /k "npm run dev"
    echo Frontend started on http://localhost:5173
)

if "%choice%"=="3" (
    echo 🌐 Testing full system...
    
    REM Backend
    cd backend
    if not exist "node_modules" npm install
    start "Backend" cmd /k "npm start"
    
    REM Frontend  
    cd ..
    if not exist "node_modules" npm install
    start "Frontend" cmd /k "npm run dev"
    
    timeout /t 8 /nobreak >nul
    start http://localhost:5173
    
    echo.
    echo ✅ Full system started!
    echo 📱 Frontend: http://localhost:5173
    echo 🔧 Backend: http://localhost:3000
    echo.
    echo 🔐 Demo Login:
    echo Principal: 9876543210 / 9876543210
    echo Teacher: 9876543211 / 9876543211
)

echo.
echo Test started successfully!
pause
exit /b 0

:error
echo.
echo ❌ Project files incomplete
echo Please check project structure
pause
exit /b 1