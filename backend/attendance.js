const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { query, validationResult } = require('express-validator');

// Get Today's Attendance Summary
router.get('/today', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;
        const today = new Date().toISOString().split('T')[0];

        const [result] = await db.execute(
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
                present: parseInt(result[0].present) || 0,
                absent: parseInt(result[0].absent) || 0,
                late: parseInt(result[0].late) || 0,
                total: parseInt(result[0].total) || 0,
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

// Get Attendance by Date
router.get('/date/:date', 
    authMiddleware,
    [
        query('date').isISO8601().toDate()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'अवैध तारीख स्वरूप',
                errors: errors.array()
            });
        }

        try {
            const { schoolId } = req.user;
            const { date } = req.params;

            const [attendance] = await db.execute(
                `SELECT 
                    a.*,
                    s.name as student_name,
                    s.roll_number,
                    s.class,
                    s.section
                 FROM attendance a
                 JOIN students s ON a.student_id = s.id
                 WHERE s.school_id = ? AND DATE(a.date) = ?
                 ORDER BY s.class, s.section, s.roll_number`,
                [schoolId, date]
            );

            res.json({
                success: true,
                data: attendance
            });

        } catch (error) {
            console.error('Error getting attendance by date:', error);
            res.status(500).json({
                success: false,
                message: 'हजेरी मिळवताना त्रुटी'
            });
        }
});

// Mark Attendance
router.post('/mark',
    authMiddleware,
    async (req, res) => {
        try {
            const { schoolId, userId } = req.user;
            const { studentId, status, date, remarks } = req.body;

            // Validation
            if (!studentId || !status || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'सर्व आवश्यक माहिती भरणे आवश्यक आहे'
                });
            }

            // Validate status
            const validStatuses = ['present', 'absent', 'late', 'holiday'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'अवैध हजेरी स्थिती'
                });
            }

            // Check if student belongs to the school
            const [student] = await db.execute(
                'SELECT id FROM students WHERE id = ? AND school_id = ?',
                [studentId, schoolId]
            );

            if (student.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'विद्यार्थी सापडला नाही'
                });
            }

            // Check if attendance already marked
            const [existing] = await db.execute(
                'SELECT id FROM attendance WHERE student_id = ? AND DATE(date) = ?',
                [studentId, date]
            );

            if (existing.length > 0) {
                // Update existing attendance
                await db.execute(
                    `UPDATE attendance 
                     SET status = ?, remarks = ?, marked_by = ?, updated_at = CURRENT_TIMESTAMP
                     WHERE student_id = ? AND DATE(date) = ?`,
                    [status, remarks || null, userId, studentId, date]
                );
            } else {
                // Insert new attendance
                await db.execute(
                    `INSERT INTO attendance (student_id, date, status, remarks, marked_by, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    [studentId, date, status, remarks || null, userId]
                );
            }

            res.json({
                success: true,
                message: 'हजेरी यशस्वीपणे नोंदवली गेली'
            });

        } catch (error) {
            console.error('Error marking attendance:', error);
            res.status(500).json({
                success: false,
                message: 'हजेरी नोंदवताना त्रुटी'
            });
        }
});

// Get Class Attendance
router.get('/class/:class/:section',
    authMiddleware,
    async (req, res) => {
        try {
            const { schoolId } = req.user;
            const { class: className, section } = req.params;
            const date = req.query.date || new Date().toISOString().split('T')[0];

            const [attendance] = await db.execute(
                `SELECT 
                    s.id as student_id,
                    s.name,
                    s.roll_number,
                    a.status,
                    a.remarks,
                    a.marked_by,
                    a.updated_at
                 FROM students s
                 LEFT JOIN attendance a ON s.id = a.student_id AND DATE(a.date) = ?
                 WHERE s.school_id = ? AND s.class = ? AND s.section = ?
                 ORDER BY s.roll_number`,
                [date, schoolId, className, section]
            );

            res.json({
                success: true,
                data: {
                    class: className,
                    section,
                    date,
                    students: attendance
                }
            });

        } catch (error) {
            console.error('Error getting class attendance:', error);
            res.status(500).json({
                success: false,
                message: 'वर्ग हजेरी मिळवताना त्रुटी'
            });
        }
});

// Get Monthly Report
router.get('/report/monthly/:year/:month',
    authMiddleware,
    async (req, res) => {
        try {
            const { schoolId } = req.user;
            const { year, month } = req.params;

            const [report] = await db.execute(
                `SELECT 
                    s.class,
                    s.section,
                    COUNT(DISTINCT s.id) as total_students,
                    COUNT(DISTINCT DATE(a.date)) as working_days,
                    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as total_present,
                    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as total_absent,
                    SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as total_late
                 FROM students s
                 LEFT JOIN attendance a ON s.id = a.student_id 
                    AND YEAR(a.date) = ? AND MONTH(a.date) = ?
                 WHERE s.school_id = ?
                 GROUP BY s.class, s.section
                 ORDER BY s.class, s.section`,
                [year, month, schoolId]
            );

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

module.exports = router;