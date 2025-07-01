const express = require('express');
const router = express.Router();
const db = require('../config/database-sqlite');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateStudent = [
    body('rollNumber').notEmpty().isInt({ min: 1 }).withMessage('हजेरी क्रमांक आवश्यक आहे'),
    body('name').notEmpty().trim().withMessage('विद्यार्थ्याचे नाव आवश्यक आहे'),
    body('motherName').notEmpty().trim().withMessage('आईचे नाव आवश्यक आहे'),
    body('birthDate').isISO8601().toDate().withMessage('जन्मतारीख आवश्यक आहे'),
    body('address').notEmpty().trim().withMessage('पत्ता आवश्यक आहे'),
    body('parentMobile').matches(/^\d{10}$/).withMessage('पालकांचा मोबाईल नंबर 10 अंकी असावा'),
    body('aadharNumber').optional().matches(/^\d{12}$/).withMessage('आधार नंबर 12 अंकी असावा')
];

// Get Students List
router.get('/list', authMiddleware, async (req, res) => {
    try {
        const { schoolId, role, userId } = req.user;
        const { class: className, section, search, page = 1, limit = 50 } = req.query;

        let query = `SELECT 
            s.id, s.roll_number, s.name, s.mother_name, s.father_name,
            s.birth_date, s.address, s.parent_mobile, s.aadhar_number, 
            s.student_id, s.class, s.section, s.is_active, s.created_at
         FROM students s
         WHERE s.school_id = ? AND s.is_active = 1`;
        
        let params = [schoolId];

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

        if (search) {
            query += ' AND (s.name LIKE ? OR s.student_id LIKE ? OR s.parent_mobile LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        query += ' ORDER BY s.class, s.section, s.roll_number';

        const students = await db.query(query, params);

        res.json({
            success: true,
            data: { students }
        });

    } catch (error) {
        console.error('Error getting students:', error);
        res.status(500).json({
            success: false,
            message: 'विद्यार्थी यादी मिळवताना त्रुटी'
        });
    }
});

// Get Student by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;

        const student = await db.get(
            `SELECT * FROM students WHERE id = ? AND school_id = ?`,
            [id, schoolId]
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'विद्यार्थी सापडला नाही'
            });
        }

        res.json({
            success: true,
            data: { student }
        });

    } catch (error) {
        console.error('Error getting student:', error);
        res.status(500).json({
            success: false,
            message: 'विद्यार्थी माहिती मिळवताना त्रुटी'
        });
    }
});

