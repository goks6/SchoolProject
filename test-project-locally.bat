@echo off
title School Attendance System - Local Testing
color 0F
echo.
echo     🏫 शाळा हजेरी व्यवस्थापन प्रणाली
echo     ================================
echo     Local Testing Guide
echo.

REM Navigate to project directory
echo 📁 Project directory मध्ये जात आहे...
cd /d "D:\school attendance\project"

if not exist "src" (
    if not exist "backend" (
        echo ❌ Project files सापडले नाहीत
        echo कृपया तपासा की तुम्ही योग्य folder मध्ये आहात
        pause
        exit /b 1
    )
)

echo ✅ Project files सापडले!
echo 📍 Current location: %CD%

echo.
echo 🔍 Project structure तपासत आहे...
echo ================================

REM Check frontend files
echo 📱 Frontend Files:
if exist "src\App.tsx" (
    echo ✅ React App (src\App.tsx)
) else (
    echo ❌ React App not found
)

if exist "package.json" (
    echo ✅ Frontend package.json
) else (
    echo ❌ Frontend package.json not found
)

if exist "vite.config.ts" (
    echo ✅ Vite configuration
) else (
    echo ❌ Vite config not found
)

echo.
echo 🔧 Backend Files:
if exist "backend\server.js" (
    echo ✅ Express Server (backend\server.js)
) else (
    echo ❌ Express Server not found
)

if exist "backend\package.json" (
    echo ✅ Backend package.json
) else (
    echo ❌ Backend package.json not found
)

if exist "backend\config\database-sqlite.js" (
    echo ✅ SQLite Database config
) else (
    echo ❌ Database config not found
)

echo.
echo 💾 Database & Routes:
if exist "backend\routes\auth.js" (
    echo ✅ Authentication routes
) else (
    echo ❌ Auth routes not found
)

if exist "backend\routes\students.js" (
    echo ✅ Student management routes
) else (
    echo ❌ Student routes not found
)

if exist "backend\routes\notices.js" (
    echo ✅ Notice management routes
) else (
    echo ❌ Notice routes not found
)

if exist "backend\routes\achievements.js" (
    echo ✅ Achievement tracking routes
) else (
    echo ❌ Achievement routes not found
)

echo.
echo 🚀 Ready to test? तुम्हाला काय करायचे आहे?
echo.
echo 1. 🔧 Backend test करा (API server)
echo 2. 📱 Frontend test करा (React app)  
echo 3. 🌐 दोन्ही एकत्र test करा (Full system)
echo 4. 📊 Project statistics पाहा
echo 5. ❌ Exit
echo.
set /p choice="तुमची निवड (1-5): "

if "%choice%"=="1" goto test_backend
if "%choice%"=="2" goto test_frontend
if "%choice%"=="3" goto test_both
if "%choice%"=="4" goto show_stats
if "%choice%"=="5" exit /b 0

echo ❌ अवैध निवड
pause
goto :eof

:test_backend
echo.
echo 🔧 Backend Testing...
echo ====================

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js installed नाही
    echo Download करा: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js installed: 
node --version

echo.
echo 📦 Backend dependencies तपासत आहे...
cd backend

