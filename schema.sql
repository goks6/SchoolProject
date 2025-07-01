const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection with detailed error logging
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        console.log('📊 Database:', process.env.DB_NAME || 'school_management');
        console.log('🏠 Host:', process.env.DB_HOST || 'localhost');
        connection.release();
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('🔍 Error Code:', err.code);
        
        // Specific error handling
        switch(err.code) {
            case 'ER_BAD_DB_ERROR':
                console.error('🔧 Solution: Create "school_management" database in phpMyAdmin');
                console.error('🌐 Go to: http://localhost/phpmyadmin/');
                break;
            case 'ECONNREFUSED':
                console.error('🔧 Solution: Start MySQL in XAMPP Control Panel');
                break;
            case 'ER_ACCESS_DENIED_ERROR':
                console.error('🔧 Solution: Check username/password in .env file');
                break;
            default:
                console.error('🔧 Check MySQL service and credentials');
        }
        return false;
    }
}

// Test connection on module load
testConnection();

module.exports = pool;