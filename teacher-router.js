const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Add Teacher
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { name, mobile, class: className, section } = req.body;
        const { schoolId, role } = req.user;

        // Only principals can add teachers
        if (role !== 'principal') {
            return res.status(403).json({
                success: false,
                message: 'फक्त मुख्याध्यापकच शिक्षक जोडू शकतात'
            });
        }

        // Validation
        if (!name || !mobile) {
            return res.status(400).json({
                success: false,
                message: 'नाव आणि मोबाईल नंबर आवश्यक आहे'
            });
        }

        // Mobile number validation
        if (!/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: 'कृपया योग्य 10 अंकी मोबाईल नंबर टाका'
            });
        }

        // Check if mobile number already exists
        const [existingUser] = await db.execute(
            'SELECT id FROM users WHERE mobile = ?',
            [mobile]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'हा मोबाईल नंबर आधीच वापरला आहे'
            });
        }

        // Hash password (mobile number as default password)
        const hashedPassword = await bcrypt.hash(mobile, 12);

        // Insert teacher
        const [result] = await db.execute(
            `INSERT INTO users (school_id, name, mobile, password, role, class, section) 
             VALUES (?, ?, ?, ?, 'teacher', ?, ?)`,
            [schoolId, name, mobile, hashedPassword, className || null, section || null]
        );

        // Create class if specified and doesn't exist
        if (className && section) {
            const currentYear = new Date().getFullYear();
            const academicYear = `${currentYear}-${(currentYear + 1).toString().slice(2)}`;
            
            await db.execute(
                `INSERT IGNORE INTO classes (school_id, class_name, section, teacher_id, academic_year) 
                 VALUES (?, ?, ?, ?, ?)`,
                [schoolId, className, section, result.insertId, academicYear]
            );
        }

        res.json({
            success: true,
            message: 'शिक्षक यशस्वीरित्या जोडला गेला',
            teacher: {
                id: result.insertId,
                name,
                mobile,
                class: className,
                section
            }
        });

    } catch (error) {
        console.error('Error adding teacher:', error);
        res.status(500).json({
            success: false,
            message: 'शिक्षक जोडताना त्रुटी झाली'
        });
    }
});

// Get Teachers List
router.get('/list', authMiddleware, async (req, res) => {
    try {
        const { schoolId, role } = req.user;

        // Only principals can view all teachers
        if (role !== 'principal') {
            return res.status(403).json({
                success: false,
                message: 'अनधिकृत प्रवेश'
            });
        }

        const [teachers] = await db.execute(
            `SELECT id, name, mobile, class, section, is_active, created_at 
             FROM users 
             WHERE school_id = ? AND role = 'teacher' 
             ORDER BY name`,
            [schoolId]
        );

        res.json({
            success: true,
            teachers
        });

    } catch (error) {
        console.error('Error getting teachers:', error);
        res.status(500).json({
            success: false,
            message: 'शिक्षक यादी मिळवताना त्रुटी'
        });
    }
});

// Get Teacher Count
router.get('/count', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;

        const [result] = await db.execute(
            `SELECT COUNT(*) as count 
             FROM users 
             WHERE school_id = ? AND role = 'teacher' AND is_active = 1`,
            [schoolId]
        );

        res.json({
            success: true,
            count: result[0].count
        });

    } catch (error) {
        console.error('Error getting teacher count:', error);
        res.status(500).json({
            success: false,
            count: 0
        });
    }
});

// Update Teacher
router.put('/update/:id', authMiddleware, async (req, res) => {
    try {
        const { name, mobile, class: className, section } = req.body;
        const { schoolId, role } = req.user;
        const teacherId = req.params.id;

        if (role !== 'principal') {
            return res.status(403).json({
                success: false,
                message: 'फक्त मुख्याध्यापकच शिक्षक संपादित करू शकतात'
            });
        }

        // Mobile validation if changed
        if (mobile && !/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: 'कृपया योग्य 10 अंकी मोबाईल नंबर टाका'
            });
        }

        // Check if mobile exists for other users
        if (mobile) {
            const [existingUser] = await db.execute(
                'SELECT id FROM users WHERE mobile = ? AND id != ?',
                [mobile, teacherId]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'हा मोबाईल नंबर आधीच वापरला आहे'
                });
            }
        }

        await db.execute(
            `UPDATE users 
             SET name = ?, mobile = ?, class = ?, section = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND school_id = ? AND role = 'teacher'`,
            [name, mobile, className || null, section || null, teacherId, schoolId]
        );

        res.json({
            success: true,
            message: 'शिक्षक माहिती अपडेट झाली'
        });

    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({
            success: false,
            message: 'शिक्षक अपडेट करताना त्रुटी'
        });
    }
});

// Delete Teacher
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const { schoolId, role } = req.user;
        const teacherId = req.params.id;

        if (role !== 'principal') {
            return res.status(403).json({
                success: false,
                message: 'फक्त मुख्याध्यापकच शिक्षक काढू शकतात'
            });
        }

        // Soft delete (set is_active = false)
        await db.execute(
            `UPDATE users 
             SET is_active = 0, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND school_id = ? AND role = 'teacher'`,
            [teacherId, schoolId]
        );

        res.json({
            success: true,
            message: 'शिक्षक यशस्वीरित्या काढला गेला'
        });

    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({
            success: false,
            message: 'शिक्षक काढताना त्रुटी'
        });
    }
});

// Reset Teacher Password
router.post('/reset-password/:id', authMiddleware, async (req, res) => {
    try {
        const { schoolId, role } = req.user;
        const teacherId = req.params.id;

        if (role !== 'principal') {
            return res.status(403).json({
                success: false,
                message: 'फक्त मुख्याध्यापकच पासवर्ड रिसेट करू शकतात'
            });
        }

        // Get teacher's mobile number
        const [teacher] = await db.execute(
            'SELECT mobile FROM users WHERE id = ? AND school_id = ? AND role = "teacher"',
            [teacherId, schoolId]
        );

        if (teacher.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'शिक्षक सापडला नाही'
            });
        }

        // Reset password to mobile number
        const hashedPassword = await bcrypt.hash(teacher[0].mobile, 12);
        
        await db.execute(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, teacherId]
        );

        res.json({
            success: true,
            message: 'पासवर्ड रिसेट झाला (मोबाईल नंबर)'
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            success: false,
            message: 'पासवर्ड रिसेट करताना त्रुटी'
        });
    }
});

module.exports = router;