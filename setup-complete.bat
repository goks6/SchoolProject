@echo off
title School Attendance System - Complete Setup
color 0F
echo.
echo     🏫 शाळा हजेरी व्यवस्थापन प्रणाली
echo     ================================
echo     Complete Setup Solution
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
echo तुम्हाला काय करायचे आहे?
echo.
echo 1. 🌐 GitHub वर upload करा
echo 2. 📦 ZIP file तयार करा (Desktop वर)
echo 3. 🚀 दोन्ही करा
echo 4. 📁 Project structure पाहा
echo 5. ❌ Exit
echo.
set /p choice="तुमची निवड (1-5): "

if "%choice%"=="1" goto github_upload
if "%choice%"=="2" goto create_zip
if "%choice%"=="3" goto do_both
if "%choice%"=="4" goto show_structure
if "%choice%"=="5" exit /b 0

echo ❌ अवैध निवड
pause
exit /b 1

:show_structure
echo.
echo 📁 Project Structure:
echo =====================
tree /F /A
echo.
pause
goto :eof

:github_upload
echo.
echo 🌐 GitHub Upload Process...
echo ===========================

REM Check git installation
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git installed नाही
    echo Download करा: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ Git installed आहे

REM Remove existing git
if exist ".git" (
    echo 🗑️ Existing git repository काढत आहे...
    rmdir /s /q .git
)

REM Initialize git
echo 🔧 Git repository initialize करत आहे...
git init

REM Configure git user if needed
git config user.name >nul 2>&1
if errorlevel 1 (
    set /p username="तुमचे नाव: "
    set /p email="तुमचा email: "
    git config user.name "%username%"
    git config user.email "%email%"
)

REM Add files
echo 📦 Files add करत आहे...
git add .

REM Commit
echo 💾 Commit करत आहे...
git commit -m "Initial commit: School Attendance Management System"

if errorlevel 1 (
    echo ❌ Commit failed
    pause
    exit /b 1
)

REM Set main branch
git branch -M main

echo.
echo 🌐 GitHub Repository तयार करा:
echo 1. https://github.com वर जा
echo 2. "New repository" क्लिक करा
echo 3. Name: school-attendance-system
echo 4. "Create repository" क्लिक करा
echo.

set /p github_username="GitHub Username: "

if "%github_username%"=="" (
    echo ❌ Username आवश्यक आहे
    pause
    exit /b 1
)

REM Add remote and push
echo 🔗 GitHub repository जोडत आहे...
git remote add origin https://github.com/%github_username%/school-attendance-system.git

echo 🚀 GitHub वर upload करत आहे...
echo तुमचा GitHub password/token विचारला जाईल...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ GitHub upload failed
    echo.
    echo 🔧 Possible solutions:
    echo 1. GitHub repository अस्तित्वात आहे का तपासा
    echo 2. Username योग्य आहे का तपासा
    echo 3. Personal Access Token वापरा password ऐवजी
    echo.
    echo 🔑 Personal Access Token तयार करण्यासाठी:
    echo 1. GitHub.com → Settings → Developer settings
    echo 2. Personal access tokens → Generate new token
    echo 3. Select 'repo' permissions
    echo 4. Copy token आणि password म्हणून वापरा
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ GitHub upload successful!
echo 🌐 Repository URL: https://github.com/%github_username%/school-attendance-system
echo.
pause
goto :eof

:create_zip
echo.
echo 📦 ZIP File तयार करत आहे...
echo ==============================

REM Create export directory on Desktop
set DESKTOP=%USERPROFILE%\Desktop
set EXPORT_DIR=%DESKTOP%\school-attendance-system-complete
if exist "%EXPORT_DIR%" rmdir /s /q "%EXPORT_DIR%"
mkdir "%EXPORT_DIR%"

echo 📁 Export directory: %EXPORT_DIR%

REM Copy all project files
echo 📱 Frontend files copy करत आहे...
mkdir "%EXPORT_DIR%\frontend"

if exist "src" (
    xcopy "src" "%EXPORT_DIR%\frontend\src\" /E /I /Q >nul
    echo ✅ src folder copied
) else (
    echo ⚠️ src folder not found
)

if exist "public" (
    xcopy "public" "%EXPORT_DIR%\frontend\public\" /E /I /Q >nul
    echo ✅ public folder copied
) else (
    echo ⚠️ public folder not found
)

