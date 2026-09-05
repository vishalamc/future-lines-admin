import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import pool from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

import {
    requireAuth,
    requireAdmin,
    requireStudent,
} from "./middleware/authMiddleware.js";

// --------------------------------------------------
// LOAD ENVIRONMENT VARIABLES
// --------------------------------------------------

dotenv.config();

// --------------------------------------------------
// CREATE EXPRESS APP
// --------------------------------------------------

const app = express();

const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// FILE PATHS
// --------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// POSTGRES SESSION STORE
// --------------------------------------------------

const PgSession = connectPgSimple(session);

// --------------------------------------------------
// CORS
// --------------------------------------------------

app.use(
    cors({
        origin:
            process.env.FRONTEND_URL ||
            "http://localhost:5173",

        credentials: true,
    })
);

// --------------------------------------------------
// BODY PARSER
// --------------------------------------------------

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

// --------------------------------------------------
// SESSION
// --------------------------------------------------

app.use(
    session({
        store: new PgSession({
            pool: pool,
            tableName: "user_sessions",
            createTableIfMissing: true,
        }),

        secret:
            process.env.SESSION_SECRET ||
            "future-lines-secret",

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",

            maxAge:
                1000 * 60 * 60 * 8,
        },
    })
);

// ==================================================
// AUTH ROUTES
// ==================================================

app.use(
    "/api/auth",
    authRoutes
);

// ==================================================
// STUDENT ROUTES
// ==================================================

app.use(
    "/api/students",
    studentRoutes
);

// ==================================================
// ATTENDANCE ROUTES
// ==================================================

app.use(
    "/api/attendance",
    attendanceRoutes
);

// ==================================================
// FEES MANAGEMENT
// ==================================================
//
// IMPORTANT:
//
// fee_transactions.student_id
//      -> users.id
//
// student_master.student_id
//      -> visible ID such as FL0001
//
// batch is stored in student_master,
// NOT fee_transactions.
//
// net_fee is calculated:
//
// total_fee - discount
//
// total_paid:
//
// SUM(amount_paid)
//
// pending:
//
// net_fee - total_paid
//
// ==================================================


// ==================================================
// GET ALL FEE SUMMARIES
// ADMIN ONLY
// ==================================================

app.get(
    "/api/fees",
    requireAuth,
    requireAdmin,
    async (req, res) => {

        try {

            const result = await pool.query(
                `
                WITH payment_totals AS (

                    SELECT
                        student_id,
                        COALESCE(
                            SUM(amount_paid),
                            0
                        ) AS total_paid

                    FROM fee_transactions

                    GROUP BY student_id
                ),

                latest_fee AS (

                    SELECT DISTINCT ON (student_id)

                        id,
                        student_id,
                        course_name,
                        total_fee,
                        discount,
                        amount_paid,
                        payment_date,
                        payment_mode,
                        transaction_number,
                        receipt_number,
                        remarks,
                        created_at

                    FROM fee_transactions

                    ORDER BY
                        student_id,
                        id DESC
                )

                SELECT

                    u.id AS user_id,

                    u.name,

                    u.email,

                    sm.student_id AS student_code,

                    sm.phone,

                    sm.course AS student_course,

                    sm.batch,

                    lf.id AS latest_transaction_id,

                    lf.course_name,

                    COALESCE(
                        lf.total_fee,
                        0
                    ) AS total_fee,

                    COALESCE(
                        lf.discount,
                        0
                    ) AS discount,

                    GREATEST(
                        COALESCE(lf.total_fee, 0)
                        -
                        COALESCE(lf.discount, 0),
                        0
                    ) AS net_fee,

                    COALESCE(
                        pt.total_paid,
                        0
                    ) AS total_paid,

                    GREATEST(

                        (
                            COALESCE(lf.total_fee, 0)
                            -
                            COALESCE(lf.discount, 0)
                        )
                        -
                        COALESCE(pt.total_paid, 0),

                        0

                    ) AS pending_amount,

                    CASE

                        WHEN COALESCE(pt.total_paid, 0)
                            >=
                            (
                                COALESCE(lf.total_fee, 0)
                                -
                                COALESCE(lf.discount, 0)
                            )

                        THEN 'Paid'

                        WHEN COALESCE(pt.total_paid, 0) > 0
                        THEN 'Partial'

                        ELSE 'Pending'

                    END AS payment_status

                FROM latest_fee lf

                INNER JOIN users u
                    ON u.id = lf.student_id

                INNER JOIN student_master sm
                    ON sm.user_id = u.id

                LEFT JOIN payment_totals pt
                    ON pt.student_id = u.id

                WHERE
                    u.role = 'student'

                ORDER BY
                    lf.id DESC
                `
            );

            res.json({
                success: true,
                fees: result.rows,
            });

        } catch (error) {

            console.error(
                "Get fee summaries error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to load fee records.",
            });
        }
    }
);