// Add Student
router.post('/add', 
    authMiddleware,
    validateStudent,
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
            const { 
                rollNumber, name, motherName, fatherName, birthDate, 
                address, parentMobile, aadharNumber, studentId
            } = req.body;
            const { schoolId, userId, role } = req.user;

            // Get teacher's class and section if teacher is adding
            let studentClass, studentSection;
            if (role === 'teacher') {
                const teacherInfo = await db.get(
                    'SELECT class, section FROM users WHERE id = ?',
                    [userId]
                );
                studentClass = teacherInfo.class;
                studentSection = teacherInfo.section;
            } else {
                // For principal, get from request body
                studentClass = req.body.class;
                studentSection = req.body.section;
            }

            // Check if roll number already exists in the same class
            const existingStudent = await db.get(
                'SELECT id FROM students WHERE school_id = ? AND class = ? AND roll_number = ? AND is_active = 1',
                [schoolId, studentClass, rollNumber]
            );

            if (existingStudent) {
                return res.status(400).json({
                    success: false,
                    message: 'या इयत्तेत हा हजेरी क्रमांक आधीच वापरला आहे'
                });
            }

            // Check if aadhar number already exists
            if (aadharNumber) {
                const existingAadhar = await db.get(
                    'SELECT id FROM students WHERE aadhar_number = ? AND is_active = 1',
                    [aadharNumber]
                );

                if (existingAadhar) {
                    return res.status(400).json({
                        success: false,
                        message: 'हा आधार नंबर आधीच नोंदणीकृत आहे'
                    });
                }
            }

            // Insert student
            const result = await db.run(
                `INSERT INTO students (
                    school_id, roll_number, name, mother_name, father_name,
                    date_of_birth, address, parent_mobile, aadhar_number, 
                    student_id, class, section, teacher_id,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [
                    schoolId, rollNumber, name, motherName, fatherName || null,
                    birthDate, address, parentMobile, aadharNumber || null,
                    studentId || null, studentClass, studentSection || null,
                    role === 'teacher' ? userId : null
                ]
            );

            res.status(201).json({
                success: true,
                message: 'विद्यार्थी यशस्वीरित्या जोडला गेला',
                data: {
                    id: result.id,
                    rollNumber,
                    name,
                    class: studentClass,
                    section: studentSection
                }
            });

        } catch (error) {
            console.error('Error adding student:', error);
            res.status(500).json({
                success: false,
                message: 'विद्यार्थी जोडताना त्रुटी झाली'
            });
        }
    }
);

// Update Student
router.put('/update/:id', authMiddleware, async (req, res) => {
    try {
        const { 
            name, motherName, fatherName, birthDate,
            address, parentMobile, aadharNumber, studentId
        } = req.body;
        const { schoolId } = req.user;
        const studentDbId = req.params.id;

        // Verify student belongs to school
        const student = await db.get(
            'SELECT id FROM students WHERE id = ? AND school_id = ?',
            [studentDbId, schoolId]
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'विद्यार्थी सापडला नाही'
            });
        }

        // Validation
        if (parentMobile && !/^\d{10}$/.test(parentMobile)) {
            return res.status(400).json({
                success: false,
                message: 'कृपया योग्य 10 अंकी मोबाईल नंबर टाका'
            });
        }

        if (aadharNumber && !/^\d{12}$/.test(aadharNumber)) {
            return res.status(400).json({
                success: false,
                message: 'आधार नंबर 12 अंकी असावा'
            });
        }

        await db.run(
            `UPDATE students 
             SET name = ?, mother_name = ?, father_name = ?, date_of_birth = ?,
                 address = ?, parent_mobile = ?, aadhar_number = ?, student_id = ?,
                 updated_at = datetime('now')
             WHERE id = ? AND school_id = ?`,
            [
                name, motherName, fatherName || null, birthDate,
                address, parentMobile, aadharNumber || null, studentId || null,
                studentDbId, schoolId
            ]
        );

        res.json({
            success: true,
            message: 'विद्यार्थी माहिती यशस्वीरित्या अद्यतनित केली'
        });

    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            message: 'विद्यार्थी अद्यतनित करताना त्रुटी'
        });
    }
});

// Delete Student (Soft Delete)
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const { schoolId, role } = req.user;
        const studentId = req.params.id;

        // Only principals can delete students
        if (role !== 'principal') {
            return res.status(403).json({
                success: false,
                message: 'फक्त मुख्याध्यापक विद्यार्थी काढू शकतात'
            });
        }

        // Verify student belongs to school
        const student = await db.get(
            'SELECT id FROM students WHERE id = ? AND school_id = ?',
            [studentId, schoolId]
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'विद्यार्थी सापडला नाही'
            });
        }

        // Soft delete
        await db.run(
            `UPDATE students 
             SET is_active = 0, updated_at = datetime('now')
             WHERE id = ? AND school_id = ?`,
            [studentId, schoolId]
        );

        res.json({
            success: true,
            message: 'विद्यार्थी यशस्वीरित्या काढला गेला'
        });

    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            message: 'विद्यार्थी काढताना त्रुटी'
        });
    }
});

// Bulk Import Students
router.post('/bulk-import', authMiddleware, async (req, res) => {
    try {
        const { students } = req.body;
        const { schoolId, userId, role } = req.user;

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'विद्यार्थ्यांची यादी आवश्यक आहे'
            });
        }

        const imported = [];
        const errors = [];

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            
            try {
                // Validate required fields
                if (!student.rollNumber || !student.name || !student.motherName || 
                    !student.class || !student.parentMobile) {
                    errors.push({
                        row: i + 1,
                        name: student.name,
                        error: 'आवश्यक माहिती गहाळ आहे'
                    });
                    continue;
                }

                // Check if roll number exists
                const existing = await db.get(
                    'SELECT id FROM students WHERE school_id = ? AND class = ? AND roll_number = ? AND is_active = 1',
                    [schoolId, student.class, student.rollNumber]
                );

                if (existing) {
                    errors.push({
                        row: i + 1,
                        name: student.name,
                        error: 'हजेरी क्रमांक आधीच वापरला आहे'
                    });
                    continue;
                }

                // Insert student
                const result = await db.run(
                    `INSERT INTO students (
                        school_id, roll_number, name, mother_name, father_name,
                        date_of_birth, address, parent_mobile, class, section,
                        teacher_id, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                    [
                        schoolId, student.rollNumber, student.name, student.motherName,
                        student.fatherName || null, student.birthDate || null,
                        student.address || '', student.parentMobile, 
                        student.class, student.section || null,
                        role === 'teacher' ? userId : null
                    ]
                );

                imported.push({
                    row: i + 1,
                    name: student.name,
                    id: result.id
                });

            } catch (error) {
                errors.push({
                    row: i + 1,
                    name: student.name,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `${imported.length} विद्यार्थी यशस्वीरित्या जोडले गेले`,
            data: {
                imported,
                errors,
                total: students.length,
                successful: imported.length,
                failed: errors.length
            }
        });

    } catch (error) {
        console.error('Error in bulk import:', error);
        res.status(500).json({
            success: false,
            message: 'विद्यार्थी आयात करताना त्रुटी'
        });
    }
});

module.exports = router;