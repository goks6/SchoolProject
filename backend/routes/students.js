const express = require('express');
const router = express.Router();
const db = require('../config/database-sqlite');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Enhanced validation middleware
const validateStudent = [
    body('rollNumber').notEmpty().isInt({ min: 1 }).withMessage('हजेरी क्रमांक आवश्यक आहे'),
    body('name').notEmpty().trim().withMessage('विद्यार्थ्याचे नाव आवश्यक आहे'),
    body('motherName').notEmpty().trim().withMessage('आईचे नाव आवश्यक आहे'),
    body('birthDate').optional().isISO8601().toDate().withMessage('योग्य जन्मतारीख टाका'),
    body('address').optional().trim(),
    body('parentMobile').matches(/^\d{10}$/).withMessage('पालकांचा मोबाईल नंबर 10 अंकी असावा'),
    body('aadharNumber').optional().matches(/^\d{12}$/).withMessage('आधार नंबर 12 अंकी असावा'),
    body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('योग्य रक्तगट निवडा'),
    body('emergencyContact').optional().matches(/^\d{10}$/).withMessage('आपत्कालीन संपर्क 10 अंकी असावा')
];

// Get Students List with Enhanced Filtering
router.get('/list', authMiddleware, async (req, res) => {
    try {
        const { schoolId, role, userId } = req.user;
        const { 
            class: className, 
            section, 
            search, 
            page = 1, 
            limit = 50,
            sortBy = 'rollNumber',
            sortOrder = 'ASC',
            bloodGroup,
            gender
        } = req.query;

        let query = `SELECT 
            s.id, s.roll_number, s.name, s.mother_name, s.father_name,
            s.date_of_birth, s.address, s.parent_mobile, s.aadhar_number, 
            s.student_id, s.class, s.section, s.is_active, s.created_at,
            s.blood_group, s.emergency_contact, s.gender
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

        // Apply filters
        if (className) {
            query += ' AND s.class = ?';
            params.push(className);
        }

        if (section) {
            query += ' AND s.section = ?';
            params.push(section);
        }

        if (bloodGroup) {
            query += ' AND s.blood_group = ?';
            params.push(bloodGroup);
        }

        if (gender) {
            query += ' AND s.gender = ?';
            params.push(gender);
        }

        if (search) {
            query += ' AND (s.name LIKE ? OR s.student_id LIKE ? OR s.parent_mobile LIKE ? OR s.mother_name LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }

        // Add sorting
        const validSortFields = ['rollNumber', 'name', 'class', 'section', 'created_at'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'roll_number';
        const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        
        if (sortField === 'rollNumber') {
            query += ` ORDER BY s.roll_number ${order}`;
        } else if (sortField === 'name') {
            query += ` ORDER BY s.name ${order}`;
        } else {
            query += ` ORDER BY s.${sortField} ${order}`;
        }

        const students = await db.query(query, params);

        // Get statistics
        const stats = await db.get(
            `SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN gender = 'male' THEN 1 END) as male_count,
                COUNT(CASE WHEN gender = 'female' THEN 1 END) as female_count,
                COUNT(CASE WHEN blood_group IS NOT NULL THEN 1 END) as blood_group_count
             FROM students WHERE school_id = ? AND is_active = 1`,
            [schoolId]
        );

        res.json({
            success: true,
            data: { 
                students,
                statistics: {
                    total: stats.total || 0,
                    male: stats.male_count || 0,
                    female: stats.female_count || 0,
                    bloodGroupRecords: stats.blood_group_count || 0
                }
            }
        });

    } catch (error) {
        console.error('Error getting students:', error);
        res.status(500).json({
            success: false,
            message: 'विद्यार्थी यादी मिळवताना त्रुटी'
        });
    }
});

// Get Student by ID with Enhanced Details
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;

        const student = await db.get(
            `SELECT s.*, u.name as teacher_name
             FROM students s
             LEFT JOIN users u ON s.teacher_id = u.id
             WHERE s.id = ? AND s.school_id = ?`,
            [id, schoolId]
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'विद्यार्थी सापडला नाही'
            });
        }

        // Get attendance summary for last 30 days
        const attendanceSummary = await db.get(
            `SELECT 
                COUNT(*) as total_days,
                COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
                COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
                COUNT(CASE WHEN status = 'late' THEN 1 END) as late_days
             FROM attendance 
             WHERE student_id = ? AND date >= date('now', '-30 days')`,
            [id]
        );

        // Get recent achievements
        const achievements = await db.query(
            `SELECT * FROM achievements 
             WHERE student_id = ? 
             ORDER BY date DESC LIMIT 5`,
            [id]
        );

        res.json({
            success: true,
            data: {
                student,
                attendance_summary: attendanceSummary || {
                    total_days: 0,
                    present_days: 0,
                    absent_days: 0,
                    late_days: 0
                },
                achievements: achievements || []
            }
        });

    } catch (error) {
        console.error('Error getting student:', error);
        res.status(500).json({
            success: false,
            message: 'विद्यार्थी माहिती मिळवताना त्रुटी'
        });
    }
});

// Add Student with Enhanced Fields
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
                address, parentMobile, aadharNumber, studentId,
                bloodGroup, emergencyContact, gender
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

            // Generate student ID if not provided
            const generatedStudentId = studentId || `STU${Date.now()}`;

            // Insert student with enhanced fields
            const result = await db.run(
                `INSERT INTO students (
                    school_id, roll_number, name, mother_name, father_name,
                    date_of_birth, address, parent_mobile, aadhar_number, 
                    student_id, class, section, teacher_id, blood_group,
                    emergency_contact, gender, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [
                    schoolId, rollNumber, name, motherName, fatherName || null,
                    birthDate, address, parentMobile, aadharNumber || null,
                    generatedStudentId, studentClass, studentSection || null,
                    role === 'teacher' ? userId : null, bloodGroup || null,
                    emergencyContact || null, gender || 'other'
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
                    section: studentSection,
                    studentId: generatedStudentId
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

// Update Student with Enhanced Fields
router.put('/update/:id', authMiddleware, async (req, res) => {
    try {
        const { 
            name, motherName, fatherName, birthDate,
            address, parentMobile, aadharNumber, studentId,
            bloodGroup, emergencyContact, gender
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

        if (emergencyContact && !/^\d{10}$/.test(emergencyContact)) {
            return res.status(400).json({
                success: false,
                message: 'आपत्कालीन संपर्क 10 अंकी असावा'
            });
        }

        await db.run(
            `UPDATE students 
             SET name = ?, mother_name = ?, father_name = ?, date_of_birth = ?,
                 address = ?, parent_mobile = ?, aadhar_number = ?, student_id = ?,
                 blood_group = ?, emergency_contact = ?, gender = ?,
                 updated_at = datetime('now')
             WHERE id = ? AND school_id = ?`,
            [
                name, motherName, fatherName || null, birthDate,
                address, parentMobile, aadharNumber || null, studentId || null,
                bloodGroup || null, emergencyContact || null, gender || 'other',
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

// Get Student Statistics
router.get('/stats/summary', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;

        const stats = await db.get(
            `SELECT 
                COUNT(*) as total_students,
                COUNT(CASE WHEN gender = 'male' THEN 1 END) as male_students,
                COUNT(CASE WHEN gender = 'female' THEN 1 END) as female_students,
                COUNT(DISTINCT class) as total_classes,
                COUNT(CASE WHEN blood_group IS NOT NULL THEN 1 END) as students_with_blood_group,
                COUNT(CASE WHEN emergency_contact IS NOT NULL THEN 1 END) as students_with_emergency_contact
             FROM students 
             WHERE school_id = ? AND is_active = 1`,
            [schoolId]
        );

        // Get class-wise distribution
        const classDistribution = await db.query(
            `SELECT 
                class,
                COUNT(*) as student_count,
                COUNT(CASE WHEN gender = 'male' THEN 1 END) as male_count,
                COUNT(CASE WHEN gender = 'female' THEN 1 END) as female_count
             FROM students 
             WHERE school_id = ? AND is_active = 1
             GROUP BY class
             ORDER BY class`,
            [schoolId]
        );

        // Get blood group distribution
        const bloodGroupDistribution = await db.query(
            `SELECT 
                blood_group,
                COUNT(*) as count
             FROM students 
             WHERE school_id = ? AND is_active = 1 AND blood_group IS NOT NULL
             GROUP BY blood_group
             ORDER BY count DESC`,
            [schoolId]
        );

        res.json({
            success: true,
            data: {
                overall: stats,
                class_distribution: classDistribution,
                blood_group_distribution: bloodGroupDistribution
            }
        });

    } catch (error) {
        console.error('Error getting student statistics:', error);
        res.status(500).json({
            success: false,
            message: 'आकडेवारी मिळवताना त्रुटी'
        });
    }
});

// Bulk Import Students with Enhanced Validation
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
                // Enhanced validation
                if (!student.rollNumber || !student.name || !student.motherName || 
                    !student.class || !student.parentMobile) {
                    errors.push({
                        row: i + 1,
                        name: student.name || 'अज्ञात',
                        error: 'आवश्यक माहिती गहाळ आहे'
                    });
                    continue;
                }

                // Validate mobile number
                if (!/^\d{10}$/.test(student.parentMobile)) {
                    errors.push({
                        row: i + 1,
                        name: student.name,
                        error: 'अवैध मोबाईल नंबर'
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

                // Generate student ID
                const generatedStudentId = student.studentId || `STU${Date.now()}_${i}`;

                // Insert student
                const result = await db.run(
                    `INSERT INTO students (
                        school_id, roll_number, name, mother_name, father_name,
                        date_of_birth, address, parent_mobile, class, section,
                        teacher_id, student_id, blood_group, emergency_contact, gender,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                    [
                        schoolId, student.rollNumber, student.name, student.motherName,
                        student.fatherName || null, student.birthDate || null,
                        student.address || '', student.parentMobile, 
                        student.class, student.section || null,
                        role === 'teacher' ? userId : null, generatedStudentId,
                        student.bloodGroup || null, student.emergencyContact || null,
                        student.gender || 'other'
                    ]
                );

                imported.push({
                    row: i + 1,
                    name: student.name,
                    id: result.id,
                    studentId: generatedStudentId
                });

            } catch (error) {
                errors.push({
                    row: i + 1,
                    name: student.name || 'अज्ञात',
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

// Export Students Data
router.get('/export/csv', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { class: className, section } = req.query;

        let query = `SELECT 
            roll_number, name, mother_name, father_name, date_of_birth,
            address, parent_mobile, aadhar_number, student_id, class, section,
            blood_group, emergency_contact, gender, created_at
         FROM students 
         WHERE school_id = ? AND is_active = 1`;
        
        let params = [schoolId];

        if (className) {
            query += ' AND class = ?';
            params.push(className);
        }

        if (section) {
            query += ' AND section = ?';
            params.push(section);
        }

        query += ' ORDER BY class, section, roll_number';

        const students = await db.query(query, params);

        res.json({
            success: true,
            data: {
                students,
                export_date: new Date().toISOString(),
                total_records: students.length
            }
        });

    } catch (error) {
        console.error('Error exporting students:', error);
        res.status(500).json({
            success: false,
            message: 'डेटा निर्यात करताना त्रुटी'
        });
    }
});

module.exports = router;