// ==================================================
// GET PARTICULAR STUDENT FEE DETAILS
// ADMIN ONLY
// ==================================================

app.get(
    "/api/fees/student/:studentId",
    requireAuth,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                studentId
            } = req.params;

            // ------------------------------------------
            // FIND STUDENT
            // ------------------------------------------

            const studentResult =
                await pool.query(
                    `
                    SELECT

                        u.id AS user_id,

                        u.name,

                        u.email,

                        sm.student_id,

                        sm.phone,

                        sm.course,

                        sm.batch,

                        sm.admission_date

                    FROM users u

                    INNER JOIN student_master sm
                        ON sm.user_id = u.id

                    WHERE
                        u.role = 'student'
                        AND sm.student_id = $1

                    LIMIT 1
                    `,
                    [studentId]
                );

            if (
                studentResult.rows.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Student not found.",
                });
            }

            const student =
                studentResult.rows[0];

            // ------------------------------------------
            // FEE TRANSACTIONS
            // ------------------------------------------

            const transactionResult =
                await pool.query(
                    `
                    SELECT

                        id,

                        course_name,

                        total_fee,

                        discount,

                        (
                            total_fee - discount
                        ) AS net_fee,

                        amount_paid,

                        payment_date,

                        payment_mode,

                        transaction_number,

                        receipt_number,

                        remarks,

                        created_at

                    FROM fee_transactions

                    WHERE
                        student_id = $1

                    ORDER BY
                        id DESC
                    `,
                    [student.user_id]
                );

            // ------------------------------------------
            // SUMMARY
            // ------------------------------------------

            let summary = null;

            if (
                transactionResult.rows.length > 0
            ) {

                const latest =
                    transactionResult.rows[0];

                const totalPaid =
                    transactionResult.rows.reduce(
                        (
                            total,
                            transaction
                        ) =>
                            total +
                            Number(
                                transaction.amount_paid || 0
                            ),
                        0
                    );

                const totalFee =
                    Number(
                        latest.total_fee || 0
                    );

                const discount =
                    Number(
                        latest.discount || 0
                    );

                const netFee =
                    Math.max(
                        totalFee - discount,
                        0
                    );

                const pending =
                    Math.max(
                        netFee - totalPaid,
                        0
                    );

                summary = {
                    total_fee: totalFee,
                    discount: discount,
                    net_fee: netFee,
                    total_paid: totalPaid,
                    pending_amount: pending,
                    payment_status:
                        pending <= 0
                            ? "Paid"
                            : totalPaid > 0
                                ? "Partial"
                                : "Pending",
                };
            }

            res.json({
                success: true,

                student,

                summary,

                transactions:
                    transactionResult.rows,
            });

        } catch (error) {

            console.error(
                "Student fee details error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to load student fee details.",
            });
        }
    }
);


// ==================================================
// ADD FEE / PAYMENT TRANSACTION
// ADMIN ONLY
// ==================================================

