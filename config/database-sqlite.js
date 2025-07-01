const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, '../school.db'));
        this.init();
    }

    init() {
        this.db.serialize(() => {
            // Schools table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS schools (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    udise_number TEXT,
                    address TEXT,
                    pin_code TEXT,
                    phone TEXT,
                    principal_name TEXT,
                    principal_mobile TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Users table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    school_id INTEGER,
                    name TEXT NOT NULL,
                    mobile TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    role TEXT CHECK(role IN ('principal', 'teacher')),
                    class TEXT,
                    section TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (school_id) REFERENCES schools(id)
                )
            `);

            // Students table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    school_id INTEGER,
                    roll_number INTEGER,
                    name TEXT NOT NULL,
                    mother_name TEXT,
                    date_of_birth DATE,
                    address TEXT,
                    parent_mobile TEXT,
                    aadhar_number TEXT,
                    student_id TEXT,
                    class TEXT,
                    section TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (school_id) REFERENCES schools(id)
                )
            `);

            // Attendance table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS attendance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER,
                    school_id INTEGER,
                    teacher_id INTEGER,
                    date DATE NOT NULL,
                    status TEXT CHECK(status IN ('present', 'absent', 'leave')),
                    remarks TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students(id),
                    FOREIGN KEY (school_id) REFERENCES schools(id),
                    FOREIGN KEY (teacher_id) REFERENCES users(id)
                )
            `);

            // Holidays table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS holidays (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    school_id INTEGER,
                    date DATE NOT NULL,
                    end_date DATE,
                    reason TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (school_id) REFERENCES schools(id)
                )
            `);

            // Messages table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    school_id INTEGER,
                    teacher_id INTEGER,
                    type TEXT CHECK(type IN ('study', 'notice')),
                    content TEXT NOT NULL,
                    date DATE NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (school_id) REFERENCES schools(id),
                    FOREIGN KEY (teacher_id) REFERENCES users(id)
                )
            `);

            // Add sample data
            this.db.get("SELECT COUNT(*) as count FROM schools", async (err, row) => {
                if (row && row.count === 0) {
                    // Create sample school
                    this.db.run(`
                        INSERT INTO schools (name, udise_number, address, pin_code, phone, principal_name, principal_mobile) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, ['डेमो प्राथमिक शाळा', '12345678901', 'मुख्य रस्ता, नागपूर', '440001', '07123456789', 'श्री राम शर्मा', '9876543210']);
                    
                    // Create principal user
                    const hashedPassword = await bcrypt.hash('9876543210', 10);
                    this.db.run(`
                        INSERT INTO users (school_id, name, mobile, password, role) 
                        VALUES (?, ?, ?, ?, ?)
                    `, [1, 'श्री राम शर्मा', '9876543210', hashedPassword, 'principal']);

                    // Create sample teacher
                    const teacherPassword = await bcrypt.hash('9876543211', 10);
                    this.db.run(`
                        INSERT INTO users (school_id, name, mobile, password, role, class, section) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [1, 'सुनीता देवी', '9876543211', teacherPassword, 'teacher', '5', 'A']);

                    // Create sample students
                    const students = [
                        [1, 1, 'राहुल शर्मा', 'सुनीता शर्मा', '2015-05-15', 'नागपूर', '9876543212', '123456789012', 'STU001', '5', 'A'],
                        [1, 2, 'प्रिया पाटील', 'अनीता पाटील', '2015-03-20', 'नागपूर', '9876543213', '123456789013', 'STU002', '5', 'A'],
                        [1, 3, 'अमित कुमार', 'सुनील कुमार', '2015-07-10', 'नागपूर', '9876543214', '123456789014', 'STU003', '5', 'A']
                    ];

                    students.forEach(student => {
                        this.db.run(`
                            INSERT INTO students (school_id, roll_number, name, mother_name, date_of_birth, address, parent_mobile, aadhar_number, student_id, class, section)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `, student);
                    });

                    console.log('✅ Sample data created successfully!');
                }
            });
        });
    }

    // Query method for SELECT statements
    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('Database query error:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Get single row
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    console.error('Database get error:', err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Run method for INSERT, UPDATE, DELETE
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    console.error('Database run error:', err);
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        changes: this.changes
                    });
                }
            });
        });
    }

    // Execute method (alias for run)
    execute(sql, params = []) {
        return this.run(sql, params);
    }

    // Close database connection
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

// Export singleton instance
module.exports = new Database();