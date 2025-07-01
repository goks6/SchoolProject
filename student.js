const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateStudent = [
    body('roll_number').notEmpty().isInt({ min: 1 }).withMessage('हजेरी क्रमांक आवश्यक आहे'),
    body('name').notEmpty().trim().withMessage('विद्यार्थ्याचे नाव आवश्यक आहे'),
    body('mother_name').notEmpty().trim().withMessage('आईचे नाव आवश्यक आहे'),
    body('birth_date').isISO8601().toDate().withMessage('जन्मतारीख आवश्यक आहे'),
    body('address').notEmpty().trim().withMessage('पत्ता आवश्यक आहे'),
    body('parent_mobile').matches(/^\d{10}$/).withMessage('पालकांचा मोबाईल नंबर 10 अंकी असावा'),
    body('aadhar_number').optional().matches(/^\d{12}$/).withMessage('आधार नंबर 12 अंकी असावा'),
    body('class').notEmpty().withMessage('इयत्ता आवश्यक आहे'),
    body('section').optional().notEmpty().withMessage('तुकडी निवडा')
];

// Get Student Count
router.get('/count', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;

        const [result] = await db.execute(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male_count,
                SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female_count
             FROM students 
             WHERE school_id = ? AND is_active = 1`,
            [schoolId]
        );

        res.json({
            success: true,
            data: {
                total: parseInt(result[0].total) || 0,
                male: parseInt(result[0].male_count) || 0,
                female: parseInt(result[0].female_count) || 0
            }
        });

    } catch (error) {
        console.error('Error getting student count:', error);
        res.status(500).json({
            success: false,
            message: 'विद्यार्थी संख्या मिळवताना त्रुटी'
        });
    }
});

// Get Students List with Filters
router.get('/list', authMiddleware, async (req, res) => {
    try {
        const { schoolId, role } = req.user;
        const { class: className, section, search, page = 1, limit = 50 } = req.query;

        // Build query conditions
        let conditions = ['s.school_id = ? AND s.is_active = 1'];
        let params = [schoolId];

        if (className) {
            conditions.push('s.class = ?');
            params.push(className);
        }

        if (section) {
            conditions.push('s.section = ?');
            params.push(section);
        }

        if (search) {
            conditions.push('(s.name LIKE ? OR s.student_id LIKE ? OR s.parent_mobile LIKE ?)');
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        // For teachers, limit to their assigned class
        if (role === 'teacher') {
            const [teacherInfo] = await db.execute(
                'SELECT class, section FROM users WHERE id = ?',
                [req.user.userId]
            );
            
            if (teacherInfo.length > 0 && teacherInfo[0].class) {
                conditions.push('s.class = ?');
                params.push(teacherInfo[0].class);
                
                if (teacherInfo[0].section) {
                    conditions.push('s.section = ?');
                    params.push(teacherInfo[0].section);
                }
            }
        }

        const whereClause = conditions.join(' AND ');
        const offset = (page - 1) * limit;

        // Get total count
        const [countResult] = await db.execute(
            `SELECT COUNT(*) as total FROM students s WHERE ${whereClause}`,
            params
        );

        // Get students with pagination
        params.push(limit, offset);
        const [students] = await db.execute(
            `SELECT 
                s.id, s.roll_number, s.name, s.mother_name, s.father_name,
                s.birth_date, s.gender, s.address, s.parent_mobile, 
                s.parent_email, s.aadhar_number, s.student_id, 
                s.class, s.section, s.is_active, s.created_at,
                s.admission_date, s.previous_school, s.caste, s.category,
                u.name as teacher_name
             FROM students s
             LEFT JOIN users u ON s.teacher_id = u.id
             WHERE ${whereClause}
             ORDER BY s.class, s.section, s.roll_number
             LIMIT ? OFFSET ?`,
            params
        );

        res.json({
            success: true,
            data: {
                students,
                pagination: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(countResult[0].total / limit)
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

// Get Student by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;

        const [students] = await db.execute(
            `SELECT 
                s.*,
                u.name as teacher_name
             FROM students s
             LEFT JOIN users u ON s.teacher_id = u.id
             WHERE s.id = ? AND s.school_id = ?`,
            [id, schoolId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'विद्यार्थी सापडला नाही'
            });
        }

        // Get attendance summary
        const [attendance] = await db.execute(
            `SELECT 
                COUNT(*) as total_days,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days
             FROM attendance 
             WHERE student_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
            [id]
        );

        res.json({
            success: true,
            data: {
                student: students[0],
                attendance_summary: attendance[0]
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

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const { 
                roll_number, name, mother_name, father_name, birth_date, 
                gender, address, parent_mobile, parent_email, aadhar_number, 
                student_id, class: studentClass, section, admission_date,
                previous_school, caste, category, blood_group
            } = req.body;
            const { schoolId, userId } = req.user;

            // Check if roll number already exists in the same class
            const [existingStudent] = await connection.execute(
                'SELECT id FROM students WHERE school_id = ? AND class = ? AND roll_number = ? AND is_active = 1',
                [schoolId, studentClass, roll_number]
            );

            if (existingStudent.length > 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'या इयत्तेत हा हजेरी क्रमांक आधीच वापरला आहे'
                });
            }

            // Check if aadhar number already exists
            if (aadhar_number) {
                const [existingAadhar] = await connection.execute(
                    'SELECT id FROM students WHERE aadhar_number = ? AND is_active = 1',
                    [aadhar_number]
                );

                if (existingAadhar.length > 0) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'हा आधार नंबर आधीच नोंदणीकृत आहे'
                    });
                }
            }

            // Get teacher_id if teacher is adding the student
            let teacher_id = null;
            if (req.user.role === 'teacher') {
                teacher_id = userId;
            }

            // Insert student
            const [result] = await connection.execute(
                `INSERT INTO students (
                    school_id, roll_number, name, mother_name, father_name,
                    birth_date, gender, address, parent_mobile, parent_email,
                    aadhar_number, student_id, class, section, teacher_id,
                    admission_date, previous_school, caste, category, blood_group,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [
                    schoolId, roll_number, name, mother_name, father_name || null,
                    birth_date, gender || 'other', address, parent_mobile, parent_email || null,
                    aadhar_number || null, student_id || null, studentClass, section || null, teacher_id,
                    admission_date || new Date(), previous_school || null, caste || null, 
                    category || 'general', blood_group || null
                ]
            );

            await connection.commit();

            res.status(201).json({
                success: true,
                message: 'विद्यार्थी यशस्वीरित्या जोडला गेला',
                data: {
                    id: result.insertId,
                    roll_number,
                    name,
                    class: studentClass,
                    section
                }
            });

        } catch (error) {
            await connection.rollback();
            console.error('Error adding student:', error);
            res.status(500).json({
                success: false,
                message: 'विद्यार्थी जोडताना त्रुटी झाली'
            });
        } finally {
            connection.release();
        }
    }
);

// Update Student
router.put('/update/:id', 
    authMiddleware,
    async (req, res) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const { 
                roll_number, name, mother_name, father_name, birth_date,
                gender, address, parent_mobile, parent_email, aadhar_number,
                student_id, class: studentClass, section, previous_school,
                caste, category, blood_group
            } = req.body;
            const { schoolId } = req.user;
            const studentId = req.params.id;

            // Verify student belongs to school
            const [student] = await connection.execute(
                'SELECT id FROM students WHERE id = ? AND school_id = ?',
                [studentId, schoolId]
            );

            if (student.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'विद्यार्थी सापडला नाही'
                });
            }

            // Validation
            if (parent_mobile && !/^\d{10}$/.test(parent_mobile)) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'कृपया योग्य 10 अंकी मोबाईल नंबर टाका'
                });
            }

            if (aadhar_number && !/^\d{12}$/.test(aadhar_number)) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'आधार नंबर 12 अंकी असावा'
                });
            }

            // Check if roll number exists for other students
            if (roll_number && studentClass) {
                const [existingStudent] = await connection.execute(
                    'SELECT id FROM students WHERE school_id = ? AND class = ? AND roll_number = ? AND id != ? AND is_active = 1',
                    [schoolId, studentClass, roll_number, studentId]
                );

                if (existingStudent.length > 0) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'या इयत्तेत हा हजेरी क्रमांक आधीच वापरला आहे'
                    });
                }
            }

            // Build update query dynamically
            const updates = [];
            const values = [];

            if (roll_number !== undefined) {
                updates.push('roll_number = ?');
                values.push(roll_number);
            }
            if (name !== undefined) {
                updates.push('name = ?');
                values.push(name);
            }
            if (mother_name !== undefined) {
                updates.push('mother_name = ?');
                values.push(mother_name);
            }
            if (father_name !== undefined) {
                updates.push('father_name = ?');
                values.push(father_name);
            }
            if (birth_date !== undefined) {
                updates.push('birth_date = ?');
                values.push(birth_date);
            }
            if (gender !== undefined) {
                updates.push('gender = ?');
                values.push(gender);
            }
            if (address !== undefined) {
                updates.push('address = ?');
                values.push(address);
            }
            if (parent_mobile !== undefined) {
                updates.push('parent_mobile = ?');
                values.push(parent_mobile);
            }
            if (parent_email !== undefined) {
                updates.push('parent_email = ?');
                values.push(parent_email || null);
            }
            if (aadhar_number !== undefined) {
                updates.push('aadhar_number = ?');
                values.push(aadhar_number || null);
            }
            if (student_id !== undefined) {
                updates.push('student_id = ?');
                values.push(student_id || null);
            }
            if (studentClass !== undefined) {
                updates.push('class = ?');
                values.push(studentClass);
            }
            if (section !== undefined) {
                updates.push('section = ?');
                values.push(section || null);
            }
            if (previous_school !== undefined) {
                updates.push('previous_school = ?');
                values.push(previous_school || null);
            }
            if (caste !== undefined) {
                updates.push('caste = ?');
                values.push(caste || null);
            }
            if (category !== undefined) {
                updates.push('category = ?');
                values.push(category);
            }
            if (blood_group !== undefined) {
                updates.push('blood_group = ?');
                values.push(blood_group || null);
            }

            if (updates.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'अद्यतनित करण्यासाठी काहीही नाही'
                });
            }

            updates.push('updated_at = CURRENT_TIMESTAMP');
            values.push(studentId, schoolId);

            await connection.execute(
                `UPDATE students SET ${updates.join(', ')} WHERE id = ? AND school_id = ?`,
                values
            );

            await connection.commit();

            res.json({
                success: true,
                message: 'विद्यार्थी माहिती यशस्वीरित्या अद्यतनित केली'
            });

        } catch (error) {
            await connection.rollback();
            console.error('Error updating student:', error);
            res.status(500).json({
                success: false,
                message: 'विद्यार्थी अद्यतनित करताना त्रुटी'
            });
        } finally {
            connection.release();
        }
    }
);

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

        // Soft delete
        await db.execute(
            `UPDATE students 
             SET is_active = 0, updated_at = CURRENT_TIMESTAMP
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
router.post('/bulk-import',
    authMiddleware,
    async (req, res) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const { students } = req.body;
            const { schoolId } = req.user;

            if (!Array.isArray(students) || students.length === 0) {
                await connection.rollback();
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
                    if (!student.roll_number || !student.name || !student.mother_name || 
                        !student.class || !student.parent_mobile) {
                        errors.push({
                            row: i + 1,
                            name: student.name,
                            error: 'आवश्यक माहिती गहाळ आहे'
                        });
                        continue;
                    }

                    // Check if roll number exists
                    const [existing] = await connection.execute(
                        'SELECT id FROM students WHERE school_id = ? AND class = ? AND roll_number = ? AND is_active = 1',
                        [schoolId, student.class, student.roll_number]
                    );

                    if (existing.length > 0) {
                        errors.push({
                            row: i + 1,
                            name: student.name,
                            error: 'हजेरी क्रमांक आधीच वापरला आहे'
                        });
                        continue;
                    }

                    // Insert student
                    const [result] = await connection.execute(
                        `INSERT INTO students (
                            school_id, roll_number, name, mother_name, father_name,
                            birth_date, gender, address, parent_mobile, class, section,
                            created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                        [
                            schoolId, student.roll_number, student.name, student.mother_name,
                            student.father_name || null, student.birth_date || null,
                            student.gender || 'other', student.address || '', 
                            student.parent_mobile, student.class, student.section || null
                        ]
                    );

                    imported.push({
                        row: i + 1,
                        name: student.name,
                        id: result.insertId
                    });

                } catch (error) {
                    errors.push({
                        row: i + 1,
                        name: student.name,
                        error: error.message
                    });
                }
            }

            await connection.commit();

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
            await connection.rollback();
            console.error('Error in bulk import:', error);
            res.status(500).json({
                success: false,
                message: 'विद्यार्थी आयात करताना त्रुटी'
            });
        } finally {
            connection.release();
        }
    }
);

// Promote Students
router.post('/promote',
    authMiddleware,
    async (req, res) => {
        if (req.user.role !== 'principal') {
            return res.status(403).json({
                success: false,
                message: 'फक्त मुख्याध्यापक विद्यार्थ्यांना पुढील वर्गात पाठवू शकतात'
            });
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const { fromClass, toClass, studentIds } = req.body;
            const { schoolId } = req.user;

            if (!fromClass || !toClass || !Array.isArray(studentIds)) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'आवश्यक माहिती गहाळ आहे'
                });
            }

            // Update students' class
            const [result] = await connection.execute(
                `UPDATE students 
                 SET class = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE school_id = ? AND class = ? AND id IN (${studentIds.map(() => '?').join(',')})`,
                [toClass, schoolId, fromClass, ...studentIds]
            );

            await connection.commit();

            res.json({
                success: true,
                message: `${result.affectedRows} विद्यार्थी यशस्वीरित्या ${toClass} मध्ये पाठवले गेले`,
                data: {
                    promoted: result.affectedRows
                }
            });

        } catch (error) {
            await connection.rollback();
            console.error('Error promoting students:', error);
            res.status(500).json({
                success: false,
                message: 'विद्यार्थ्यांना पुढे पाठवताना त्रुटी'
            });
        } finally {
            connection.release();
        }
    }
);

module.exports = router;