app.post(
    "/api/fees",
    requireAuth,
    requireAdmin,
    async (req, res) => {

        const client =
            await pool.connect();

        try {

            const {
                student_id,
                course_name,
                total_fee,
                discount,
                amount_paid,
                payment_date,
                payment_mode,
                transaction_number,
                remarks,
            } = req.body;

            // ------------------------------------------
            // VALIDATION
            // ------------------------------------------

            if (
                !student_id ||
                !course_name ||
                total_fee === undefined ||
                total_fee === null
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Student, course and total fee are required.",
                });
            }

            const totalFee =
                Number(total_fee);

            const discountAmount =
                Number(discount || 0);

            const paymentAmount =
                Number(amount_paid || 0);

            // ------------------------------------------
            // NUMBER VALIDATION
            // ------------------------------------------

            if (
                !Number.isFinite(totalFee) ||
                totalFee < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid total fee.",
                });
            }

            if (
                !Number.isFinite(
                    discountAmount
                ) ||
                discountAmount < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid discount.",
                });
            }

            if (
                !Number.isFinite(
                    paymentAmount
                ) ||
                paymentAmount < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid payment amount.",
                });
            }

            if (
                discountAmount >
                totalFee
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Discount cannot be greater than total fee.",
                });
            }

            const netFee =
                totalFee -
                discountAmount;

            // ------------------------------------------
            // PAYMENT VALIDATION
            // ------------------------------------------

            if (
                paymentAmount > 0 &&
                !payment_date
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Payment date is required.",
                });
            }

            if (
                paymentAmount > 0 &&
                !payment_mode
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Payment mode is required.",
                });
            }

            // ------------------------------------------
            // BEGIN TRANSACTION
            // ------------------------------------------

            await client.query(
                "BEGIN"
            );

            // ------------------------------------------
            // FIND STUDENT
            // ------------------------------------------

            const studentResult =
                await client.query(
                    `
                    SELECT

                        u.id AS user_id,

                        u.name,

                        u.email,

                        sm.student_id,

                        sm.course,

                        sm.batch

                    FROM users u

                    INNER JOIN student_master sm
                        ON sm.user_id = u.id

                    WHERE
                        u.role = 'student'
                        AND sm.student_id = $1

                    LIMIT 1
                    `,
                    [
                        student_id.trim()
                    ]
                );

            if (
                studentResult.rows.length === 0
            ) {

                await client.query(
                    "ROLLBACK"
                );

                return res.status(404).json({
                    success: false,
                    message:
                        "Student not found.",
                });
            }

            const student =
                studentResult.rows[0];

            const userId =
                student.user_id;

            // ------------------------------------------
            // GET PREVIOUS PAID AMOUNT
            // ------------------------------------------

            const paidResult =
                await client.query(
                    `
                    SELECT

                        COALESCE(
                            SUM(amount_paid),
                            0
                        ) AS total_paid

                    FROM fee_transactions

                    WHERE student_id = $1
                    `,
                    [userId]
                );

            const previousPaid =
                Number(
                    paidResult.rows[0]
                        ?.total_paid || 0
                );

            // ------------------------------------------
            // CALCULATE NEW PENDING
            // ------------------------------------------

            const pendingBeforePayment =
                Math.max(
                    netFee -
                    previousPaid,
                    0
                );

            // ------------------------------------------
            // PREVENT OVERPAYMENT
            // ------------------------------------------

            if (
                paymentAmount >
                pendingBeforePayment
            ) {

                await client.query(
                    "ROLLBACK"
                );

                return res.status(400).json({
                    success: false,
                    message:
                        `Payment cannot exceed pending amount of ₹${pendingBeforePayment.toFixed(2)}.`,
                });
            }

            // ------------------------------------------
            // INSERT FEE TRANSACTION
            // ------------------------------------------

            const insertResult =
                await client.query(
                    `
                    INSERT INTO fee_transactions
                    (
                        student_id,
                        course_name,
                        total_fee,
                        discount,
                        amount_paid,
                        payment_date,
                        payment_mode,
                        transaction_number,
                        remarks
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
                        $9
                    )

                    RETURNING id
                    `,
                    [
                        userId,

                        course_name.trim(),

                        totalFee,

                        discountAmount,

                        paymentAmount,

                        payment_date ||
                            null,

                        payment_mode ||
                            null,

                        transaction_number
                            ?.trim() ||
                            null,

                        remarks
                            ?.trim() ||
                            null,
                    ]
                );

            const transactionId =
                insertResult.rows[0].id;

            // ------------------------------------------
            // GENERATE RECEIPT NUMBER
            // ------------------------------------------

            let receiptNumber = null;

            if (
                paymentAmount > 0
            ) {

                const now =
                    new Date();

                const year =
                    now.getFullYear();

                const month =
                    String(
                        now.getMonth() + 1
                    ).padStart(2, "0");

                const day =
                    String(
                        now.getDate()
                    ).padStart(2, "0");

                receiptNumber =
                    `FLR${year}${month}${day}${String(
                        transactionId
                    ).padStart(5, "0")}`;

                await client.query(
                    `
                    UPDATE fee_transactions

                    SET
                        receipt_number = $1,
                        updated_at = CURRENT_TIMESTAMP

                    WHERE id = $2
                    `,
                    [
                        receiptNumber,
                        transactionId,
                    ]
                );
            }

            // ------------------------------------------
            // COMMIT
            // ------------------------------------------

            await client.query(
                "COMMIT"
            );

            const totalPaidAfter =
                previousPaid +
                paymentAmount;

            const pendingAfter =
                Math.max(
                    netFee -
                    totalPaidAfter,
                    0
                );

            res.status(201).json({

                success: true,

                message:
                    paymentAmount > 0
                        ? "Fee payment recorded successfully."
                        : "Fee structure saved successfully.",

                transaction: {
                    id: transactionId,

                    student_id:
                        student.student_id,

                    student_name:
                        student.name,

                    course_name:
                        course_name.trim(),

                    total_fee:
                        totalFee,

                    discount:
                        discountAmount,

                    net_fee:
                        netFee,

                    amount_paid:
                        paymentAmount,

                    total_paid:
                        totalPaidAfter,

                    pending_amount:
                        pendingAfter,

                    payment_date:
                        payment_date || null,

                    payment_mode:
                        payment_mode || null,

                    transaction_number:
                        transaction_number
                            ?.trim() || null,

                    receipt_number:
                        receiptNumber,

                    remarks:
                        remarks
                            ?.trim() || null,
                },
            });

        } catch (error) {

            try {
                await client.query(
                    "ROLLBACK"
                );
            } catch (rollbackError) {
                console.error(
                    "Fee rollback error:",
                    rollbackError
                );
            }

            console.error(
                "Add fee error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to save fee transaction.",
            });

        } finally {

            client.release();
        }
    }
);


