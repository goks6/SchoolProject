@echo off
echo 🎯 School Attendance System - Quick Setup
echo ==========================================
echo.
echo तुम्हाला काय करायचे आहे?
echo.
echo 1. GitHub वर upload करा
echo 2. ZIP file तयार करा  
echo 3. दोन्ही करा
echo 4. Exit
echo.
set /p choice="तुमची निवड (1-4): "

if "%choice%"=="1" (
    echo.
    echo 🌐 GitHub upload करत आहे...
    call fix-git-setup.bat
) else if "%choice%"=="2" (
    echo.
    echo 📦 ZIP file तयार करत आहे...
    call create-project-zip.bat
) else if "%choice%"=="3" (
    echo.
    echo 🌐 पहिले GitHub upload...
    call fix-git-setup.bat
    echo.
    echo 📦 आता ZIP file तयार करत आहे...
    call create-project-zip.bat
) else if "%choice%"=="4" (
    echo 👋 Goodbye!
    exit /b 0
) else (
    echo ❌ अवैध निवड
    pause
    goto :eof
)

echo.
echo 🎉 Process completed!
pause