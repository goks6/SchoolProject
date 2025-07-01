@echo off
echo 📦 Project Export करत आहे (Desktop वर)
echo ========================================

REM Navigate to project folder
cd /d "D:\school attendance\project"

REM Check if we're in the right place
if not exist "src" (
    if not exist "backend" (
        echo ❌ Project files सापडले नाहीत
        echo Location: %CD%
        pause
        exit /b 1
    )
)

echo ✅ Project files found at: %CD%

REM Create export on Desktop
set DESKTOP=%USERPROFILE%\Desktop
set EXPORT_DIR=%DESKTOP%\school-attendance-system-ready
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%
set TIMESTAMP=%TIMESTAMP: =0%

if exist "%EXPORT_DIR%" rmdir /s /q "%EXPORT_DIR%"
mkdir "%EXPORT_DIR%"

echo 📁 Export करत आहे: %EXPORT_DIR%

REM Copy frontend files
echo 📱 Frontend files...
mkdir "%EXPORT_DIR%\frontend"
if exist "src" xcopy "src" "%EXPORT_DIR%\frontend\src\" /E /I /Q >nul
if exist "public" xcopy "public" "%EXPORT_DIR%\frontend\public\" /E /I /Q >nul

REM Copy config files
for %%f in (package.json index.html vite.config.ts tailwind.config.js tsconfig.json tsconfig.app.json tsconfig.node.json postcss.config.js eslint.config.js) do (
    if exist "%%f" copy "%%f" "%EXPORT_DIR%\frontend\" >nul
)

REM Copy backend
echo 🔧 Backend files...
if exist "backend" xcopy "backend" "%EXPORT_DIR%\backend\" /E /I /Q >nul

REM Create comprehensive README
echo 📚 README तयार करत आहे...
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
echo - Automated SMS notifications to parents
echo.
echo #### 📢 Notice Management
echo - Create and manage school notices
echo - Different notice types (General, Urgent, Event, Holiday)
echo - Target specific audiences (All, Teachers, Parents, Students)
echo - Priority levels and expiry dates
echo - Read/unread tracking system
echo.
echo #### 🏆 Achievement Tracking
echo - Record student achievements and awards
echo - Multiple categories (Academic, Sports, Cultural, Behavior)
echo - Different levels (School, District, State, National)
echo - Achievement certificates and documentation
echo - Performance analytics and reports
echo.
echo #### 📊 Reports & Analytics
echo - Comprehensive attendance reports
echo - Student performance analytics
echo - Class-wise and school-wide statistics
echo - Monthly/yearly trend analysis
echo - Export functionality for all reports
echo.
echo #### 🎨 Modern UI/UX
echo - Colorful and attractive design
echo - Fully responsive for all devices
echo - Smooth animations and transitions
echo - Intuitive navigation
echo - Marathi language support
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
echo | Role | Mobile | Password |
echo |------|--------|----------|
echo | **Principal** | 9876543210 | 9876543210 |
echo | **Teacher** | 9876543211 | 9876543211 |
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
echo ### 🎯 Main Features Explained:
echo.
echo #### Student Management:
echo - Add students with complete profiles
echo - Track blood group and emergency contacts
echo - Bulk import from Excel/CSV
echo - Advanced search and filtering
echo - Generate student ID cards
echo.
echo #### Attendance Tracking:
echo - Mark daily attendance (Present/Absent/Late)
echo - View real-time statistics
echo - Generate monthly/yearly reports
echo - Send SMS notifications to parents
echo - Track attendance trends
echo.
echo #### Notice System:
echo - Create different types of notices
echo - Set priority levels and expiry dates
echo - Target specific audiences
echo - Track who has read notices
echo - Attach files and images
echo.
echo #### Achievement System:
echo - Record student achievements
echo - Categorize by type and level
echo - Upload certificates
echo - Generate achievement reports
echo - Track top performers
echo.
echo ### 🔧 Development Guide:
echo.
echo #### Adding New Features:
echo 1. **Backend**: Add new routes in `backend/routes/`
echo 2. **Frontend**: Add new components in `frontend/src/`
echo 3. **Database**: Modify schema in `database-sqlite.js`
echo.
echo #### Environment Configuration:
echo Create `.env` file in backend directory:
echo ```
echo PORT=3000
echo JWT_SECRET=your_secret_key
echo NODE_ENV=development
echo ```
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
echo ### 🚀 Deployment Options:
echo.
echo #### Frontend:
echo - **Vercel**: Connect GitHub repo for auto-deployment
echo - **Netlify**: Drag and drop build folder
echo - **GitHub Pages**: Static hosting
echo.
echo #### Backend:
echo - **Railway**: Easy Node.js deployment
echo - **Heroku**: Cloud platform
echo - **DigitalOcean**: VPS hosting
echo.
echo ### 📊 Sample Data:
echo The system comes with pre-loaded sample data:
echo - 1 Demo School
echo - 1 Principal account
echo - 1 Teacher account  
echo - 6 Sample students
echo - Sample notices and achievements
echo.
echo ### 🆘 Troubleshooting:
echo.
echo #### Common Issues:
echo 1. **Port already in use**: Change port in backend/server.js
echo 2. **Dependencies not installing**: Delete node_modules and reinstall
echo 3. **Database errors**: Delete school.db file to reset
echo 4. **Login issues**: Use demo credentials provided above
echo.
echo #### Getting Help:
echo - Check browser console for errors
echo - Check terminal/command prompt for server logs
echo - Ensure both frontend and backend are running
echo - Verify Node.js is installed (node --version)
echo.
echo ### 📄 License:
echo This project is open source and available under the MIT License.
echo.
echo ### 👨‍💻 Development Team:
echo Created with ❤️ for educational institutions to modernize their attendance management.
echo.
echo ---
echo **Happy Learning! 🎓**
) > "%EXPORT_DIR%\README.md"

