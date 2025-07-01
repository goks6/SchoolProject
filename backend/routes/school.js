const express = require('express');
const router = express.Router();
const db = require('../config/database-sqlite');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

// Get School Details
router.get('/details', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;

        const school = await db.get(
            `SELECT 
                id, name, udise_number, address, pin_code, phone,
                principal_name, principal_mobile, principal_email,
                created_at, updated_at
             FROM schools WHERE id = ?`,
            [schoolId]
        );

        if (!school) {
            return res.status(404).json({
                success: false,
                message: 'शाळा सापडली नाही'
            });
        }

        // Get additional statistics
        const totalStudents = await db.get(
            'SELECT COUNT(*) as count FROM students WHERE school_id = ? AND is_active = 1',
            [schoolId]
        );

        const totalTeachers = await db.get(
            'SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = "teacher" AND is_active = 1',
            [schoolId]
        );

        res.json({
            success: true,
            data: {
                school,
                statistics: {
                    total_students: totalStudents.count,
                    total_teachers: totalTeachers.count
                }
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

// Get Teachers List
router.get('/teachers', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;

        const teachers = await db.query(
            `SELECT 
                id, name, mobile, email, class, section,
                is_active, created_at
             FROM users 
             WHERE school_id = ? AND role = 'teacher'
             ORDER BY name`,
            [schoolId]
        );

        res.json({
            success: true,
            data: { teachers }
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
                errors: errors.array()
            });
        }

        try {
            const { schoolId } = req.user;
            const { name, mobile, email, class: className, section } = req.body;

            // Check if mobile already exists
            const existing = await db.get(
                'SELECT id FROM users WHERE mobile = ?',
                [mobile]
            );

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'हा मोबाईल नंबर आधीच नोंदणीकृत आहे'
                });
            }

            // Default password is mobile number
            const hashedPassword = await bcrypt.hash(mobile, 12);

            // Insert teacher
            const result = await db.run(
                `INSERT INTO users (
                    school_id, name, mobile, email, password, role,
                    class, section, is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 'teacher', ?, ?, 1, datetime('now'), datetime('now'))`,
                [schoolId, name, mobile, email || null, hashedPassword, className, section]
            );

            res.status(201).json({
                success: true,
                message: 'शिक्षक यशस्वीपणे जोडला गेला',
                data: {
                    teacherId: result.id,
                    credentials: {
                        mobile,
                        password: mobile,
                        message: 'शिक्षकाचा पासवर्ड त्यांचा मोबाईल नंबरच आहे'
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

// Reset Teacher Password
router.post('/reset-teacher-password', authMiddleware, async (req, res) => {
    if (req.user.role !== 'principal') {
        return res.status(403).json({
            success: false,
            message: 'केवळ मुख्याध्यापक पासवर्ड रीसेट करू शकतात'
        });
    }

    try {
        const { schoolId } = req.user;
        const { teacherId } = req.body;

        // Get teacher's mobile number
        const teacher = await db.get(
            'SELECT mobile FROM users WHERE id = ? AND school_id = ? AND role = "teacher"',
            [teacherId, schoolId]
        );

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'शिक्षक सापडला नाही'
            });
        }

        // Reset password to mobile number
        const hashedPassword = await bcrypt.hash(teacher.mobile, 12);
        
        await db.run(
            'UPDATE users SET password = ?, updated_at = datetime("now") WHERE id = ?',
            [hashedPassword, teacherId]
        );

        res.json({
            success: true,
            message: 'पासवर्ड रीसेट झाला (मोबाईल नंबर)'
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            success: false,
            message: 'पासवर्ड रीसेट करताना त्रुटी'
        });
    }
});

// Delete Teacher
router.delete('/teacher/:teacherId', authMiddleware, async (req, res) => {
    if (req.user.role !== 'principal') {
        return res.status(403).json({
            success: false,
            message: 'केवळ मुख्याध्यापक शिक्षक काढू शकतात'
        });
    }

    try {
        const { schoolId } = req.user;
        const { teacherId } = req.params;

        // Verify teacher belongs to same school
        const teacher = await db.get(
            'SELECT id FROM users WHERE id = ? AND school_id = ? AND role = "teacher"',
            [teacherId, schoolId]
        );

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'शिक्षक सापडला नाही'
            });
        }

        await db.run(
            'UPDATE users SET is_active = 0, updated_at = datetime("now") WHERE id = ?',
            [teacherId]
        );

        res.json({
            success: true,
            message: 'शिक्षक काढून टाकला'
        });

    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({
            success: false,
            message: 'शिक्षक काढताना त्रुटी'
        });
    }
});

// Set Holidays
router.post('/holidays', authMiddleware, async (req, res) => {
    if (req.user.role !== 'principal') {
        return res.status(403).json({
            success: false,
            message: 'केवळ मुख्याध्यापक सुट्ट्या सेट करू शकतात'
        });
    }

    try {
        const { schoolId } = req.user;
        const { dates, reason } = req.body;

        if (!Array.isArray(dates) || dates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'कृपया किमान एक तारीख निवडा'
            });
        }

        // Insert holidays
        for (const date of dates) {
            await db.run(
                `INSERT OR REPLACE INTO holidays (school_id, date, reason, created_at)
                 VALUES (?, ?, ?, datetime('now'))`,
                [schoolId, date, reason || null]
            );
        }

        res.json({
            success: true,
            message: 'सुट्ट्या यशस्वीपणे जतन केल्या'
        });

    } catch (error) {
        console.error('Error setting holidays:', error);
        res.status(500).json({
            success: false,
            message: 'सुट्ट्या सेट करताना त्रुटी'
        });
    }
});

// Get Holidays
router.get('/holidays', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { year, month } = req.query;

        let query = 'SELECT * FROM holidays WHERE school_id = ?';
        let params = [schoolId];

        if (year && month) {
            query += ' AND strftime("%Y", date) = ? AND strftime("%m", date) = ?';
            params.push(year, month.padStart(2, '0'));
        }

        query += ' ORDER BY date';

        const holidays = await db.query(query, params);

        res.json({
            success: true,
            data: { holidays }
        });

    } catch (error) {
        console.error('Error getting holidays:', error);
        res.status(500).json({
            success: false,
            message: 'सुट्ट्या मिळवताना त्रुटी'
        });
    }
});

// Get Attendance Summary
router.get('/attendance-summary', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const summary = await db.query(
            `SELECT 
                s.class,
                s.section,
                COUNT(s.id) as total_students,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent,
                GROUP_CONCAT(CASE WHEN a.status = 'absent' THEN s.name END) as absent_students
             FROM students s
             LEFT JOIN attendance a ON s.id = a.student_id AND DATE(a.date) = ?
             WHERE s.school_id = ? AND s.is_active = 1
             GROUP BY s.class, s.section
             ORDER BY s.class, s.section`,
            [targetDate, schoolId]
        );

        res.json({
            success: true,
            data: { summary }
        });

    } catch (error) {
        console.error('Error getting attendance summary:', error);
        res.status(500).json({
            success: false,
            message: 'हजेरी सारांश मिळवताना त्रुटी'
        });
    }
});

module.exports = router;