const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

class Database {
    constructor() {
        // Ensure the backend directory exists and is writable
        const dbDir = path.join(__dirname, '..');
        const dbPath = path.join(dbDir, 'school.db');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        
        console.log('📍 Database path:', dbPath);
        
        // Initialize database with error handling
        try {
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('❌ Database connection failed:', err.message);
                    // Fallback to in-memory database
                    console.log('🔄 Falling back to in-memory database...');
                    this.db = new sqlite3.Database(':memory:');
                    this.init();
                } else {
                    console.log('✅ SQLite database connected successfully');
                    this.init();
                }
            });
        } catch (error) {
            console.error('❌ Database initialization error:', error);
            // Use in-memory database as fallback
            this.db = new sqlite3.Database(':memory:');
            this.init();
        }
    }

    init() {
        this.db.serialize(() => {
            // Schools table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS schools (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    udise_number TEXT UNIQUE,
                    address TEXT,
                    pin_code TEXT,
                    phone TEXT,
                    principal_name TEXT,
                    principal_mobile TEXT UNIQUE,
                    principal_email TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creating schools table:', err);
            });

            // Users table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    school_id INTEGER,
                    name TEXT NOT NULL,
                    mobile TEXT UNIQUE NOT NULL,
                    email TEXT,
                    password TEXT NOT NULL,
                    role TEXT CHECK(role IN ('principal', 'teacher')),
                    class TEXT,
                    section TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    last_login DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (school_id) REFERENCES schools(id)
                )
            `, (err) => {
                if (err) console.error('Error creating users table:', err);
            });

            // Enhanced Students table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    school_id INTEGER,
                    roll_number INTEGER,
                    name TEXT NOT NULL,
                    mother_name TEXT,
                    father_name TEXT,
                    date_of_birth DATE,
                    address TEXT,
                    parent_mobile TEXT,
                    aadhar_number TEXT,
                    student_id TEXT,
                    class TEXT,
                    section TEXT,
                    teacher_id INTEGER,
                    blood_group TEXT,
                    emergency_contact TEXT,
                    gender TEXT DEFAULT 'other',
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (school_id) REFERENCES schools(id),
                    FOREIGN KEY (teacher_id) REFERENCES users(id)
                )
            `, (err) => {
                if (err) console.error('Error creating students table:', err);
            });

            // Attendance table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS attendance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER,
                    school_id INTEGER,
                    teacher_id INTEGER,
                    date DATE NOT NULL,
                    status TEXT CHECK(status IN ('present', 'absent', 'late')),
                    remarks TEXT,
                    marked_by INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students(id),
                    FOREIGN KEY (school_id) REFERENCES schools(id),
                    FOREIGN KEY (teacher_id) REFERENCES users(id),
                    FOREIGN KEY (marked_by) REFERENCES users(id)
                )
            `, (err) => {
                if (err) console.error('Error creating attendance table:', err);
            });

            // Holidays table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS holidays (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    school_id INTEGER,
                    date DATE NOT NULL,
                    reason TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (school_id) REFERENCES schools(id)
                )
            `, (err) => {
                if (err) console.error('Error creating holidays table:', err);
            });

            // Messages table (for study messages and notices)
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
            `, (err) => {
                if (err) console.error('Error creating messages table:', err);
            });

            // Enhanced Notices table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS notices (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    school_id INTEGER,
                    author_id INTEGER,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    type TEXT CHECK(type IN ('general', 'urgent', 'event', 'holiday')) DEFAULT 'general',
                    target_audience TEXT DEFAULT 'all',
                    priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
                    expiry_date DATE,
                    attachments TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (school_id) REFERENCES schools(id),
                    FOREIGN KEY (author_id) REFERENCES users(id)
                )
            `, (err) => {
                if (err) console.error('Error creating notices table:', err);
            });

            // Notice reads table (to track who read what)
            this.db.run(`
                CREATE TABLE IF NOT EXISTS notice_reads (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    notice_id INTEGER,
                    user_id INTEGER,
                    read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (notice_id) REFERENCES notices(id),
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    UNIQUE(notice_id, user_id)
                )
            `, (err) => {
                if (err) console.error('Error creating notice_reads table:', err);
            });

            // Achievements table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS achievements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    type TEXT CHECK(type IN ('academic', 'sports', 'cultural', 'behavior', 'other')) DEFAULT 'other',
                    date DATE NOT NULL,
                    level TEXT CHECK(level IN ('school', 'district', 'state', 'national')) DEFAULT 'school',
                    position TEXT,
                    certificate_url TEXT,
                    remarks TEXT,
                    awarded_by INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students(id),
                    FOREIGN KEY (awarded_by) REFERENCES users(id)
                )
            `, (err) => {
                if (err) console.error('Error creating achievements table:', err);
            });

            // Create sample data after all tables are created
            setTimeout(() => {
                this.createSampleData();
            }, 1000);
        });
    }

    async createSampleData() {
        try {
            // Check if sample data exists
            const schoolCount = await this.get("SELECT COUNT(*) as count FROM schools");
            
            if (schoolCount && schoolCount.count === 0) {
                console.log('🏫 Creating sample school data...');
                
                // Create sample school
                const schoolResult = await this.run(`
                    INSERT INTO schools (name, udise_number, address, pin_code, phone, principal_name, principal_mobile) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, ['डेमो प्राथमिक शाळा', '123456789012', 'मुख्य रस्ता, नागपूर', '440001', '07123456789', 'श्री राम शर्मा', '9876543210']);
                
                // Create principal user
                const hashedPassword = await bcrypt.hash('9876543210', 10);
                await this.run(`
                    INSERT INTO users (school_id, name, mobile, password, role) 
                    VALUES (?, ?, ?, ?, ?)
                `, [1, 'श्री राम शर्मा', '9876543210', hashedPassword, 'principal']);

                // Create sample teacher
                const teacherPassword = await bcrypt.hash('9876543211', 10);
                await this.run(`
                    INSERT INTO users (school_id, name, mobile, password, role, class, section) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [1, 'सुनीता देवी', '9876543211', teacherPassword, 'teacher', '5', 'A']);

                // Create sample students with enhanced fields
                const students = [
                    [1, 1, 'राहुल शर्मा', 'सुनीता शर्मा', 'राम शर्मा', '2015-05-15', 'नागपूर', '9876543212', '123456789012', 'STU001', '5', 'A', 2, 'O+', '9876543299', 'male'],
                    [1, 2, 'प्रिया पाटील', 'अनीता पाटील', 'सुनील पाटील', '2015-03-20', 'नागपूर', '9876543213', '123456789013', 'STU002', '5', 'A', 2, 'A+', '9876543298', 'female'],
                    [1, 3, 'अमित कुमार', 'सुनील कुमार', 'राज कुमार', '2015-07-10', 'नागपूर', '9876543214', '123456789014', 'STU003', '5', 'A', 2, 'B+', '9876543297', 'male'],
                    [1, 4, 'अनिता राव', 'सुमित्रा राव', 'विनोद राव', '2015-01-25', 'नागपूर', '9876543215', '123456789015', 'STU004', '5', 'A', 2, 'AB+', '9876543296', 'female'],
                    [1, 5, 'विकास जोशी', 'मीरा जोशी', 'अशोक जोशी', '2015-09-12', 'नागपूर', '9876543216', '123456789016', 'STU005', '5', 'A', 2, 'O-', '9876543295', 'male'],
                    [1, 6, 'स्नेहा देशमुख', 'प्रिया देशमुख', 'संजय देशमुख', '2015-11-08', 'नागपूर', '9876543217', '123456789017', 'STU006', '5', 'A', 2, 'A-', '9876543294', 'female']
                ];

                for (const student of students) {
                    await this.run(`
                        INSERT INTO students (school_id, roll_number, name, mother_name, father_name, date_of_birth, address, parent_mobile, aadhar_number, student_id, class, section, teacher_id, blood_group, emergency_contact, gender)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, student);
                }

                // Create sample notices
                const notices = [
                    [1, 2, 'वार्षिक क्रीडा स्पर्धा', 'आगामी शुक्रवारी वार्षिक क्रीडा स्पर्धा आयोजित केली जाईल. सर्व विद्यार्थ्यांनी सहभागी व्हावे.', 'event', 'all', 'high'],
                    [1, 2, 'पालक-शिक्षक भेट', 'या शनिवारी सकाळी 10 वाजता पालक-शिक्षक भेट आयोजित केली आहे.', 'general', 'parents', 'medium'],
                    [1, 1, 'गणेश चतुर्थी सुट्टी', 'गणेश चतुर्थी निमित्त उद्या शाळा बंद राहील.', 'holiday', 'all', 'low']
                ];

                for (const notice of notices) {
                    await this.run(`
                        INSERT INTO notices (school_id, author_id, title, message, type, target_audience, priority)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, notice);
                }

                // Create sample achievements
                const achievements = [
                    [1, 'गणित स्पर्धा प्रथम', 'जिल्हा पातळीवरील गणित स्पर्धेत प्रथम क्रमांक', 'academic', '2024-01-15', 'district', '1st', 2],
                    [2, 'नृत्य स्पर्धा द्वितीय', 'शाळा पातळीवरील नृत्य स्पर्धेत द्वितीय क्रमांक', 'cultural', '2024-01-10', 'school', '2nd', 2],
                    [3, 'खेळ स्पर्धा तृतीय', 'क्रिकेट स्पर्धेत तृतीय क्रमांक', 'sports', '2024-01-05', 'school', '3rd', 2],
                    [4, 'उत्तम वर्तन', 'वर्गात उत्तम वर्तनासाठी प्रशंसा', 'behavior', '2024-01-20', 'school', null, 2]
                ];

                for (const achievement of achievements) {
                    await this.run(`
                        INSERT INTO achievements (student_id, title, description, type, date, level, position, awarded_by)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, achievement);
                }

                console.log('✅ Enhanced sample data created successfully!');
                console.log('📱 Principal Login: 9876543210 / 9876543210');
                console.log('👨‍🏫 Teacher Login: 9876543211 / 9876543211');
            } else {
                console.log('📊 Database already contains data');
            }
        } catch (error) {
            console.error('Error creating sample data:', error);
        }
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
                    console.log('💾 Database connection closed');
                    resolve();
                }
            });
        });
    }
}

// Export singleton instance
module.exports = new Database();