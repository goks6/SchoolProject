const jwt = require('jsonwebtoken');
const db = require('../database-sqlite');

// Verify JWT Token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'प्रमाणीकरण टोकन आवश्यक आहे'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'school_management_secret_key');
        
        // Get user from database
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

        // Add user info to request
        req.user = {
            id: user.id,
            name: user.name,
            mobile: user.mobile,
            email: user.email,
            role: user.role,
            schoolId: user.school_id,
            schoolName: user.school_name,
            class: user.class,
            section: user.section
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(403).json({
            success: false,
            message: 'अवैध किंवा कालबाह्य टोकन'
        });
    }
};

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'प्रमाणीकरण आवश्यक आहे'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'या कार्यासाठी परवानगी नाही'
            });
        }

        next();
    };
};

// Principal only access
const principalOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'principal') {
        return res.status(403).json({
            success: false,
            message: 'फक्त मुख्याध्यापकांना परवानगी आहे'
        });
    }
    next();
};

// Teacher or Principal access
const teacherOrPrincipal = (req, res, next) => {
    if (!req.user || !['teacher', 'principal'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'शिक्षक किंवा मुख्याध्यापक परवानगी आवश्यक'
        });
    }
    next();
};

// Same school access (user can only access data from their school)
const sameSchoolOnly = (req, res, next) => {
    // This middleware ensures users can only access data from their own school
    // The actual school checking will be done in route handlers using req.user.schoolId
    next();
};

module.exports = {
    authenticateToken,
    authorize,
    principalOnly,
    teacherOrPrincipal,
    sameSchoolOnly
};