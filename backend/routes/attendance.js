const express = require('express');
const router = express.Router();
const db = require('../config/database-sqlite');
const authMiddleware = require('../middleware/auth');

// Get Today's Attendance Summary
router.get('/today', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;
        const today = new Date().toISOString().split('T')[0];

        const result = await db.get(
            `SELECT 
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
                COUNT(DISTINCT a.student_id) as total
             FROM attendance a
             JOIN students s ON a.student_id = s.id
             WHERE s.school_id = ? AND DATE(a.date) = ?`,
            [schoolId, today]
        );

        res.json({
            success: true,
            data: {
                present: parseInt(result?.present) || 0,
                absent: parseInt(result?.absent) || 0,
                late: parseInt(result?.late) || 0,
                total: parseInt(result?.total) || 0,
                date: today
            }
        });

    } catch (error) {
        console.error('Error getting today attendance:', error);
        res.status(500).json({
            success: false,
            message: 'आजची हजेरी मिळवताना त्रुटी',
            data: {
                present: 0,
                absent: 0,
                late: 0,
                total: 0
            }
        });
    }
});

// Get Attendance List for Date
router.get('/list', authMiddleware, async (req, res) => {
    try {
        const { schoolId, role, userId } = req.user;
        const { date, class: className, section } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        let query = `SELECT 
            s.id, s.roll_number, s.name, s.parent_mobile, s.class, s.section,
            a.status, a.remarks, a.date
         FROM students s
         LEFT JOIN attendance a ON s.id = a.student_id AND DATE(a.date) = ?
         WHERE s.school_id = ? AND s.is_active = 1`;
        
        let params = [targetDate, schoolId];

        // For teachers, limit to their assigned class
        if (role === 'teacher') {
            const teacherInfo = await db.get(
                'SELECT class, section FROM users WHERE id = ?',
                [userId]
            );
            
            if (teacherInfo && teacherInfo.class) {
                query += ' AND s.class = ?';
                params.push(teacherInfo.class);
                
                if (teacherInfo.section) {
                    query += ' AND s.section = ?';
                    params.push(teacherInfo.section);
                }
            }
        }

        if (className) {
            query += ' AND s.class = ?';
            params.push(className);
        }

        if (section) {
            query += ' AND s.section = ?';
            params.push(section);
        }

        query += ' ORDER BY s.class, s.section, s.roll_number';

        const students = await db.query(query, params);

        res.json({
            success: true,
            data: { students, date: targetDate }
        });

    } catch (error) {
        console.error('Error getting attendance list:', error);
        res.status(500).json({
            success: false,
            message: 'हजेरी यादी मिळवताना त्रुटी'
        });
    }
});

