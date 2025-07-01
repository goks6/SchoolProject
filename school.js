const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get School Details
router.get('/details', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;

        const [schools] = await db.execute(
            `SELECT 
                id, name, udise_number, address, pin_code, phone,
                principal_name, principal_mobile, principal_email,
                created_at, updated_at
             FROM schools WHERE id = ?`,
            [schoolId]
        );

        if (schools.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'शाळा सापडली नाही'
            });
        }

        // Get additional statistics
        const [stats] = await db.execute(
            `SELECT 
                (SELECT COUNT(*) FROM students WHERE school_id = ?) as total_students,
                (SELECT COUNT(*) FROM users WHERE school_id = ? AND role = 'teacher') as total_teachers,
                (SELECT COUNT(DISTINCT class) FROM students WHERE school_id = ?) as total_classes
             FROM dual`,
            [schoolId, schoolId, schoolId]
        );

        res.json({
            success: true,
            data: {
                school: schools[0],
                statistics: stats[0]
            }
        });

    } catch (error) {
        console.error('Error getting school details:', error);
        res.status(500).json({
            success: false,
            message: 'शाळेची माहिती मिळवताना त्रुटी'
        });
    }
});

// Update School Details
router.put('/update',
    authMiddleware,
    [
        body('address').optional().notEmpty().trim(),
        body('pinCode').optional().matches(/^\d{6}$/),
        body('phone').optional().matches(/^\d{10,11}$/),
        body('principalEmail').optional().isEmail()
    ],
    async (req, res) => {
        // Check if user is principal
        if (req.user.role !== 'principal') {
            return res.status(403).json({
                success: false,
                message: 'केवळ मुख्याध्यापक माहिती अद्यतनित करू शकतात'
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        try {
            const { schoolId } = req.user;
            const { name, mobile, email, class: className, section } = req.body;

            // Check if mobile already exists
            const [existing] = await db.execute(
                'SELECT id FROM users WHERE mobile = ?',
                [mobile]
            );

            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'हा मोबाईल नंबर आधीच नोंदणीकृत आहे'
                });
            }

            // Generate random password
            const crypto = require('crypto');
            const randomPassword = crypto.randomBytes(6).toString('hex');
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(randomPassword, 12);

            // Insert teacher
            const [result] = await db.execute(
                `INSERT INTO users (
                    school_id, name, mobile, email, password, role,
                    class, section, is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 'teacher', ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [schoolId, name, mobile, email || null, hashedPassword, className, section]
            );

            res.status(201).json({
                success: true,
                message: 'शिक्षक यशस्वीपणे जोडला गेला',
                data: {
                    teacherId: result.insertId,
                    credentials: {
                        mobile,
                        password: randomPassword,
                        message: 'कृपया शिक्षकाला हे क्रेडेंशियल्स द्या'
                    }
                }
            });

        } catch (error) {
            console.error('Error adding teacher:', error);
            res.status(500).json({
                success: false,
                message: 'शिक्षक जोडताना त्रुटी'
            });
        }
    }
);

// Update Teacher Status
router.put('/teacher/:teacherId/status',
    authMiddleware,
    async (req, res) => {
        // Check if user is principal
        if (req.user.role !== 'principal') {
            return res.status(403).json({
                success: false,
                message: 'केवळ मुख्याध्यापक शिक्षकाची स्थिती बदलू शकतात'
            });
        }

        try {
            const { schoolId } = req.user;
            const { teacherId } = req.params;
            const { isActive } = req.body;

            // Verify teacher belongs to same school
            const [teacher] = await db.execute(
                'SELECT id FROM users WHERE id = ? AND school_id = ? AND role = "teacher"',
                [teacherId, schoolId]
            );

            if (teacher.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'शिक्षक सापडला नाही'
                });
            }

            await db.execute(
                'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [isActive ? 1 : 0, teacherId]
            );

            res.json({
                success: true,
                message: `शिक्षक ${isActive ? 'सक्रिय' : 'निष्क्रिय'} केला गेला`
            });

        } catch (error) {
            console.error('Error updating teacher status:', error);
            res.status(500).json({
                success: false,
                message: 'शिक्षकाची स्थिती बदलताना त्रुटी'
            });
        }
    }
);

// Get Classes and Sections
router.get('/classes', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;

        const [classes] = await db.execute(
            `SELECT DISTINCT 
                class, 
                section,
                COUNT(*) as student_count
             FROM students 
             WHERE school_id = ?
             GROUP BY class, section
             ORDER BY class, section`,
            [schoolId]
        );

        // Group by class
        const classesGrouped = classes.reduce((acc, curr) => {
            if (!acc[curr.class]) {
                acc[curr.class] = {
                    class: curr.class,
                    sections: [],
                    totalStudents: 0
                };
            }
            acc[curr.class].sections.push({
                section: curr.section,
                studentCount: curr.student_count
            });
            acc[curr.class].totalStudents += curr.student_count;
            return acc;
        }, {});

        res.json({
            success: true,
            data: Object.values(classesGrouped)
        });

    } catch (error) {
        console.error('Error getting classes:', error);
        res.status(500).json({
            success: false,
            message: 'वर्ग माहिती मिळवताना त्रुटी'
        });
    }
});

// Get Dashboard Statistics
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;
        const today = new Date().toISOString().split('T')[0];

        // Get various statistics
        const [totalStudents] = await db.execute(
            'SELECT COUNT(*) as count FROM students WHERE school_id = ?',
            [schoolId]
        );

        const [totalTeachers] = await db.execute(
            'SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = "teacher" AND is_active = 1',
            [schoolId]
        );

        const [todayAttendance] = await db.execute(
            `SELECT 
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late
             FROM attendance a
             JOIN students s ON a.student_id = s.id
             WHERE s.school_id = ? AND DATE(a.date) = ?`,
            [schoolId, today]
        );

        const [monthlyAttendance] = await db.execute(
            `SELECT 
                AVG(CASE WHEN a.status = 'present' THEN 100.0 ELSE 0 END) as avg_attendance
             FROM attendance a
             JOIN students s ON a.student_id = s.id
             WHERE s.school_id = ? 
             AND a.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
            [schoolId]
        );

        const [recentActivity] = await db.execute(
            `SELECT 
                'attendance' as type,
                CONCAT(u.name, ' ने ', s.name, ' ची हजेरी नोंदवली') as description,
                a.created_at
             FROM attendance a
             JOIN students s ON a.student_id = s.id
             JOIN users u ON a.marked_by = u.id
             WHERE s.school_id = ?
             ORDER BY a.created_at DESC
             LIMIT 5`,
            [schoolId]
        );

        res.json({
            success: true,
            data: {
                statistics: {
                    totalStudents: totalStudents[0].count,
                    totalTeachers: totalTeachers[0].count,
                    todayPresent: todayAttendance[0].present || 0,
                    todayAbsent: todayAttendance[0].absent || 0,
                    todayLate: todayAttendance[0].late || 0,
                    monthlyAttendanceRate: parseFloat(monthlyAttendance[0].avg_attendance || 0).toFixed(2)
                },
                recentActivity: recentActivity
            }
        });

    } catch (error) {
        console.error('Error getting dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'डॅशबोर्ड डेटा मिळवताना त्रुटी'
        });
    }
});

