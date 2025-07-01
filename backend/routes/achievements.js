const express = require('express');
const router = express.Router();
const db = require('../config/database-sqlite');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateAchievement = [
    body('studentId').notEmpty().isInt().withMessage('विद्यार्थी निवडणे आवश्यक आहे'),
    body('title').notEmpty().trim().withMessage('पुरस्काराचे शीर्षक आवश्यक आहे'),
    body('description').notEmpty().trim().withMessage('पुरस्काराचे वर्णन आवश्यक आहे'),
    body('type').isIn(['academic', 'sports', 'cultural', 'behavior', 'other']).withMessage('अवैध पुरस्कार प्रकार'),
    body('date').isISO8601().toDate().withMessage('योग्य तारीख टाका')
];

// Get All Achievements
router.get('/list', authMiddleware, async (req, res) => {
    try {
        const { schoolId, role, userId } = req.user;
        const { 
            studentId,
            type, 
            page = 1, 
            limit = 20,
            startDate,
            endDate,
            class: className,
            section
        } = req.query;

        let query = `SELECT 
            a.*, 
            s.name as student_name, 
            s.roll_number, 
            s.class, 
            s.section,
            u.name as awarded_by_name
         FROM achievements a
         JOIN students s ON a.student_id = s.id
         LEFT JOIN users u ON a.awarded_by = u.id
         WHERE s.school_id = ?`;
        
        let params = [schoolId];

        // For teachers, limit to their class students
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

        // Apply filters
        if (studentId) {
            query += ' AND a.student_id = ?';
            params.push(studentId);
        }

        if (type && type !== 'all') {
            query += ' AND a.type = ?';
            params.push(type);
        }

        if (className) {
            query += ' AND s.class = ?';
            params.push(className);
        }

        if (section) {
            query += ' AND s.section = ?';
            params.push(section);
        }

        if (startDate) {
            query += ' AND DATE(a.date) >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND DATE(a.date) <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY a.date DESC, a.created_at DESC';

        // Add pagination
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const achievements = await db.query(query, params);

        // Get total count for pagination
        let countQuery = `SELECT COUNT(*) as total 
                         FROM achievements a
                         JOIN students s ON a.student_id = s.id
                         WHERE s.school_id = ?`;
        let countParams = [schoolId];

        // Apply same filters for count
        if (role === 'teacher') {
            const teacherInfo = await db.get(
                'SELECT class, section FROM users WHERE id = ?',
                [userId]
            );
            
            if (teacherInfo && teacherInfo.class) {
                countQuery += ' AND s.class = ?';
                countParams.push(teacherInfo.class);
                
                if (teacherInfo.section) {
                    countQuery += ' AND s.section = ?';
                    countParams.push(teacherInfo.section);
                }
            }
        }

        if (studentId) {
            countQuery += ' AND a.student_id = ?';
            countParams.push(studentId);
        }

        if (type && type !== 'all') {
            countQuery += ' AND a.type = ?';
            countParams.push(type);
        }

        if (className) {
            countQuery += ' AND s.class = ?';
            countParams.push(className);
        }

        if (section) {
            countQuery += ' AND s.section = ?';
            countParams.push(section);
        }

        if (startDate) {
            countQuery += ' AND DATE(a.date) >= ?';
            countParams.push(startDate);
        }

        if (endDate) {
            countQuery += ' AND DATE(a.date) <= ?';
            countParams.push(endDate);
        }

        const totalResult = await db.get(countQuery, countParams);
        const total = totalResult.total;

        res.json({
            success: true,
            data: {
                achievements,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(total / limit),
                    total_records: total,
                    per_page: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error getting achievements:', error);
        res.status(500).json({
            success: false,
            message: 'पुरस्कार मिळवताना त्रुटी'
        });
    }
});

// Get Achievement by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;

        const achievement = await db.get(
            `SELECT 
                a.*, 
                s.name as student_name, 
                s.roll_number, 
                s.class, 
                s.section,
                u.name as awarded_by_name,
                u.role as awarded_by_role
             FROM achievements a
             JOIN students s ON a.student_id = s.id
             LEFT JOIN users u ON a.awarded_by = u.id
             WHERE a.id = ? AND s.school_id = ?`,
            [id, schoolId]
        );

        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: 'पुरस्कार सापडला नाही'
            });
        }

        res.json({
            success: true,
            data: { achievement }
        });

    } catch (error) {
        console.error('Error getting achievement:', error);
        res.status(500).json({
            success: false,
            message: 'पुरस्कार मिळवताना त्रुटी'
        });
    }
});