REM Copy individual frontend files
if exist "package.json" copy "package.json" "%EXPORT_DIR%\frontend\" >nul
if exist "index.html" copy "index.html" "%EXPORT_DIR%\frontend\" >nul
if exist "vite.config.ts" copy "vite.config.ts" "%EXPORT_DIR%\frontend\" >nul
if exist "tailwind.config.js" copy "tailwind.config.js" "%EXPORT_DIR%\frontend\" >nul
if exist "tsconfig.json" copy "tsconfig.json" "%EXPORT_DIR%\frontend\" >nul
if exist "tsconfig.app.json" copy "tsconfig.app.json" "%EXPORT_DIR%\frontend\" >nul
if exist "tsconfig.node.json" copy "tsconfig.node.json" "%EXPORT_DIR%\frontend\" >nul
if exist "postcss.config.js" copy "postcss.config.js" "%EXPORT_DIR%\frontend\" >nul
if exist "eslint.config.js" copy "eslint.config.js" "%EXPORT_DIR%\frontend\" >nul

echo 🔧 Backend files copy करत आहे...
if exist "backend" (
    xcopy "backend" "%EXPORT_DIR%\backend\" /E /I /Q >nul
    echo ✅ backend folder copied
) else (
    echo ⚠️ backend folder not found
)

REM Create comprehensive README
echo 📚 README file तयार करत आहे...
(
echo # 🏫 शाळा हजेरी व्यवस्थापन प्रणाली
echo ## School Attendance Management System
echo.
echo **Complete School Management Solution with Modern UI**
echo.
echo ### 🌟 Key Features:
echo.
echo #### 👥 Student Management
echo - Complete student profiles with enhanced fields
echo - Blood group and emergency contact tracking
echo - Bulk import/export functionality
echo - Advanced search and filtering
echo - Class and section management
echo.
echo #### 📅 Attendance System
echo - Daily attendance marking with multiple status options
echo - Real-time attendance statistics and analytics
echo - Monthly and yearly attendance reports
echo - Class-wise attendance tracking
echo.
echo #### 📢 Notice Management
echo - Create and manage school notices
echo - Different notice types (General, Urgent, Event, Holiday)
echo - Target specific audiences
echo - Priority levels and expiry dates
echo.
echo #### 🏆 Achievement Tracking
echo - Record student achievements and awards
echo - Multiple categories (Academic, Sports, Cultural, Behavior)
echo - Different levels (School, District, State, National)
echo - Performance analytics and reports
echo.
echo ### 🚀 Quick Installation:
echo.
echo #### Option 1: Automated (Recommended)
echo ```bash
echo # Double-click these files in order:
echo 1. install.bat     # Installs all dependencies
echo 2. start.bat       # Starts both servers
echo ```
echo.
echo #### Option 2: Manual Installation
echo ```bash
echo # Install Node.js first: https://nodejs.org/
echo.
echo # Backend Setup
echo cd backend
echo npm install
echo npm start
echo.
echo # Frontend Setup (new terminal)
echo cd frontend
echo npm install
echo npm run dev
echo ```
echo.
echo ### 🔐 Demo Login Credentials:
echo.
echo ^| Role ^| Mobile ^| Password ^|
echo ^|------^|--------^|----------^|
echo ^| **Principal** ^| 9876543210 ^| 9876543210 ^|
echo ^| **Teacher** ^| 9876543211 ^| 9876543211 ^|
echo.
echo ### 🌐 Application URLs:
echo.
echo - **Frontend (React App)**: http://localhost:5173
echo - **Backend (API Server)**: http://localhost:3000
echo - **Health Check**: http://localhost:3000/health
echo.
echo ### 🛠️ Technology Stack:
echo.
echo #### Frontend:
echo - **React 18** - Modern UI library
echo - **TypeScript** - Type-safe JavaScript
echo - **Tailwind CSS** - Utility-first CSS framework
echo - **Vite** - Fast build tool
echo - **Lucide React** - Beautiful icons
echo.
echo #### Backend:
echo - **Node.js** - JavaScript runtime
echo - **Express.js** - Web framework
echo - **SQLite3** - Lightweight database
echo - **JWT** - Authentication tokens
echo - **bcryptjs** - Password hashing
echo.
echo ### 📁 Project Structure:
echo ```
echo school-attendance-system/
echo ├── frontend/                 # React Application
echo │   ├── src/
echo │   │   ├── App.tsx          # Main application component
echo │   │   ├── main.tsx         # Application entry point
echo │   │   └── index.css        # Global styles
echo │   ├── public/              # Static assets
echo │   ├── package.json         # Frontend dependencies
echo │   └── vite.config.ts       # Build configuration
echo │
echo ├── backend/                  # Node.js API Server
echo │   ├── server.js            # Express server
echo │   ├── config/
echo │   │   └── database-sqlite.js # Database setup
echo │   ├── routes/              # API endpoints
echo │   │   ├── auth.js          # Authentication
echo │   │   ├── students.js      # Student management
echo │   │   ├── attendance.js    # Attendance tracking
echo │   │   ├── notices.js       # Notice management
echo │   │   └── achievements.js  # Achievement tracking
echo │   ├── middleware/
echo │   │   └── auth.js          # JWT middleware
echo │   └── package.json         # Backend dependencies
echo │
echo ├── install.bat              # Automated installation
echo ├── start.bat                # Start both servers
echo └── README.md               # This documentation
echo ```
echo.
echo ### 🔧 Development Guide:
echo.
echo #### Adding New Features:
echo 1. **Backend**: Add new routes in `backend/routes/`
echo 2. **Frontend**: Add new components in `frontend/src/`
echo 3. **Database**: Modify schema in `database-sqlite.js`
echo.
echo ### 📱 Mobile Support:
echo - Fully responsive design
echo - Touch-friendly interface
echo - Mobile-optimized navigation
echo - Works on all screen sizes
echo.
echo ### 🔒 Security Features:
echo - JWT-based authentication
echo - Password hashing with bcrypt
echo - SQL injection protection
echo - Input validation and sanitization
echo - Role-based access control
echo.
echo ### 🆘 Troubleshooting:
echo.
echo #### Common Issues:
echo 1. **Port already in use**: Change port in backend/server.js
echo 2. **Dependencies not installing**: Delete node_modules and reinstall
echo 3. **Database errors**: Delete school.db file to reset
echo 4. **Login issues**: Use demo credentials provided above
echo.
echo ### 📄 License:
echo This project is open source and available under the MIT License.
echo.
echo ---
echo **Happy Learning! 🎓**
) > "%EXPORT_DIR%\README.md"