// Export Attendance Report
router.get('/export/attendance/:startDate/:endDate',
    authMiddleware,
    async (req, res) => {
        try {
            const { schoolId } = req.user;
            const { startDate, endDate } = req.params;

            const [attendanceData] = await db.execute(
                `SELECT 
                    s.name as student_name,
                    s.roll_number,
                    s.class,
                    s.section,
                    DATE_FORMAT(a.date, '%Y-%m-%d') as date,
                    a.status,
                    a.remarks,
                    u.name as marked_by
                 FROM attendance a
                 JOIN students s ON a.student_id = s.id
                 LEFT JOIN users u ON a.marked_by = u.id
                 WHERE s.school_id = ? 
                 AND DATE(a.date) BETWEEN ? AND ?
                 ORDER BY a.date DESC, s.class, s.section, s.roll_number`,
                [schoolId, startDate, endDate]
            );

            res.json({
                success: true,
                data: {
                    startDate,
                    endDate,
                    records: attendanceData
                }
            });

        } catch (error) {
            console.error('Error exporting attendance:', error);
            res.status(500).json({
                success: false,
                message: 'हजेरी निर्यात करताना त्रुटी'
            });
        }
    }
);

module.exports = router;
                errors: errors.array()
            });
        }

        try {
            const { schoolId } = req.user;
            const { address, pinCode, phone, principalEmail } = req.body;

            const updates = [];
            const values = [];

            if (address) {
                updates.push('address = ?');
                values.push(address);
            }
            if (pinCode) {
                updates.push('pin_code = ?');
                values.push(pinCode);
            }
            if (phone) {
                updates.push('phone = ?');
                values.push(phone);
            }
            if (principalEmail) {
                updates.push('principal_email = ?');
                values.push(principalEmail);
            }

            if (updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'अद्यतनित करण्यासाठी काहीही नाही'
                });
            }

            updates.push('updated_at = CURRENT_TIMESTAMP');
            values.push(schoolId);

            await db.execute(
                `UPDATE schools SET ${updates.join(', ')} WHERE id = ?`,
                values
            );

            res.json({
                success: true,
                message: 'शाळेची माहिती यशस्वीपणे अद्यतनित केली'
            });

        } catch (error) {
            console.error('Error updating school:', error);
            res.status(500).json({
                success: false,
                message: 'शाळेची माहिती अद्यतनित करताना त्रुटी'
            });
        }
    }
);

// Get Teachers List
router.get('/teachers', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;

        const [teachers] = await db.execute(
            `SELECT 
                id, name, mobile, email, class, section,
                is_active, last_login, created_at
             FROM users 
             WHERE school_id = ? AND role = 'teacher'
             ORDER BY name`,
            [schoolId]
        );

        res.json({
            success: true,
            data: teachers
        });

    } catch (error) {
        console.error('Error getting teachers:', error);
        res.status(500).json({
            success: false,
            message: 'शिक्षकांची यादी मिळवताना त्रुटी'
        });
    }
});

// Add Teacher
router.post('/add-teacher',
    authMiddleware,
    [
        body('name').notEmpty().trim(),
        body('mobile').matches(/^\d{10}$/),
        body('email').optional().isEmail(),
        body('class').notEmpty(),
        body('section').notEmpty()
    ],
    async (req, res) => {
        // Check if user is principal
        if (req.user.role !== 'principal') {
            return res.status(403).json({
                success: false,
                message: 'केवळ मुख्याध्यापक शिक्षक जोडू शकतात'
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,