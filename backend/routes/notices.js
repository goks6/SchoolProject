const express = require('express');
const router = express.Router();
const db = require('../config/database-sqlite');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateNotice = [
    body('title').notEmpty().trim().withMessage('सूचनेचे शीर्षक आवश्यक आहे'),
    body('message').notEmpty().trim().withMessage('सूचना संदेश आवश्यक आहे'),
    body('type').isIn(['general', 'urgent', 'event', 'holiday']).withMessage('अवैध सूचना प्रकार'),
    body('targetAudience').optional().isIn(['all', 'teachers', 'parents', 'students']).withMessage('अवैध लक्ष्य गट')
];

// Get All Notices
router.get('/list', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { 
            type, 
            page = 1, 
            limit = 20,
            startDate,
            endDate,
            search
        } = req.query;

        let query = `SELECT 
            n.*, u.name as author_name
         FROM notices n
         LEFT JOIN users u ON n.author_id = u.id
         WHERE n.school_id = ?`;
        
        let params = [schoolId];

        // Apply filters
        if (type && type !== 'all') {
            query += ' AND n.type = ?';
            params.push(type);
        }

        if (startDate) {
            query += ' AND DATE(n.created_at) >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND DATE(n.created_at) <= ?';
            params.push(endDate);
        }

        if (search) {
            query += ' AND (n.title LIKE ? OR n.message LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern);
        }

        query += ' ORDER BY n.created_at DESC';

        // Add pagination
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const notices = await db.query(query, params);

        // Get total count for pagination
        let countQuery = `SELECT COUNT(*) as total FROM notices n WHERE n.school_id = ?`;
        let countParams = [schoolId];

        if (type && type !== 'all') {
            countQuery += ' AND n.type = ?';
            countParams.push(type);
        }

        if (startDate) {
            countQuery += ' AND DATE(n.created_at) >= ?';
            countParams.push(startDate);
        }

        if (endDate) {
            countQuery += ' AND DATE(n.created_at) <= ?';
            countParams.push(endDate);
        }

        if (search) {
            countQuery += ' AND (n.title LIKE ? OR n.message LIKE ?)';
            const searchPattern = `%${search}%`;
            countParams.push(searchPattern, searchPattern);
        }

        const totalResult = await db.get(countQuery, countParams);
        const total = totalResult.total;

        res.json({
            success: true,
            data: {
                notices,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(total / limit),
                    total_records: total,
                    per_page: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error getting notices:', error);
        res.status(500).json({
            success: false,
            message: 'सूचना मिळवताना त्रुटी'
        });
    }
});

// Get Notice by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;

        const notice = await db.get(
            `SELECT n.*, u.name as author_name, u.role as author_role
             FROM notices n
             LEFT JOIN users u ON n.author_id = u.id
             WHERE n.id = ? AND n.school_id = ?`,
            [id, schoolId]
        );

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'सूचना सापडली नाही'
            });
        }

        res.json({
            success: true,
            data: { notice }
        });

    } catch (error) {
        console.error('Error getting notice:', error);
        res.status(500).json({
            success: false,
            message: 'सूचना मिळवताना त्रुटी'
        });
    }
});