REM Create install script
echo 🔧 Install script तयार करत आहे...
(
echo @echo off
echo title School Attendance System - Installation
echo color 0A
echo echo.
echo echo     🏫 शाळा हजेरी व्यवस्थापन प्रणाली
echo echo     ================================
echo echo     School Attendance Management System
echo echo.
echo echo 🚀 Starting installation process...
echo echo.
echo.
echo REM Check Node.js installation
echo node --version ^>nul 2^>^&1
echo if errorlevel 1 ^(
echo     echo ❌ Node.js is not installed
echo     echo.
echo     echo 📥 Please download and install Node.js:
echo     echo 🌐 https://nodejs.org/
echo     echo.
echo     echo After installing Node.js, run this script again.
echo     pause
echo     exit /b 1
echo ^)
echo.
echo echo ✅ Node.js is installed
echo for /f "tokens=*" %%i in ^('node --version'^) do echo 📦 Version: %%i
echo echo.
echo.
echo echo 📱 Installing Frontend Dependencies...
echo echo =====================================
echo cd frontend
echo echo Installing React, TypeScript, Tailwind CSS...
echo npm install
echo if errorlevel 1 ^(
echo     echo.
echo     echo ❌ Frontend installation failed
echo     echo.
echo     echo 🔧 Troubleshooting:
echo     echo 1. Check internet connection
echo     echo 2. Try running as administrator
echo     echo 3. Delete node_modules folder and try again
echo     echo.
echo     pause
echo     exit /b 1
echo ^)
echo echo ✅ Frontend dependencies installed successfully
echo echo.
echo.
echo echo 🔧 Installing Backend Dependencies...
echo echo ====================================
echo cd ..\backend
echo echo Installing Express, SQLite, JWT...
echo npm install
echo if errorlevel 1 ^(
echo     echo.
echo     echo ❌ Backend installation failed
echo     echo.
echo     echo 🔧 Troubleshooting:
echo     echo 1. Check internet connection
echo     echo 2. Try running as administrator
echo     echo 3. Delete node_modules folder and try again
echo     echo.
echo     pause
echo     exit /b 1
echo ^)
echo echo ✅ Backend dependencies installed successfully
echo echo.
echo cd ..
echo.
echo echo 🎉 Installation Completed Successfully!
echo echo =====================================
echo echo.
echo echo 📋 What's been installed:
echo echo ✅ Frontend: React 18 + TypeScript + Tailwind CSS
echo echo ✅ Backend: Node.js + Express + SQLite
echo echo ✅ Database: Pre-configured with sample data
echo echo ✅ Authentication: JWT-based security
echo echo.
echo echo 🚀 Next Steps:
echo echo 1. Run 'start.bat' to launch the application
echo echo 2. Or manually start servers:
echo echo    • Backend: cd backend ^&^& npm start
echo echo    • Frontend: cd frontend ^&^& npm run dev
echo echo.
echo echo 🔐 Demo Login Credentials:
echo echo ┌─────────────┬──────────────┬──────────────┐
echo echo │ Role        │ Mobile       │ Password     │
echo echo ├─────────────┼──────────────┼──────────────┤
echo echo │ Principal   │ 9876543210   │ 9876543210   │
echo echo │ Teacher     │ 9876543211   │ 9876543211   │
echo echo └─────────────┴──────────────┴──────────────┘
echo echo.
echo echo 🌐 Application URLs:
echo echo 📱 Frontend: http://localhost:5173
echo echo 🔧 Backend:  http://localhost:3000
echo echo.
echo echo Press any key to continue...
echo pause ^>nul
) > "%EXPORT_DIR%\install.bat"