if not exist "node_modules" (
    echo 📥 Dependencies install करत आहे...
    npm install
    if errorlevel 1 (
        echo ❌ Installation failed
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🚀 Backend server starting...
echo ============================
echo.
echo 🌐 Server URLs:
echo • API Server: http://localhost:3000
echo • Health Check: http://localhost:3000/health
echo.
echo 🔐 Test API endpoints:
echo • POST /api/auth/login - User login
echo • GET /api/students/list - Get students
echo • GET /api/notices/list - Get notices
echo.
echo 💡 Press Ctrl+C to stop server
echo.

npm start
pause
goto :eof

:test_frontend
echo.
echo 📱 Frontend Testing...
echo =====================

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js installed नाही
    echo Download करा: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js installed: 
node --version

echo.
echo 📦 Frontend dependencies तपासत आहे...
cd /d "D:\school attendance\project"

if not exist "node_modules" (
    echo 📥 Dependencies install करत आहे...
    npm install
    if errorlevel 1 (
        echo ❌ Installation failed
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🚀 Frontend development server starting...
echo =========================================
echo.
echo 🌐 Application URL: http://localhost:5173
echo.
echo 🔐 Demo Login Credentials:
echo • Principal: 9876543210 / 9876543210
echo • Teacher: 9876543211 / 9876543211
echo.
echo 💡 Press Ctrl+C to stop server
echo Browser will automatically open
echo.

npm run dev
pause
goto :eof

:test_both
echo.
echo 🌐 Full System Testing...
echo =========================

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js installed नाही
    echo Download करा: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js installed: 
node --version

echo.
echo 🔧 Step 1: Backend setup...
cd backend

if not exist "node_modules" (
    echo 📥 Backend dependencies install करत आहे...
    npm install
    if errorlevel 1 (
        echo ❌ Backend installation failed
        pause
        exit /b 1
    )
) else (
    echo ✅ Backend dependencies ready
)

echo.
echo 📱 Step 2: Frontend setup...
cd /d "D:\school attendance\project"

if not exist "node_modules" (
    echo 📥 Frontend dependencies install करत आहे...
    npm install
    if errorlevel 1 (
        echo ❌ Frontend installation failed
        pause
        exit /b 1
    )
) else (
    echo ✅ Frontend dependencies ready
)

echo.
echo 🚀 Starting both servers...
echo ===========================

echo 🔧 Starting backend server...
start "🔧 Backend API Server" cmd /k "color 0C && cd /d \"D:\school attendance\project\backend\" && echo Backend Server Starting on http://localhost:3000 && npm start"

echo ⏳ Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo 📱 Starting frontend server...
start "📱 Frontend React App" cmd /k "color 0E && cd /d \"D:\school attendance\project\" && echo Frontend Server Starting on http://localhost:5173 && npm run dev"

echo.
echo 🎉 Both servers are starting!
echo =============================
echo.
echo 🌐 Application URLs:
echo ┌─────────────────────────────────────────┐
echo │ 📱 Frontend: http://localhost:5173     │
echo │ 🔧 Backend:  http://localhost:3000     │
echo │ 🔍 Health:   http://localhost:3000/health │
echo └─────────────────────────────────────────┘
echo.
echo 🔐 Demo Login Credentials:
echo ┌─────────────┬──────────────┬──────────────┐
echo │ Role        │ Mobile       │ Password     │
echo ├─────────────┼──────────────┼──────────────┤
echo │ Principal   │ 9876543210   │ 9876543210   │
echo │ Teacher     │ 9876543211   │ 9876543211   │
echo └─────────────┴──────────────┴──────────────┘
echo.
echo 🎯 Testing Checklist:
echo ✓ Login with demo credentials
echo ✓ Add new student
echo ✓ Mark attendance
echo ✓ Create notice
echo ✓ Add achievement
echo ✓ View reports
echo.
echo ⏰ Waiting 10 seconds then opening browser...
timeout /t 10 /nobreak >nul

echo 🌐 Opening application...
start http://localhost:5173

echo.
echo ✅ Full system launched successfully!
echo.
echo 💡 Tips:
echo • Keep both server windows open
echo • Use Ctrl+C in server windows to stop
echo • Check console for any errors
echo.
echo Press any key to close this window...
echo (Servers will continue running)
pause >nul
goto :eof

:show_stats
echo.
echo 📊 Project Statistics:
echo ======================

echo 📁 File Count:
for /f %%i in ('dir /s /b 2^>nul ^| find /c /v ""') do echo Total files: %%i

echo.
echo 📱 Frontend Files:
for /f %%i in ('dir src /s /b 2^>nul ^| find /c /v ""') do echo React components: %%i

echo.
echo 🔧 Backend Files:
for /f %%i in ('dir backend /s /b 2^>nul ^| find /c /v ""') do echo Backend files: %%i

echo.
echo 📦 Dependencies:
if exist "package.json" (
    echo ✅ Frontend package.json exists
) else (
    echo ❌ Frontend package.json missing
)

if exist "backend\package.json" (
    echo ✅ Backend package.json exists
) else (
    echo ❌ Backend package.json missing
)

echo.
echo 💾 Database:
if exist "backend\config\database-sqlite.js" (
    echo ✅ SQLite database configuration
) else (
    echo ❌ Database config missing
)

echo.
echo 🔗 API Routes:
if exist "backend\routes" (
    for /f %%i in ('dir backend\routes\*.js /b 2^>nul ^| find /c /v ""') do echo API route files: %%i
) else (
    echo ❌ Routes folder missing
)

echo.
echo 🎨 UI Components:
if exist "src" (
    echo ✅ React source code available
) else (
    echo ❌ React source missing
)

echo.
pause
goto :eof