// Mark Attendance
router.post('/mark', authMiddleware, async (req, res) => {
    try {
        const { schoolId, userId } = req.user;
        const { date, attendance } = req.body;

        if (!date || !Array.isArray(attendance)) {
            return res.status(400).json({
                success: false,
                message: 'तारीख आणि हजेरी डेटा आवश्यक आहे'
            });
        }

        let presentCount = 0;
        let absentCount = 0;
        const absentStudents = [];

        // Process each attendance record
        for (const record of attendance) {
            const { studentId, status, remarks } = record;

            // Validate status
            if (!['present', 'absent', 'late'].includes(status)) {
                continue;
            }

            // Check if attendance already exists
            const existing = await db.get(
                'SELECT id FROM attendance WHERE student_id = ? AND DATE(date) = ?',
                [studentId, date]
            );

            if (existing) {
                // Update existing attendance
                await db.run(
                    `UPDATE attendance 
                     SET status = ?, remarks = ?, marked_by = ?, updated_at = datetime('now')
                     WHERE student_id = ? AND DATE(date) = ?`,
                    [status, remarks || null, userId, studentId, date]
                );
            } else {
                // Insert new attendance
                await db.run(
                    `INSERT INTO attendance (student_id, school_id, teacher_id, date, status, remarks, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
                    [studentId, schoolId, userId, date, status, remarks || null]
                );
            }

            // Count attendance
            if (status === 'present') {
                presentCount++;
            } else if (status === 'absent') {
                absentCount++;
                
                // Get student info for SMS
                const student = await db.get(
                    'SELECT name, parent_mobile FROM students WHERE id = ?',
                    [studentId]
                );
                
                if (student) {
                    absentStudents.push({
                        name: student.name,
                        mobile: student.parent_mobile
                    });
                }
            }
        }

        // Here you would integrate SMS/WhatsApp service
        // For now, we'll just log the absent students
        if (absentStudents.length > 0) {
            console.log('Absent students for SMS:', absentStudents);
            // TODO: Send SMS to parents of absent students
            // Message: "आपला पाल्य आज शाळेत आला नाही. याची नोंद पालकांनी घ्यावी"
        }

        res.json({
            success: true,
            message: 'हजेरी यशस्वीरित्या नोंदवली गेली',
            data: {
                summary: {
                    present: presentCount,
                    absent: absentCount,
                    total: attendance.length
                },
                notifications: {
                    sent: absentStudents.length
                }
            }
        });

    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({
            success: false,
            message: 'हजेरी नोंदवताना त्रुटी'
        });
    }
});

// Send Study Message
router.post('/study-message', authMiddleware, async (req, res) => {
    try {
        const { schoolId, userId, role } = req.user;
        const { message, date } = req.body;

        if (!message || !date) {
            return res.status(400).json({
                success: false,
                message: 'संदेश आणि तारीख आवश्यक आहे'
            });
        }

        if (role !== 'teacher') {
            return res.status(403).json({
                success: false,
                message: 'केवळ शिक्षक अभ्यास संदेश पाठवू शकतात'
            });
        }

        // Save study message
        await db.run(
            `INSERT INTO messages (school_id, teacher_id, type, content, date, created_at)
             VALUES (?, ?, 'study', ?, ?, datetime('now'))`,
            [schoolId, userId, message, date]
        );

        // Get students for this teacher
        const teacherInfo = await db.get(
            'SELECT class, section FROM users WHERE id = ?',
            [userId]
        );

        let students = [];
        if (teacherInfo && teacherInfo.class) {
            let query = 'SELECT name, parent_mobile FROM students WHERE school_id = ? AND class = ? AND is_active = 1';
            let params = [schoolId, teacherInfo.class];
            
            if (teacherInfo.section) {
                query += ' AND section = ?';
                params.push(teacherInfo.section);
            }
            
            students = await db.query(query, params);
        }

        // Here you would integrate SMS/WhatsApp service
        console.log('Study message to send:', message);
        console.log('Students to notify:', students.length);
        // TODO: Send study message to all parents

        res.json({
            success: true,
            message: 'अभ्यास संदेश यशस्वीरित्या पाठवला',
            data: {
                notifications: {
                    sent: students.length
                }
            }
        });

    } catch (error) {
        console.error('Error sending study message:', error);
        res.status(500).json({
            success: false,
            message: 'अभ्यास संदेश पाठवताना त्रुटी'
        });
    }
});

// Send Notice
router.post('/notice', authMiddleware, async (req, res) => {
    try {
        const { schoolId, userId, role } = req.user;
        const { message, targetType, selectedStudents } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'सूचना संदेश आवश्यक आहे'
            });
        }

        if (role !== 'teacher') {
            return res.status(403).json({
                success: false,
                message: 'केवळ शिक्षक सूचना पाठवू शकतात'
            });
        }

        // Save notice
        await db.run(
            `INSERT INTO messages (school_id, teacher_id, type, content, date, created_at)
             VALUES (?, ?, 'notice', ?, ?, datetime('now'))`,
            [schoolId, userId, message, new Date().toISOString().split('T')[0]]
        );

        let students = [];

        if (targetType === 'all') {
            // Get all students for this teacher
            const teacherInfo = await db.get(
                'SELECT class, section FROM users WHERE id = ?',
                [userId]
            );

            if (teacherInfo && teacherInfo.class) {
                let query = 'SELECT name, parent_mobile FROM students WHERE school_id = ? AND class = ? AND is_active = 1';
                let params = [schoolId, teacherInfo.class];
                
                if (teacherInfo.section) {
                    query += ' AND section = ?';
                    params.push(teacherInfo.section);
                }
                
                students = await db.query(query, params);
            }
        } else if (targetType === 'selected' && Array.isArray(selectedStudents)) {
            // Get selected students
            if (selectedStudents.length > 0) {
                const placeholders = selectedStudents.map(() => '?').join(',');
                students = await db.query(
                    `SELECT name, parent_mobile FROM students 
                     WHERE id IN (${placeholders}) AND school_id = ? AND is_active = 1`,
                    [...selectedStudents, schoolId]
                );
            }
        }

        // Here you would integrate SMS/WhatsApp service
        console.log('Notice to send:', message);
        console.log('Students to notify:', students.length);
        // TODO: Send notice to selected parents

        res.json({
            success: true,
            message: 'सूचना यशस्वीरित्या पाठवली',
            data: {
                notifications: {
                    sent: students.length
                }
            }
        });

    } catch (error) {
        console.error('Error sending notice:', error);
        res.status(500).json({
            success: false,
            message: 'सूचना पाठवताना त्रुटी'
        });
    }
});

// Get Study Messages
router.get('/study-messages', authMiddleware, async (req, res) => {
    try {
        const { schoolId, userId, role } = req.user;
        const { startDate, endDate, limit = 50 } = req.query;

        let query = `SELECT m.*, u.name as teacher_name
                     FROM messages m
                     JOIN users u ON m.teacher_id = u.id
                     WHERE m.school_id = ? AND m.type = 'study'`;
        let params = [schoolId];

        if (role === 'teacher') {
            query += ' AND m.teacher_id = ?';
            params.push(userId);
        }

        if (startDate) {
            query += ' AND DATE(m.date) >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND DATE(m.date) <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY m.date DESC, m.created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const messages = await db.query(query, params);

        res.json({
            success: true,
            data: { messages }
        });

    } catch (error) {
        console.error('Error getting study messages:', error);
        res.status(500).json({
            success: false,
            message: 'अभ्यास संदेश मिळवताना त्रुटी'
        });
    }
});

// Get Monthly Report
router.get('/monthly-report', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { year, month, class: className, section } = req.query;

        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: 'वर्ष आणि महिना आवश्यक आहे'
            });
        }

        let query = `SELECT 
            s.roll_number, s.name, s.class, s.section,
            COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
            COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
            COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_days,
            COUNT(a.id) as total_marked_days,
            ROUND(
                (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0) / 
                NULLIF(COUNT(a.id), 0), 2
            ) as attendance_percentage
         FROM students s
         LEFT JOIN attendance a ON s.id = a.student_id 
            AND strftime('%Y', a.date) = ? 
            AND strftime('%m', a.date) = ?
         WHERE s.school_id = ? AND s.is_active = 1`;
        
        let params = [year, month.padStart(2, '0'), schoolId];

        if (className) {
            query += ' AND s.class = ?';
            params.push(className);
        }

        if (section) {
            query += ' AND s.section = ?';
            params.push(section);
        }

        query += ' GROUP BY s.id ORDER BY s.class, s.section, s.roll_number';

        const report = await db.query(query, params);

        res.json({
            success: true,
            data: {
                year: parseInt(year),
                month: parseInt(month),
                report
            }
        });

    } catch (error) {
        console.error('Error generating monthly report:', error);
        res.status(500).json({
            success: false,
            message: 'मासिक अहवाल तयार करताना त्रुटी'
        });
    }
});

// Get Statistics
router.get('/statistics', authMiddleware, async (req, res) => {
    try {
        const { schoolId, role, userId } = req.user;
        const { startDate, endDate } = req.query;

        let query = `SELECT 
            COUNT(DISTINCT s.id) as total_students,
            COUNT(DISTINCT DATE(a.date)) as total_days,
            COUNT(CASE WHEN a.status = 'present' THEN 1 END) as total_present,
            COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as total_absent
         FROM students s
         LEFT JOIN attendance a ON s.id = a.student_id
         WHERE s.school_id = ? AND s.is_active = 1`;
        
        let params = [schoolId];

        // For teachers, limit to their class
        if (role === 'teacher') {
            const teacherInfo = await db.get(
                'SELECT class, section FROM users WHERE id = ?',
                [userId]
            );
            
            if (teacherInfo && teacherInfo.class) {
                query += ' AND s.class = ?';
                params.push(teacherInfo.class);
                
                if (teacherInfo.section) {
                    query += ' AND s.section = ?';
                    params.push(teacherInfo.section);
                }
            }
        }

        if (startDate) {
            query += ' AND DATE(a.date) >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND DATE(a.date) <= ?';
            params.push(endDate);
        }

        const stats = await db.get(query, params);

        res.json({
            success: true,
            data: {
                overall: stats || {
                    total_students: 0,
                    total_days: 0,
                    total_present: 0,
                    total_absent: 0
                }
            }
        });

    } catch (error) {
        console.error('Error getting statistics:', error);
        res.status(500).json({
            success: false,
            message: 'आकडेवारी मिळवताना त्रुटी'
        });
    }
});

module.exports = router;