// ==================================================
// DELETE FEE TRANSACTION
// ADMIN ONLY
// ==================================================

app.delete(
    "/api/fees/:id",
    requireAuth,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const result =
                await pool.query(
                    `
                    DELETE FROM fee_transactions

                    WHERE id = $1

                    RETURNING id
                    `,
                    [id]
                );

            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Fee transaction not found.",
                });
            }

            res.json({
                success: true,
                message:
                    "Fee transaction deleted successfully.",
            });

        } catch (error) {

            console.error(
                "Delete fee error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to delete fee transaction.",
            });
        }
    }
);
// ==================================================
// FEES DASHBOARD SUMMARY
// ADMIN ONLY
// ==================================================
//
// Calculates dashboard fee statistics.
//
// IMPORTANT:
// fee_transactions can contain multiple transactions
// for the same student.
//
// Therefore:
// - latest_fee gets the latest fee structure per student
// - payment_totals calculates all payments per student
//
// ==================================================

app.get(
    "/api/fees/dashboard-summary",
    requireAuth,
    requireAdmin,
    async (req, res) => {

        try {

            const result = await pool.query(
                `
                WITH latest_fee AS (

                    SELECT DISTINCT ON (student_id)

                        student_id,

                        total_fee,

                        discount,

                        course_name

                    FROM fee_transactions

                    ORDER BY
                        student_id,
                        id DESC
                ),

                payment_totals AS (

                    SELECT

                        student_id,

                        COALESCE(
                            SUM(amount_paid),
                            0
                        ) AS total_paid

                    FROM fee_transactions

                    GROUP BY student_id
                ),

                student_fee_summary AS (

                    SELECT

                        lf.student_id,

                        GREATEST(
                            COALESCE(lf.total_fee, 0)
                            -
                            COALESCE(lf.discount, 0),
                            0
                        ) AS net_fee,

                        COALESCE(
                            pt.total_paid,
                            0
                        ) AS total_paid

                    FROM latest_fee lf

                    LEFT JOIN payment_totals pt
                        ON pt.student_id = lf.student_id
                )

                SELECT

                    COUNT(*) AS fee_students,

                    COALESCE(
                        SUM(net_fee),
                        0
                    ) AS total_fee,

                    COALESCE(
                        SUM(total_paid),
                        0
                    ) AS total_collected,

                    COALESCE(
                        SUM(
                            GREATEST(
                                net_fee - total_paid,
                                0
                            )
                        ),
                        0
                    ) AS total_pending,

                    COUNT(
                        CASE
                            WHEN total_paid >= net_fee
                            THEN 1
                        END
                    ) AS paid_students,

                    COUNT(
                        CASE
                            WHEN total_paid > 0
                            AND total_paid < net_fee
                            THEN 1
                        END
                    ) AS partial_students,

                    COUNT(
                        CASE
                            WHEN total_paid = 0
                            THEN 1
                        END
                    ) AS pending_students

                FROM student_fee_summary
                `
            );


            const summary =
                result.rows[0] || {};


            res.json({

                success: true,

                summary: {

                    fee_students:
                        Number(
                            summary.fee_students || 0
                        ),

                    total_fee:
                        Number(
                            summary.total_fee || 0
                        ),

                    total_collected:
                        Number(
                            summary.total_collected || 0
                        ),

                    total_pending:
                        Number(
                            summary.total_pending || 0
                        ),

                    paid_students:
                        Number(
                            summary.paid_students || 0
                        ),

                    partial_students:
                        Number(
                            summary.partial_students || 0
                        ),

                    pending_students:
                        Number(
                            summary.pending_students || 0
                        ),
                },

            });

        } catch (error) {

            console.error(
                "Fees dashboard summary error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to load fee dashboard summary.",

            });

        }
    }
);

