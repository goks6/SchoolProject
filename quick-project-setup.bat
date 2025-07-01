@echo off
title School Attendance System - Quick Setup
color 0F
echo.
echo     🏫 शाळा हजेरी व्यवस्थापन प्रणाली
echo     ================================
echo     Quick Setup for Project Folder
echo.
echo 📍 Project Location: D:\school attendance\project
echo.
echo तुम्हाला काय करायचे आहे?
echo.
echo 1. 🌐 GitHub वर upload करा
echo 2. 📦 Desktop वर ZIP तयार करा
echo 3. 🚀 दोन्ही करा (GitHub + ZIP)
echo 4. 📁 Project structure पाहा
echo 5. 🔧 Project test करा
echo 6. ❌ Exit
echo.
set /p choice="तुमची निवड (1-6): "

if "%choice%"=="1" goto github_only
if "%choice%"=="2" goto zip_only
if "%choice%"=="3" goto both
if "%choice%"=="4" goto show_structure
if "%choice%"=="5" goto test_project
if "%choice%"=="6" exit /b 0

echo ❌ अवैध निवड
pause
goto :eof

:github_only
echo.
echo 🌐 GitHub Upload करत आहे...
call setup-from-project-folder.bat
goto :eof

:zip_only
echo.
echo 📦 ZIP File तयार करत आहे...
call project-export-only.bat
goto :eof

:both
echo.
echo 🚀 GitHub + ZIP दोन्ही करत आहे...
call setup-from-project-folder.bat
echo.
echo आता ZIP तयार करत आहे...
call project-export-only.bat
goto :eof

:show_structure
echo.
echo 📁 Project Structure:
echo ====================
cd /d "D:\school attendance\project"
tree /F /A
echo.
pause
goto :eof

:test_project
echo.
echo 🔧 Project Testing...
echo ====================
cd /d "D:\school attendance\project"

echo 📱 Frontend files तपासत आहे...
if exist "src\App.tsx" (
    echo ✅ React App found
) else (
    echo ❌ React App not found
)

if exist "package.json" (
    echo ✅ Package.json found
) else (
    echo ❌ Package.json not found
)

echo.
echo 🔧 Backend files तपासत आहे...
if exist "backend\server.js" (
    echo ✅ Server.js found
) else (
    echo ❌ Server.js not found
)

if exist "backend\package.json" (
    echo ✅ Backend package.json found
) else (
    echo ❌ Backend package.json not found
)

echo.
echo 💾 Database files तपासत आहे...
if exist "backend\config\database-sqlite.js" (
    echo ✅ Database config found
) else (
    echo ❌ Database config not found
)

echo.
echo 📊 File count:
for /f %%i in ('dir /s /b 2^>nul ^| find /c /v ""') do echo Total files: %%i

echo.
pause
goto :eof