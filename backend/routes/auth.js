const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const router = express.Router();
const db = require('../config/database-sqlite');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateRegistration = [
    body('schoolName').notEmpty().trim().withMessage('शाळेचे नाव आवश्यक आहे'),
    body('udiseNumber').matches(/^\d{12}$/).withMessage('UDISE क्रमांक 12 अंकी असावा'),
    body('address').notEmpty().trim().withMessage('पत्ता आवश्यक आहे'),
    body('pinCode').matches(/^\d{6}$/).withMessage('पिन कोड 6 अंकी असावा'),
    body('principalName').notEmpty().trim().withMessage('मुख्याध्यापकाचे नाव आवश्यक आहे'),
    body('principalMobile').matches(/^\d{10}$/).withMessage('मोबाईल नंबर 10 अंकी असावा'),
    body('phone').optional().matches(/^\d{10,11}$/).withMessage('दूरध्वनी क्रमांक अवैध आहे')
];

const validateLogin = [
    body('mobile').matches(/^\d{10}$/).withMessage('योग्य मोबाईल नंबर टाका'),
    body('password').notEmpty().withMessage('पासवर्ड आवश्यक आहे'),
    body('role').isIn(['principal', 'teacher']).withMessage('अवैध भूमिका')
];

// Register School
router.post('/register-school', validateRegistration, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'कृपया सर्व माहिती योग्य रीतीने भरा',
            errors: errors.array()
        });
    }

    try {
        const {
            schoolName,
            udiseNumber,
            address,
            pinCode,
            phone,
            principalName,
            principalMobile,
            principalEmail
        } = req.body;

        // Check if school already exists
        const existingSchool = await db.get(
            'SELECT id FROM schools WHERE udise_number = ? OR principal_mobile = ?',
            [udiseNumber, principalMobile]
        );

        if (existingSchool) {
            return res.status(400).json({
                success: false,
                message: 'ही शाळा किंवा मोबाईल नंबर आधीच नोंदणीकृत आहे'
            });
        }

        // Generate secure random password (mobile number as default)
        const defaultPassword = principalMobile;
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        // Insert school
        const schoolResult = await db.run(
            `INSERT INTO schools (
                name, udise_number, address, pin_code, phone, 
                principal_name, principal_mobile, principal_email,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                schoolName, udiseNumber, address, pinCode, phone || null,
                principalName, principalMobile, principalEmail || null
            ]
        );

        const schoolId = schoolResult.id;

        // Insert principal user
        await db.run(
            `INSERT INTO users (
                school_id, name, mobile, email, password, role, is_active,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, 'principal', 1, datetime('now'), datetime('now'))`,
            [schoolId, principalName, principalMobile, principalEmail || null, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: 'शाळा नोंदणी यशस्वी!',
            data: {
                school: {
                    id: schoolId,
                    name: schoolName,
                    udise: udiseNumber
                },
                credentials: {
                    mobile: principalMobile,
                    password: defaultPassword,
                    message: 'तुमचा पासवर्ड तुमचा मोबाईल नंबरच आहे. पहिल्या लॉगिन नंतर बदला'
                }
            }
        });

    } catch (error) {
        console.error('School registration error:', error);
        res.status(500).json({
            success: false,
            message: 'नोंदणी अयशस्वी: ' + error.message
        });
    }
});

// Login (Principal/Teacher)
router.post('/login', validateLogin, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'कृपया सर्व माहिती योग्य रीतीने भरा',
            errors: errors.array()
        });
    }

    try {
        const { mobile, password, role } = req.body;

        // Get user from database with school info
        const user = await db.get(
            `SELECT u.*, s.name as school_name, s.udise_number
             FROM users u 
             LEFT JOIN schools s ON u.school_id = s.id 
             WHERE u.mobile = ? AND u.role = ? AND u.is_active = 1`,
            [mobile, role]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'चुकीचे मोबाईल नंबर किंवा पासवर्ड'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'चुकीचे मोबाईल नंबर किंवा पासवर्ड'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id,
                schoolId: user.school_id,
                role: user.role 
            },
            process.env.JWT_SECRET || 'school_management_secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'लॉगिन यशस्वी',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    mobile: user.mobile,
                    email: user.email,
                    role: user.role,
                    class: user.class,
                    section: user.section,
                    school: {
                        id: user.school_id,
                        name: user.school_name,
                        udise: user.udise_number
                    }
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'लॉगिन अयशस्वी: ' + error.message
        });
    }
});

// Change Password
router.post('/change-password', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'प्रमाणीकरण आवश्यक आहे'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'school_management_secret_key');
        const { userId } = decoded;
        const { currentPassword, newPassword } = req.body;

        // Get current user
        const user = await db.get('SELECT password FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'वापरकर्ता सापडला नाही'
            });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'वर्तमान पासवर्ड चुकीचा आहे'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await db.run(
            'UPDATE users SET password = ?, updated_at = datetime("now") WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({
            success: true,
            message: 'पासवर्ड यशस्वीपणे बदलला गेला'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'पासवर्ड बदलताना त्रुटी'
        });
    }
});

// Verify User Token
router.get('/verify', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'टोकन आवश्यक आहे'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'school_management_secret_key');
        
        // Get user details
        const user = await db.get(
            `SELECT u.*, s.name as school_name 
             FROM users u 
             LEFT JOIN schools s ON u.school_id = s.id 
             WHERE u.id = ? AND u.is_active = 1`,
            [decoded.userId]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'अवैध टोकन'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role,
                    school: user.school_name
                }
            }
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'अवैध किंवा कालबाह्य टोकन'
        });
    }
});

module.exports = router;