// Create New Achievement
router.post('/create', 
    authMiddleware,
    validateAchievement,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'कृपया सर्व माहिती योग्य रीतीने भरा',
                errors: errors.array()
            });
        }

        try {
            const { schoolId, userId } = req.user;
            const { 
                studentId, 
                title, 
                description, 
                type, 
                date,
                level = 'school', // school, district, state, national
                position = null, // 1st, 2nd, 3rd, etc.
                certificate_url = null,
                remarks = null
            } = req.body;

            // Verify student belongs to the school
            const student = await db.get(
                'SELECT id, name FROM students WHERE id = ? AND school_id = ? AND is_active = 1',
                [studentId, schoolId]
            );

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'विद्यार्थी सापडला नाही'
                });
            }

            // Insert achievement
            const result = await db.run(
                `INSERT INTO achievements (
                    student_id, title, description, type, date, level,
                    position, certificate_url, remarks, awarded_by,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [
                    studentId, title, description, type, date, level,
                    position, certificate_url, remarks, userId
                ]
            );

            // Get the created achievement with student details
            const createdAchievement = await db.get(
                `SELECT 
                    a.*, 
                    s.name as student_name, 
                    s.roll_number, 
                    s.class, 
                    s.section,
                    u.name as awarded_by_name
                 FROM achievements a
                 JOIN students s ON a.student_id = s.id
                 LEFT JOIN users u ON a.awarded_by = u.id
                 WHERE a.id = ?`,
                [result.id]
            );

            res.status(201).json({
                success: true,
                message: 'पुरस्कार यशस्वीरित्या नोंदवला',
                data: { achievement: createdAchievement }
            });

        } catch (error) {
            console.error('Error creating achievement:', error);
            res.status(500).json({
                success: false,
                message: 'पुरस्कार नोंदवताना त्रुटी'
            });
        }
    }
);

// Update Achievement
router.put('/update/:id', 
    authMiddleware,
    validateAchievement,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'कृपया सर्व माहिती योग्य रीतीने भरा',
                errors: errors.array()
            });
        }

        try {
            const { schoolId, userId, role } = req.user;
            const { id } = req.params;
            const { 
                studentId, 
                title, 
                description, 
                type, 
                date,
                level,
                position,
                certificate_url,
                remarks
            } = req.body;

            // Check if achievement exists and user has permission to edit
            const achievement = await db.get(
                `SELECT a.*, s.school_id 
                 FROM achievements a
                 JOIN students s ON a.student_id = s.id
                 WHERE a.id = ? AND s.school_id = ?`,
                [id, schoolId]
            );

            if (!achievement) {
                return res.status(404).json({
                    success: false,
                    message: 'पुरस्कार सापडला नाही'
                });
            }

            // Only creator or principal can edit
            if (achievement.awarded_by !== userId && role !== 'principal') {
                return res.status(403).json({
                    success: false,
                    message: 'पुरस्कार संपादित करण्याची परवानगी नाही'
                });
            }

            // Verify new student belongs to the school if changed
            if (studentId !== achievement.student_id) {
                const student = await db.get(
                    'SELECT id FROM students WHERE id = ? AND school_id = ? AND is_active = 1',
                    [studentId, schoolId]
                );

                if (!student) {
                    return res.status(404).json({
                        success: false,
                        message: 'नवीन विद्यार्थी सापडला नाही'
                    });
                }
            }

            // Update achievement
            await db.run(
                `UPDATE achievements 
                 SET student_id = ?, title = ?, description = ?, type = ?, 
                     date = ?, level = ?, position = ?, certificate_url = ?, 
                     remarks = ?, updated_at = datetime('now')
                 WHERE id = ?`,
                [
                    studentId, title, description, type, date, level || 'school',
                    position, certificate_url, remarks, id
                ]
            );

            res.json({
                success: true,
                message: 'पुरस्कार यशस्वीरित्या अद्यतनित केला'
            });

        } catch (error) {
            console.error('Error updating achievement:', error);
            res.status(500).json({
                success: false,
                message: 'पुरस्कार अद्यतनित करताना त्रुटी'
            });
        }
    }
);

// Delete Achievement
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const { schoolId, userId, role } = req.user;
        const { id } = req.params;

        // Check if achievement exists and user has permission to delete
        const achievement = await db.get(
            `SELECT a.*, s.school_id 
             FROM achievements a
             JOIN students s ON a.student_id = s.id
             WHERE a.id = ? AND s.school_id = ?`,
            [id, schoolId]
        );

        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: 'पुरस्कार सापडला नाही'
            });
        }

        // Only creator or principal can delete
        if (achievement.awarded_by !== userId && role !== 'principal') {
            return res.status(403).json({
                success: false,
                message: 'पुरस्कार काढण्याची परवानगी नाही'
            });
        }

        // Delete achievement
        await db.run(
            'DELETE FROM achievements WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'पुरस्कार यशस्वीरित्या काढला'
        });

    } catch (error) {
        console.error('Error deleting achievement:', error);
        res.status(500).json({
            success: false,
            message: 'पुरस्कार काढताना त्रुटी'
        });
    }
});

// Get Achievement Statistics
router.get('/stats/summary', authMiddleware, async (req, res) => {
    try {
        const { schoolId, role, userId } = req.user;

        let baseQuery = `FROM achievements a
                        JOIN students s ON a.student_id = s.id
                        WHERE s.school_id = ?`;
        let params = [schoolId];

        // For teachers, limit to their class students
        if (role === 'teacher') {
            const teacherInfo = await db.get(
                'SELECT class, section FROM users WHERE id = ?',
                [userId]
            );
            
            if (teacherInfo && teacherInfo.class) {
                baseQuery += ' AND s.class = ?';
                params.push(teacherInfo.class);
                
                if (teacherInfo.section) {
                    baseQuery += ' AND s.section = ?';
                    params.push(teacherInfo.section);
                }
            }
        }

        // Get overall statistics
        const stats = await db.get(
            `SELECT 
                COUNT(*) as total_achievements,
                COUNT(CASE WHEN a.type = 'academic' THEN 1 END) as academic_achievements,
                COUNT(CASE WHEN a.type = 'sports' THEN 1 END) as sports_achievements,
                COUNT(CASE WHEN a.type = 'cultural' THEN 1 END) as cultural_achievements,
                COUNT(CASE WHEN a.type = 'behavior' THEN 1 END) as behavior_achievements,
                COUNT(CASE WHEN a.level = 'national' THEN 1 END) as national_level,
                COUNT(CASE WHEN a.level = 'state' THEN 1 END) as state_level,
                COUNT(CASE WHEN a.level = 'district' THEN 1 END) as district_level,
                COUNT(CASE WHEN a.level = 'school' THEN 1 END) as school_level,
                COUNT(CASE WHEN DATE(a.date) >= DATE('now', '-30 days') THEN 1 END) as recent_achievements
             ${baseQuery}`,
            params
        );

        // Get top performing students
        const topStudents = await db.query(
            `SELECT 
                s.id, s.name, s.roll_number, s.class, s.section,
                COUNT(a.id) as achievement_count,
                GROUP_CONCAT(a.type) as achievement_types
             ${baseQuery}
             GROUP BY s.id, s.name, s.roll_number, s.class, s.section
             HAVING achievement_count > 0
             ORDER BY achievement_count DESC
             LIMIT 10`,
            params
        );

        // Get monthly distribution
        const monthlyStats = await db.query(
            `SELECT 
                strftime('%Y-%m', a.date) as month,
                COUNT(*) as count,
                COUNT(CASE WHEN a.type = 'academic' THEN 1 END) as academic_count,
                COUNT(CASE WHEN a.type = 'sports' THEN 1 END) as sports_count,
                COUNT(CASE WHEN a.type = 'cultural' THEN 1 END) as cultural_count
             ${baseQuery}
             AND a.date >= datetime('now', '-12 months')
             GROUP BY strftime('%Y-%m', a.date)
             ORDER BY month DESC`,
            params
        );

        // Get class-wise distribution
        const classStats = await db.query(
            `SELECT 
                s.class,
                COUNT(a.id) as achievement_count,
                COUNT(DISTINCT s.id) as students_with_achievements
             ${baseQuery}
             GROUP BY s.class
             ORDER BY s.class`,
            params
        );

        res.json({
            success: true,
            data: {
                overall: stats,
                top_students: topStudents,
                monthly_distribution: monthlyStats,
                class_distribution: classStats
            }
        });

    } catch (error) {
        console.error('Error getting achievement statistics:', error);
        res.status(500).json({
            success: false,
            message: 'पुरस्कार आकडेवारी मिळवताना त्रुटी'
        });
    }
});

// Get Student's Achievements
router.get('/student/:studentId', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { studentId } = req.params;

        // Verify student belongs to school
        const student = await db.get(
            'SELECT id, name, roll_number, class, section FROM students WHERE id = ? AND school_id = ? AND is_active = 1',
            [studentId, schoolId]
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'विद्यार्थी सापडला नाही'
            });
        }

        // Get all achievements for this student
        const achievements = await db.query(
            `SELECT 
                a.*, 
                u.name as awarded_by_name,
                u.role as awarded_by_role
             FROM achievements a
             LEFT JOIN users u ON a.awarded_by = u.id
             WHERE a.student_id = ?
             ORDER BY a.date DESC, a.created_at DESC`,
            [studentId]
        );

        // Get achievement summary
        const summary = await db.get(
            `SELECT 
                COUNT(*) as total_achievements,
                COUNT(CASE WHEN type = 'academic' THEN 1 END) as academic_count,
                COUNT(CASE WHEN type = 'sports' THEN 1 END) as sports_count,
                COUNT(CASE WHEN type = 'cultural' THEN 1 END) as cultural_count,
                COUNT(CASE WHEN type = 'behavior' THEN 1 END) as behavior_count,
                COUNT(CASE WHEN level = 'national' THEN 1 END) as national_count,
                COUNT(CASE WHEN level = 'state' THEN 1 END) as state_count,
                COUNT(CASE WHEN level = 'district' THEN 1 END) as district_count,
                COUNT(CASE WHEN level = 'school' THEN 1 END) as school_count
             FROM achievements 
             WHERE student_id = ?`,
            [studentId]
        );

        res.json({
            success: true,
            data: {
                student,
                achievements,
                summary
            }
        });

    } catch (error) {
        console.error('Error getting student achievements:', error);
        res.status(500).json({
            success: false,
            message: 'विद्यार्थी पुरस्कार मिळवताना त्रुटी'
        });
    }
});

module.exports = router;