// ==================================================
// STUDENT: MY FEE REPORT
// VIEW ONLY
// ==================================================

app.get(
    "/api/fees/my-fees",
    requireAuth,
    requireStudent,
    async (req, res) => {

        try {

            const userId =
                req.session.user.id;

            // ------------------------------------------
            // STUDENT PROFILE
            // ------------------------------------------

            const studentResult =
                await pool.query(
                    `
                    SELECT

                        u.id AS user_id,

                        u.name,

                        u.email,

                        sm.student_id,

                        sm.phone,

                        sm.course,

                        sm.batch,

                        sm.admission_date

                    FROM users u

                    INNER JOIN student_master sm
                        ON sm.user_id = u.id

                    WHERE
                        u.id = $1

                    LIMIT 1
                    `,
                    [userId]
                );

            if (
                studentResult.rows.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Student profile not found.",
                });
            }

            const student =
                studentResult.rows[0];

            // ------------------------------------------
            // FEE TRANSACTIONS
            // ------------------------------------------

            const transactionResult =
                await pool.query(
                    `
                    SELECT

                        id,

                        course_name,

                        total_fee,

                        discount,

                        (
                            total_fee - discount
                        ) AS net_fee,

                        amount_paid,

                        payment_date,

                        payment_mode,

                        transaction_number,

                        receipt_number,

                        remarks,

                        created_at

                    FROM fee_transactions

                    WHERE
                        student_id = $1

                    ORDER BY
                        id DESC
                    `,
                    [userId]
                );

            const transactions =
                transactionResult.rows;

            // ------------------------------------------
            // SUMMARY
            // ------------------------------------------

            let summary = {
                total_fee: 0,
                discount: 0,
                net_fee: 0,
                total_paid: 0,
                pending_amount: 0,
                payment_status:
                    "Pending",
            };

            if (
                transactions.length > 0
            ) {

                const latest =
                    transactions[0];

                const totalFee =
                    Number(
                        latest.total_fee || 0
                    );

                const discount =
                    Number(
                        latest.discount || 0
                    );

                const netFee =
                    Math.max(
                        totalFee -
                        discount,
                        0
                    );

                const totalPaid =
                    transactions.reduce(
                        (
                            total,
                            transaction
                        ) =>
                            total +
                            Number(
                                transaction.amount_paid ||
                                0
                            ),
                        0
                    );

                const pending =
                    Math.max(
                        netFee -
                        totalPaid,
                        0
                    );

                summary = {
                    total_fee:
                        totalFee,

                    discount:
                        discount,

                    net_fee:
                        netFee,

                    total_paid:
                        totalPaid,

                    pending_amount:
                        pending,

                    payment_status:
                        pending <= 0
                            ? "Paid"
                            : totalPaid > 0
                                ? "Partial"
                                : "Pending",
                };
            }

            res.json({

                success: true,

                student,

                summary,

                transactions,
            });

        } catch (error) {

            console.error(
                "My fee report error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to load fee report.",
            });
        }
    }
);


// ==================================================
// HEALTH CHECK
// ==================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({
            success: true,
            message:
                "Future Lines Admin API is running",
        });
    }
);


// ==================================================
// SERVE REACT PRODUCTION FILES
// ==================================================

const frontendPath =
    path.join(
        __dirname,
        "../dist"
    );

app.use(
    express.static(
        frontendPath
    )
);


// ==================================================
// REACT SPA FALLBACK
// ==================================================

app.get(
    "/{*splat}",
    (req, res) => {

        res.sendFile(
            path.join(
                frontendPath,
                "index.html"
            )
        );
    }
);


// ==================================================
// START SERVER
// ==================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Future Lines Admin running on port ${PORT}`
        );
    }
);
