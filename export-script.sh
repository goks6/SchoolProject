#!/bin/bash

echo "🚀 शाळा हजेरी व्यवस्थापन प्रणाली Export करत आहे..."
echo "=================================================="

# Main export directory तयार करा
EXPORT_DIR="school-attendance-system-complete"
rm -rf $EXPORT_DIR
mkdir -p $EXPORT_DIR

echo "📁 Export directory तयार केली: $EXPORT_DIR"

# Frontend files copy करा
echo "📱 Frontend files copy करत आहे..."
mkdir -p $EXPORT_DIR/frontend
cp -r src $EXPORT_DIR/frontend/ 2>/dev/null || echo "⚠️  src folder not found"
cp -r public $EXPORT_DIR/frontend/ 2>/dev/null || echo "⚠️  public folder not found"
cp package.json $EXPORT_DIR/frontend/ 2>/dev/null || echo "⚠️  package.json not found"
cp index.html $EXPORT_DIR/frontend/ 2>/dev/null || echo "⚠️  index.html not found"
cp vite.config.ts $EXPORT_DIR/frontend/ 2>/dev/null || echo "⚠️  vite.config.ts not found"
cp tailwind.config.js $EXPORT_DIR/frontend/ 2>/dev/null || echo "⚠️  tailwind.config.js not found"
cp tsconfig*.json $EXPORT_DIR/frontend/ 2>/dev/null || echo "⚠️  tsconfig files not found"
cp postcss.config.js $EXPORT_DIR/frontend/ 2>/dev/null || echo "⚠️  postcss.config.js not found"
cp eslint.config.js $EXPORT_DIR/frontend/ 2>/dev/null || echo "⚠️  eslint.config.js not found"