// Create New Notice
router.post('/create', 
    authMiddleware,
    validateNotice,
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
                title, 
                message, 
                type, 
                targetAudience = 'all',
                priority = 'medium',
                expiryDate,
                attachments
            } = req.body;

            // Insert notice
            const result = await db.run(
                `INSERT INTO notices (
                    school_id, author_id, title, message, type, 
                    target_audience, priority, expiry_date, attachments,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [
                    schoolId, userId, title, message, type,
                    targetAudience, priority, expiryDate || null,
                    attachments ? JSON.stringify(attachments) : null
                ]
            );

            // Get the created notice with author details
            const createdNotice = await db.get(
                `SELECT n.*, u.name as author_name
                 FROM notices n
                 LEFT JOIN users u ON n.author_id = u.id
                 WHERE n.id = ?`,
                [result.id]
            );

            res.status(201).json({
                success: true,
                message: 'सूचना यशस्वीरित्या तयार केली',
                data: { notice: createdNotice }
            });

        } catch (error) {
            console.error('Error creating notice:', error);
            res.status(500).json({
                success: false,
                message: 'सूचना तयार करताना त्रुटी'
            });
        }
    }
);

// Update Notice
router.put('/update/:id', 
    authMiddleware,
    validateNotice,
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
                title, 
                message, 
                type, 
                targetAudience,
                priority,
                expiryDate,
                attachments
            } = req.body;

            // Check if notice exists and user has permission to edit
            const notice = await db.get(
                'SELECT * FROM notices WHERE id = ? AND school_id = ?',
                [id, schoolId]
            );

            if (!notice) {
                return res.status(404).json({
                    success: false,
                    message: 'सूचना सापडली नाही'
                });
            }

            // Only author or principal can edit
            if (notice.author_id !== userId && role !== 'principal') {
                return res.status(403).json({
                    success: false,
                    message: 'सूचना संपादित करण्याची परवानगी नाही'
                });
            }

            // Update notice
            await db.run(
                `UPDATE notices 
                 SET title = ?, message = ?, type = ?, target_audience = ?,
                     priority = ?, expiry_date = ?, attachments = ?,
                     updated_at = datetime('now')
                 WHERE id = ? AND school_id = ?`,
                [
                    title, message, type, targetAudience || 'all',
                    priority || 'medium', expiryDate || null,
                    attachments ? JSON.stringify(attachments) : null,
                    id, schoolId
                ]
            );

            res.json({
                success: true,
                message: 'सूचना यशस्वीरित्या अद्यतनित केली'
            });

        } catch (error) {
            console.error('Error updating notice:', error);
            res.status(500).json({
                success: false,
                message: 'सूचना अद्यतनित करताना त्रुटी'
            });
        }
    }
);

// Delete Notice
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const { schoolId, userId, role } = req.user;
        const { id } = req.params;

        // Check if notice exists and user has permission to delete
        const notice = await db.get(
            'SELECT * FROM notices WHERE id = ? AND school_id = ?',
            [id, schoolId]
        );

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'सूचना सापडली नाही'
            });
        }

        // Only author or principal can delete
        if (notice.author_id !== userId && role !== 'principal') {
            return res.status(403).json({
                success: false,
                message: 'सूचना काढण्याची परवानगी नाही'
            });
        }

        // Delete notice
        await db.run(
            'DELETE FROM notices WHERE id = ? AND school_id = ?',
            [id, schoolId]
        );

        res.json({
            success: true,
            message: 'सूचना यशस्वीरित्या काढली'
        });

    } catch (error) {
        console.error('Error deleting notice:', error);
        res.status(500).json({
            success: false,
            message: 'सूचना काढताना त्रुटी'
        });
    }
});

// Get Notice Statistics
router.get('/stats/summary', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;

        // Get overall statistics
        const stats = await db.get(
            `SELECT 
                COUNT(*) as total_notices,
                COUNT(CASE WHEN type = 'general' THEN 1 END) as general_notices,
                COUNT(CASE WHEN type = 'urgent' THEN 1 END) as urgent_notices,
                COUNT(CASE WHEN type = 'event' THEN 1 END) as event_notices,
                COUNT(CASE WHEN type = 'holiday' THEN 1 END) as holiday_notices,
                COUNT(CASE WHEN DATE(created_at) = DATE('now') THEN 1 END) as today_notices,
                COUNT(CASE WHEN DATE(created_at) >= DATE('now', '-7 days') THEN 1 END) as week_notices
             FROM notices 
             WHERE school_id = ?`,
            [schoolId]
        );

        // Get monthly distribution
        const monthlyStats = await db.query(
            `SELECT 
                strftime('%Y-%m', created_at) as month,
                COUNT(*) as count,
                COUNT(CASE WHEN type = 'urgent' THEN 1 END) as urgent_count
             FROM notices 
             WHERE school_id = ? 
             AND created_at >= datetime('now', '-12 months')
             GROUP BY strftime('%Y-%m', created_at)
             ORDER BY month DESC`,
            [schoolId]
        );

        // Get recent notices
        const recentNotices = await db.query(
            `SELECT n.id, n.title, n.type, n.created_at, u.name as author_name
             FROM notices n
             LEFT JOIN users u ON n.author_id = u.id
             WHERE n.school_id = ?
             ORDER BY n.created_at DESC
             LIMIT 5`,
            [schoolId]
        );

        res.json({
            success: true,
            data: {
                overall: stats,
                monthly_distribution: monthlyStats,
                recent_notices: recentNotices
            }
        });

    } catch (error) {
        console.error('Error getting notice statistics:', error);
        res.status(500).json({
            success: false,
            message: 'सूचना आकडेवारी मिळवताना त्रुटी'
        });
    }
});

// Mark Notice as Read
router.post('/:id/mark-read', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const { id } = req.params;

        // Insert or update read status
        await db.run(
            `INSERT OR REPLACE INTO notice_reads (notice_id, user_id, read_at)
             VALUES (?, ?, datetime('now'))`,
            [id, userId]
        );

        res.json({
            success: true,
            message: 'सूचना वाचली म्हणून चिन्हांकित केली'
        });

    } catch (error) {
        console.error('Error marking notice as read:', error);
        res.status(500).json({
            success: false,
            message: 'सूचना चिन्हांकित करताना त्रुटी'
        });
    }
});

// Get Unread Notices Count
router.get('/unread/count', authMiddleware, async (req, res) => {
    try {
        const { schoolId, userId } = req.user;

        const result = await db.get(
            `SELECT COUNT(*) as unread_count
             FROM notices n
             LEFT JOIN notice_reads nr ON n.id = nr.notice_id AND nr.user_id = ?
             WHERE n.school_id = ? 
             AND nr.notice_id IS NULL
             AND (n.expiry_date IS NULL OR DATE(n.expiry_date) >= DATE('now'))`,
            [userId, schoolId]
        );

        res.json({
            success: true,
            data: {
                unread_count: result.unread_count || 0
            }
        });

    } catch (error) {
        console.error('Error getting unread notices count:', error);
        res.status(500).json({
            success: false,
            message: 'न वाचलेल्या सूचना मोजताना त्रुटी'
        });
    }
});

module.exports = router;