REM Create enhanced install script
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
echo node --version >nul 2^>^&1
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
echo echo 💡 Tips:
echo echo • Keep both terminal windows open while using the app
echo echo • Use Ctrl+C to stop servers when done
echo echo • Check README.md for detailed documentation
echo echo.
echo echo Press any key to continue...
echo pause >nul
) > "%EXPORT_DIR%\install.bat"

REM Create enhanced start script
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
echo start "🔧 Backend Server - School Attendance API" cmd /k "color 0C && cd backend && echo Backend Server Starting... && npm start"
echo.
echo echo ⏳ Waiting for backend to initialize...
echo timeout /t 5 /nobreak >nul
echo.
echo echo 📱 Starting Frontend Server...
echo echo ==============================
echo start "📱 Frontend Server - React App" cmd /k "color 0E && cd frontend && echo Frontend Server Starting... && npm run dev"
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
echo echo 📋 Server Status:
echo echo • Backend: Starting on port 3000
echo echo • Frontend: Starting on port 5173
echo echo • Database: SQLite (school.db)
echo echo.
echo echo 💡 Usage Tips:
echo echo • Wait 10-15 seconds for both servers to fully start
echo echo • Frontend will automatically open in your browser
echo echo • Keep both server windows open while using the app
echo echo • Use Ctrl+C in server windows to stop when done
echo echo.
echo echo 🆘 Troubleshooting:
echo echo • If ports are busy, close other applications
echo echo • Check firewall settings if connection fails
echo echo • Restart this script if servers don't start
echo echo.
echo echo ⏰ Waiting 10 seconds then opening browser...
echo timeout /t 10 /nobreak >nul
echo.
echo echo 🌐 Opening application in browser...
echo start http://localhost:5173
echo.
echo echo ✅ Application launched successfully!
echo echo.
echo echo Press any key to close this window...
echo echo (Servers will continue running in separate windows)
echo pause >nul
) > "%EXPORT_DIR%\start.bat"

REM Create project info file
(
echo 📊 Project Export Information
echo ============================
echo.
echo Export Date: %date% %time%
echo Source: D:\school attendance\project
echo Destination: %EXPORT_DIR%
echo.
echo 📁 Contents:
echo ✅ Frontend (React + TypeScript + Tailwind)
echo ✅ Backend (Node.js + Express + SQLite)
echo ✅ Installation Scripts
echo ✅ Documentation
echo ✅ Sample Data
echo.
echo 🚀 To Use:
echo 1. Run install.bat
echo 2. Run start.bat
echo 3. Open http://localhost:5173
echo.
echo 🔐 Demo Login:
echo Principal: 9876543210 / 9876543210
echo Teacher: 9876543211 / 9876543211
) > "%EXPORT_DIR%\PROJECT_INFO.txt"

echo.
echo ✅ Export completed successfully!
echo ================================================
echo 📍 Location: %EXPORT_DIR%
echo.
echo 📦 Ready to ZIP and share:
echo 1. Right-click on the folder
echo 2. Send to → Compressed (zipped) folder
echo 3. Share the ZIP file
echo.
echo 🚀 Recipient instructions:
echo 1. Extract ZIP file
echo 2. Double-click install.bat
echo 3. Double-click start.bat
echo 4. Open http://localhost:5173
echo.
explorer "%EXPORT_DIR%"
pause