import express from "express";
import bcrypt from "bcryptjs";

import pool from "../config/db.js";

import {
    requireAuth,
    requireAdmin,
    requireStudent,
} from "../middleware/authMiddleware.js";

const router = express.Router();


// =====================================================
// DEFAULT STUDENT PASSWORD
// =====================================================

const DEFAULT_STUDENT_PASSWORD = "Student@123";


// =====================================================
// ADD STUDENT
// ADMIN ONLY
// =====================================================

router.post(
    "/add",
    requireAuth,
    requireAdmin,
    async (req, res) => {

        const client = await pool.connect();

        try {

            const {
                name,
                email,
                phone,
                course,
                admissionDate,
                dateOfBirth,
                gender,
                address,
                city,
                state,
                pinCode,
            } = req.body;


            // ==========================================
            // VALIDATION
            // ==========================================

            if (!name || !email || !course) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name, email and course are required.",

                });

            }


            await client.query("BEGIN");


            // ==========================================
            // CHECK EMAIL
            // ==========================================

            const existingUser = await client.query(

                `
                SELECT id
                FROM users
                WHERE LOWER(email) = LOWER($1)
                `,

                [email.trim()]

            );


            if (existingUser.rows.length > 0) {

                await client.query("ROLLBACK");

                return res.status(400).json({

                    success: false,

                    message:
                        "This email is already registered.",

                });

            }


            // ==========================================
            // GENERATE STUDENT ID
            // ==========================================

            const sequenceResult = await client.query(

                `SELECT nextval('student_id_seq') AS number`

            );


            const number =
                sequenceResult.rows[0].number;


            const studentId =
                `FL${String(number).padStart(4, "0")}`;


            // ==========================================
            // HASH DEFAULT PASSWORD
            // ==========================================

            const hashedPassword =
                await bcrypt.hash(
                    DEFAULT_STUDENT_PASSWORD,
                    12
                );


            // ==========================================
            // INSERT INTO USERS
            // ==========================================

            const userResult = await client.query(

                `
                INSERT INTO users
                (
                    name,
                    email,
                    password,
                    role,
                    must_change_password
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5
                )
                RETURNING id
                `,

                [
                    name.trim(),

                    email.trim().toLowerCase(),

                    hashedPassword,

                    "student",

                    true,
                ]

            );


            const userId =
                userResult.rows[0].id;


            // ==========================================
            // INSERT INTO STUDENT MASTER
            // ==========================================

            await client.query(

                `
                INSERT INTO student_master
                (
                    user_id,
                    student_id,
                    phone,
                    course,
                    admission_date,
                    date_of_birth,
                    gender,
                    address,
                    city,
                    state,
                    pin_code
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9,
                    $10,
                    $11
                )
                `,

                [

                    userId,

                    studentId,

                    phone || null,

                    course || null,

                    admissionDate || null,

                    dateOfBirth || null,

                    gender || null,

                    address || null,

                    city || null,

                    state || null,

                    pinCode || null,

                ]

            );


            // ==========================================
            // COMMIT
            // ==========================================

            await client.query("COMMIT");


            // ==========================================
            // RESPONSE
            // ==========================================

            res.status(201).json({

                success: true,

                message:
                    "Student created successfully.",

                student: {

                    userId,

                    studentId,

                    name: name.trim(),

                    email:
                        email.trim().toLowerCase(),

                    phone,

                    course,

                },

                defaultPassword:
                    DEFAULT_STUDENT_PASSWORD,

            });


        } catch (error) {

            await client.query("ROLLBACK");


            console.error(
                "Add student error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to create student.",

            });


        } finally {

            client.release();

        }

    }
);


// =====================================================
// GET ALL STUDENTS
// ADMIN ONLY
// =====================================================

router.get(
    "/all",
    requireAuth,
    requireAdmin,
    async (req, res) => {

        try {

            const result = await pool.query(

                `
                SELECT

                    u.id AS user_id,

                    u.name,

                    u.email,

                    u.role,

                    u.must_change_password,

                    sm.id AS student_master_id,

                    sm.student_id,

                    sm.phone,

                    sm.course,

                    sm.admission_date,

                    sm.date_of_birth,

                    sm.gender,

                    sm.address,

                    sm.city,

                    sm.state,

                    sm.pin_code,

                    sm.created_at

                FROM users u

                INNER JOIN student_master sm
                    ON u.id = sm.user_id

                WHERE u.role = 'student'

                ORDER BY sm.id DESC
                `

            );


            res.json({

                success: true,

                students: result.rows,

            });


        } catch (error) {

            console.error(
                "Get students error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch students.",

            });

        }

    }
);


// =====================================================
// GET LOGGED-IN STUDENT PROFILE
// =====================================================

router.get(
    "/my-profile",
    requireAuth,
    requireStudent,
    async (req, res) => {

        try {

            const result = await pool.query(

                `
                SELECT

                    u.id AS user_id,

                    u.name,

                    u.email,

                    u.role,

                    u.must_change_password,

                    sm.student_id,

                    sm.phone,

                    sm.course,

                    sm.admission_date,

                    sm.date_of_birth,

                    sm.gender,

                    sm.address,

                    sm.city,

                    sm.state,

                    sm.pin_code

                FROM users u

                INNER JOIN student_master sm
                    ON u.id = sm.user_id

                WHERE u.id = $1
                `,

                [req.session.user.id]

            );


            if (result.rows.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Student record not found.",

                });

            }


            res.json({

                success: true,

                student: result.rows[0],

            });


        } catch (error) {

            console.error(
                "Student profile error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch student profile.",

            });

        }

    }
);


export default router;