REM Create start script
echo 🚀 Start script तयार करत आहे...
(
echo @echo off
echo title School Attendance System - Server Manager
echo color 0B
echo echo.
echo echo     🏫 शाळा हजेरी व्यवस्थापन प्रणाली
echo echo     ================================
echo echo     School Attendance Management System
echo echo.
echo.
echo REM Check if dependencies are installed
echo if not exist "frontend\node_modules" ^(
echo     echo ❌ Frontend dependencies not found
echo     echo 📥 Please run 'install.bat' first
echo     echo.
echo     pause
echo     exit /b 1
echo ^)
echo.
echo if not exist "backend\node_modules" ^(
echo     echo ❌ Backend dependencies not found
echo     echo 📥 Please run 'install.bat' first
echo     echo.
echo     pause
echo     exit /b 1
echo ^)
echo.
echo echo ✅ Dependencies found
echo echo.
echo echo 🔧 Starting Backend Server...
echo echo ============================
echo start "🔧 Backend Server - School Attendance API" cmd /k "color 0C ^&^& cd backend ^&^& echo Backend Server Starting... ^&^& npm start"
echo.
echo echo ⏳ Waiting for backend to initialize...
echo timeout /t 5 /nobreak ^>nul
echo.
echo echo 📱 Starting Frontend Server...
echo echo ==============================
echo start "📱 Frontend Server - React App" cmd /k "color 0E ^&^& cd frontend ^&^& echo Frontend Server Starting... ^&^& npm run dev"
echo.
echo echo.
echo echo 🎉 Both Servers Are Starting!
echo echo =============================
echo echo.
echo echo 🌐 Application URLs:
echo echo ┌─────────────────────────────────────────┐
echo echo │ 📱 Frontend: http://localhost:5173     │
echo echo │ 🔧 Backend:  http://localhost:3000     │
echo echo │ 🔍 Health:   http://localhost:3000/health │
echo echo └─────────────────────────────────────────┘
echo echo.
echo echo 🔐 Demo Login Credentials:
echo echo ┌─────────────┬──────────────┬──────────────┐
echo echo │ Role        │ Mobile       │ Password     │
echo echo ├─────────────┼──────────────┼──────────────┤
echo echo │ Principal   │ 9876543210   │ 9876543210   │
echo echo │ Teacher     │ 9876543211   │ 9876543211   │
echo echo └─────────────┴──────────────┴──────────────┘
echo echo.
echo echo ⏰ Waiting 10 seconds then opening browser...
echo timeout /t 10 /nobreak ^>nul
echo.
echo echo 🌐 Opening application in browser...
echo start http://localhost:5173
echo.
echo echo ✅ Application launched successfully!
echo echo.
echo echo Press any key to close this window...
echo echo (Servers will continue running in separate windows)
echo pause ^>nul
) > "%EXPORT_DIR%\start.bat"

echo.
echo ✅ ZIP folder तयार झाली!
echo 📍 Location: %EXPORT_DIR%
echo.
echo 📦 आता ZIP करा:
echo 1. %EXPORT_DIR% folder वर right-click करा
echo 2. "Send to" → "Compressed (zipped) folder" निवडा
echo 3. ZIP file share करा
echo.
explorer "%DESKTOP%"
pause
goto :eof

:do_both
echo.
echo 🚀 GitHub आणि ZIP दोन्ही करत आहे...
echo ===================================
call :github_upload
echo.
echo आता ZIP file तयार करत आहे...
call :create_zip
goto :eof