# Backend files copy करा
echo "🔧 Backend files copy करत आहे..."
mkdir -p $EXPORT_DIR/backend
cp -r backend/* $EXPORT_DIR/backend/ 2>/dev/null || echo "⚠️  backend folder not found"

# Documentation तयार करा
echo "📚 Documentation तयार करत आहे..."
cat > $EXPORT_DIR/README.md << 'EOF'
# शाळा हजेरी व्यवस्थापन प्रणाली
## School Attendance Management System

### 🌟 Features:
- 📱 Modern React Frontend with Tailwind CSS
- 🔧 Node.js Backend with SQLite Database  
- 👥 Enhanced Student Management with Blood Group, Emergency Contact
- 📅 Advanced Attendance Tracking with Analytics
- 📢 Notice Management System
- 🏆 Achievement Tracking System
- 📊 Comprehensive Reports and Statistics
- 🎨 Colorful and Attractive UI Design
- 📱 Mobile Responsive Design

### 🚀 Quick Start:

#### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on: http://localhost:5173

#### Backend Setup:
```bash
cd backend
npm install
npm start
```
Backend will run on: http://localhost:3000

### 🔐 Demo Credentials:
- **Principal Login**: 9876543210 / 9876543210
- **Teacher Login**: 9876543211 / 9876543211

### 🛠️ Technology Stack:
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide React
- **Backend**: Node.js, Express.js, SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: SQLite with enhanced schema
- **UI Components**: Custom components with Tailwind CSS
- **Icons**: Lucide React

### 📁 Project Structure:
```
school-attendance-system/
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main React application
│   │   ├── main.tsx         # Application entry point
│   │   └── index.css        # Tailwind CSS imports
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── vite.config.ts       # Vite configuration
├── backend/
│   ├── server.js            # Express server
│   ├── config/
│   │   └── database-sqlite.js # Database configuration
│   ├── routes/              # API routes
│   │   ├── auth.js          # Authentication routes
│   │   ├── students.js      # Student management
│   │   ├── attendance.js    # Attendance tracking
│   │   ├── notices.js       # Notice management
│   │   └── achievements.js  # Achievement tracking
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   └── package.json         # Backend dependencies
└── README.md               # This file
```

### 🎯 Key Features Explained:

#### 👥 Student Management:
- Complete student profiles with enhanced fields
- Blood group and emergency contact information
- Bulk import functionality
- Advanced filtering and search
- Export capabilities

#### 📅 Attendance System:
- Daily attendance marking
- Multiple status options (Present, Absent, Late)
- Real-time statistics
- Monthly and yearly reports
- Class-wise attendance tracking

#### 📢 Notice Management:
- Create and manage school notices
- Different notice types (General, Urgent, Event, Holiday)
- Target specific audiences
- Read/unread tracking
- Priority levels

#### 🏆 Achievement Tracking:
- Record student achievements
- Multiple categories (Academic, Sports, Cultural, Behavior)
- Different levels (School, District, State, National)
- Achievement statistics and reports

#### 📊 Reports & Analytics:
- Comprehensive attendance reports
- Student performance analytics
- Class-wise statistics
- Monthly/yearly trends
- Export functionality

### 🎨 UI/UX Features:
- Modern and colorful design
- Responsive layout for all devices
- Intuitive navigation
- Interactive charts and graphs
- Smooth animations and transitions
- Marathi language support

### 🔧 Development:

#### Adding New Features:
1. Backend: Add routes in `backend/routes/`
2. Frontend: Add components in `src/`
3. Database: Modify schema in `database-sqlite.js`

#### Environment Variables:
Create `.env` file in backend directory:
```
PORT=3000
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 📱 Mobile Support:
- Fully responsive design
- Touch-friendly interface
- Mobile-optimized navigation
- Progressive Web App ready

### 🔒 Security Features:
- JWT-based authentication
- Password hashing with bcrypt
- SQL injection protection
- Input validation
- Role-based access control

### 🚀 Deployment:
- Frontend: Can be deployed on Vercel, Netlify
- Backend: Can be deployed on Heroku, Railway, DigitalOcean
- Database: SQLite file included

### 📞 Support:
For any issues or questions, please check the code comments or create an issue in the repository.

### 📄 License:
This project is open source and available under the MIT License.
EOF

# Package.json for the complete project
cat > $EXPORT_DIR/package.json << 'EOF'
{
  "name": "school-attendance-management-system",
  "version": "2.0.0",
  "description": "Complete School Attendance Management System with React Frontend and Node.js Backend",
  "main": "backend/server.js",
  "scripts": {
    "install-all": "cd frontend && npm install && cd ../backend && npm install",
    "dev": "concurrently \"cd backend && npm start\" \"cd frontend && npm run dev\"",
    "start": "cd backend && npm start",
    "build": "cd frontend && npm run build",
    "frontend": "cd frontend && npm run dev",
    "backend": "cd backend && npm start"
  },
  "keywords": [
    "school",
    "attendance",
    "management",
    "react",
    "nodejs",
    "sqlite",
    "education"
  ],
  "author": "School Management Team",
  "license": "MIT",
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
EOF

# Installation script तयार करा
cat > $EXPORT_DIR/install.sh << 'EOF'
#!/bin/bash
echo "🚀 शाळा हजेरी व्यवस्थापन प्रणाली Installing..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install frontend dependencies
echo "📱 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Frontend installation failed"
    exit 1
fi

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
cd ../backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Backend installation failed"
    exit 1
fi

cd ..

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "🚀 To start the application:"
echo "1. Start Backend:  cd backend && npm start"
echo "2. Start Frontend: cd frontend && npm run dev"
echo ""
echo "🔐 Demo Credentials:"
echo "Principal: 9876543210 / 9876543210"
echo "Teacher: 9876543211 / 9876543211"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3000"
EOF

chmod +x $EXPORT_DIR/install.sh

# Start script तयार करा
cat > $EXPORT_DIR/start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting School Attendance Management System..."

# Check if dependencies are installed
if [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    echo "❌ Dependencies not found. Running installation..."
    ./install.sh
fi

echo "🔧 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!

echo "📱 Starting frontend development server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Both servers are starting..."
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x $EXPORT_DIR/start.sh

# File count करा
FRONTEND_FILES=$(find $EXPORT_DIR/frontend -type f 2>/dev/null | wc -l)
BACKEND_FILES=$(find $EXPORT_DIR/backend -type f 2>/dev/null | wc -l)

echo ""
echo "✅ Export completed successfully!"
echo "=================================================="
echo "📁 Export location: $EXPORT_DIR"
echo "📱 Frontend files: $FRONTEND_FILES"
echo "🔧 Backend files: $BACKEND_FILES"
echo ""
echo "🚀 To use the exported project:"
echo "1. cd $EXPORT_DIR"
echo "2. ./install.sh    (Install dependencies)"
echo "3. ./start.sh      (Start both servers)"
echo ""
echo "📦 You can now ZIP this folder and share it!"
echo "=================================================="