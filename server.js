/**
 * server.js – Enhanced School Management System API (fixed routing)
 * Version 2.0.1 – 30 Jun 2025
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

/* ----------------- MIDDLEWARE ----------------- */
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} – ${req.method} ${req.originalUrl}`);
  next();
});

/* ----------------- DATABASE ------------------- */
const db = require('./database-sqlite');
app.use((req, _res, next) => {
  req.db = db;
  next();
});

/* -------------- STATIC FRONTEND --------------- */
// All frontend assets live in /public/frontend
// 1) /frontend/...  – direct access
// 2) /principal/... – convenience alias for principal views
const frontendDir = path.join(__dirname, 'public', 'frontend');
app.use('/frontend', express.static(frontendDir));
app.use('/principal', express.static(frontendDir));

// Root → index.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

/* ---------------- HEALTH CHECK ---------------- */
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'Enhanced School Management System API is running',
    database: 'SQLite',
    timestamp: new Date().toISOString(),
    version: '2.0.1'
  });
});

/* ----------------- API ROUTES ----------------- */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/student'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/achievements', require('./routes/achievements'));

/* ------------ ERROR‑HANDLING MIDDLEWARE -------- */
app.use((err, req, res, _next) => {
  console.error('Error Details:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development'
      ? { stack: err.stack, details: err }
      : undefined
  });
});

/* -------------------- 404 ---------------------- */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    available_endpoints: [
      'GET /',
      'GET /frontend/index.html',
      'GET /frontend/dashboard.html',
      'GET /principal/dashboard.html',
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

/* ----------------- START SERVER --------------- */
app.listen(PORT, () => {
  console.log(`🚀 Enhanced School Management System API Server Started on http://localhost:${PORT}`);
});

/* ------------- GRACEFUL SHUTDOWN --------------- */
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  try {
    await db.close();
    console.log('💾 Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

/* ----------- UNHANDLED EXCEPTIONS -------------- */
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
