import express from "express";
import pool from "../config/db.js";

const router = express.Router();


// ==================================================
// GET STUDENTS FOR ATTENDANCE
// ==================================================

router.get("/students", async (req, res) => {

    try {

        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
        }


        if (req.session.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required",
            });
        }


       const result = await pool.query(`
    SELECT
        sm.id,
        sm.student_id,
        u.name,
        u.email,
        sm.course,
        '' AS batch,
        sm.phone

    FROM student_master sm

    INNER JOIN users u
        ON sm.user_id = u.id

    WHERE u.role = 'student'

    ORDER BY sm.student_id
`);


        res.json({
            success: true,
            students: result.rows,
        });


    } catch (error) {

        console.error(
            "Attendance students error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to load students",
        });

    }

});


// ==================================================
// SAVE ATTENDANCE
// ==================================================

router.post("/save", async (req, res) => {

    try {

        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
        }


        if (req.session.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required",
            });
        }


        const {
            attendance_date,
            start_time,
            end_time,
            attendance,
        } = req.body;


        if (
            !attendance_date ||
            !start_time ||
            !end_time ||
            !Array.isArray(attendance)
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid attendance data",
            });

        }


        if (attendance.length === 0) {

            return res.status(400).json({
                success: false,
                message: "No students selected",
            });

        }


        const client =
            await pool.connect();


        try {

            await client.query("BEGIN");


            for (const item of attendance) {

                await client.query(
                    `
                    INSERT INTO attendance
                    (
                        student_id,
                        attendance_date,
                        start_time,
                        end_time,
                        status,
                        marked_by
                    )

                    VALUES
                    ($1, $2, $3, $4, $5, $6)

                    ON CONFLICT
                    (
                        student_id,
                        attendance_date,
                        start_time,
                        end_time
                    )

                    DO UPDATE SET
                        status = EXCLUDED.status,
                        marked_by = EXCLUDED.marked_by
                    `,

                    [
                        item.student_id,
                        attendance_date,
                        start_time,
                        end_time,
                        item.status,
                        req.session.user.id,
                    ]
                );

            }


            await client.query("COMMIT");


            res.json({
                success: true,
                message: "Attendance saved successfully",
            });


        } catch (error) {

            await client.query("ROLLBACK");

            throw error;

        } finally {

            client.release();

        }


    } catch (error) {

        console.error(
            "Save attendance error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to save attendance",
        });

    }

});

// ==================================================
// ATTENDANCE REPORT
// ==================================================

router.get("/report", async (req, res) => {

    try {

        // ------------------------------------------
        // ADMIN AUTHENTICATION
        // ------------------------------------------

        if (!req.session.user) {

            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });

        }


        if (req.session.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin access required",
            });

        }


        // ------------------------------------------
        // QUERY PARAMETERS
        // ------------------------------------------

        const {
            from_date,
            to_date,
            course,
            status,
        } = req.query;


        if (!from_date || !to_date) {

            return res.status(400).json({
                success: false,
                message: "From date and To date are required",
            });

        }


        // ------------------------------------------
        // BUILD QUERY
        // ------------------------------------------

        let query = `
            SELECT
                a.id,
                a.student_id,
                sm.student_id AS student_code,
                u.name,
                sm.course,
                a.attendance_date,
                a.start_time,
                a.end_time,
                a.status

            FROM attendance a

            INNER JOIN student_master sm
                ON a.student_id = sm.id

            INNER JOIN users u
                ON sm.user_id = u.id

            WHERE
                a.attendance_date BETWEEN $1 AND $2
        `;


        const values = [
            from_date,
            to_date,
        ];


        // ------------------------------------------
        // COURSE FILTER
        // ------------------------------------------

        if (course) {

            values.push(course);

            query += `
                AND sm.course = $${values.length}
            `;
        }


        // ------------------------------------------
        // STATUS FILTER
        // ------------------------------------------

        if (status) {

            values.push(status);

            query += `
                AND a.status = $${values.length}
            `;
        }


        // ------------------------------------------
        // ORDER
        // ------------------------------------------

        query += `
            ORDER BY
                a.attendance_date DESC,
                a.start_time DESC,
                sm.student_id ASC
        `;


        // ------------------------------------------
        // EXECUTE
        // ------------------------------------------

        const result =
            await pool.query(
                query,
                values
            );


        // ------------------------------------------
        // FORMAT RESPONSE
        // ------------------------------------------

        const records = result.rows.map(
            (row) => ({

                id: row.id,

                student_id:
                    row.student_code,

                name:
                    row.name,

                course:
                    row.course,

                attendance_date:
                    row.attendance_date,

                start_time:
                    row.start_time,

                end_time:
                    row.end_time,

                status:
                    row.status,

            })
        );


        res.json({

            success: true,

            records,

        });


    } catch (error) {

        console.error(
            "Attendance report error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to load attendance report",

        });

    }

});

// ==================================================
// GET MY ATTENDANCE
// Logged-in student only
// ==================================================

router.get("/my-attendance", async (req, res) => {

    try {

        // ------------------------------------------
        // CHECK LOGIN
        // ------------------------------------------

        if (!req.session.user) {

            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });

        }


        // ------------------------------------------
        // STUDENT ONLY
        // ------------------------------------------

        if (req.session.user.role !== "student") {

            return res.status(403).json({
                success: false,
                message: "Student access required",
            });

        }


        // ------------------------------------------
        // GET STUDENT RECORD
        // ------------------------------------------

        const studentResult = await pool.query(
            `
            SELECT
                id,
                student_id,
                course
            FROM student_master
            WHERE user_id = $1
            LIMIT 1
            `,
            [req.session.user.id]
        );


        if (studentResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Student profile not found",
            });

        }


        const student = studentResult.rows[0];


        // ------------------------------------------
        // GET ATTENDANCE
        // ------------------------------------------

        const attendanceResult = await pool.query(
            `
            SELECT
                a.id,
                a.attendance_date,
                a.start_time,
                a.end_time,
                a.status

            FROM attendance a

            WHERE a.student_id = $1

            ORDER BY
                a.attendance_date DESC,
                a.start_time DESC
            `,
            [student.id]
        );


        // ------------------------------------------
        // COUNTS
        // ------------------------------------------

        const records = attendanceResult.rows;


        const totalClasses = records.length;


        const presentCount = records.filter(
            item =>
                String(item.status).toLowerCase() ===
                "present"
        ).length;


        const absentCount = records.filter(
            item =>
                String(item.status).toLowerCase() ===
                "absent"
        ).length;


        const percentage =
            totalClasses > 0
                ? (
                    (presentCount / totalClasses) *
                    100
                ).toFixed(1)
                : "0.0";


        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        res.json({

            success: true,

            summary: {
                totalClasses,
                present: presentCount,
                absent: absentCount,
                percentage,
            },

            records,

        });


    } catch (error) {

        console.error(
            "My attendance error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to load attendance",

        });

    }

});
export default router;