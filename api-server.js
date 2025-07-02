const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// SQLite Database Connection
const db = require('./database-sqlite');

// Add database to request object
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Enhanced School Management System API is running',
        database: 'SQLite',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// API Routes
const authRoutes = require('./routes/auth');
const schoolRoutes = require('./routes/school');
const studentRoutes = require('./routes/student'); // Updated route file
const attendanceRoutes = require('./routes/attendance');
const noticesRoutes = require('./routes/notices');
const achievementsRoutes = require('./routes/achievements');

// Use routes with enhanced error handling
app.use('/api/auth', authRoutes);
app.use('/api/students', require('./routes/student')); // Updated endpoint
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/achievements', achievementsRoutes);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('Error Details:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    
    res.status(err.status || 500).json({ 
        success: false, 
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? {
            stack: err.stack,
            details: err
        } : undefined
    });
});

// Enhanced 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
        available_endpoints: [
            'GET /health',
            'POST /api/auth/login',
            'POST /api/auth/register-school',
            'GET /api/students/list',
            'GET /api/attendance/today',
            'GET /api/notices/list',
            'GET /api/achievements/list'
        ]
    });
});

// Start server with enhanced logging
app.listen(PORT, () => {
    console.log('🚀 Enhanced School Management System API Server Started!');
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
    console.log(`💾 Database: SQLite (school.db)`);
    console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
    console.log('🎨 Features: Enhanced UI, Colorful Design, Advanced Analytics');
    console.log('✅ Ready to handle requests!');
});

// Enhanced graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server gracefully...');
    try {
        await db.close();
        console.log('💾 Database connection closed');
        console.log('👋 Server shutdown complete');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

module.exports = app;