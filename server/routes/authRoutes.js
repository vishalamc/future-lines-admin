import express from "express";
import bcrypt from "bcryptjs";

import pool from "../config/db.js";

const router = express.Router();


// =====================================================
// LOGIN
// ADMIN + STUDENT
// =====================================================

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        // -------------------------------------------------
        // Validate input
        // -------------------------------------------------

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });

        }

        const cleanEmail = email.trim();

        console.log("----------------------------------------");
        console.log("LOGIN REQUEST:", cleanEmail);


        // -------------------------------------------------
        // Find user
        // -------------------------------------------------

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                password,
                role,
                must_change_password
            FROM users
            WHERE LOWER(email) = LOWER($1)
            LIMIT 1
            `,
            [cleanEmail]
        );


        console.log(
            "USER FOUND:",
            result.rows.length
        );


        // -------------------------------------------------
        // User not found
        // -------------------------------------------------

        if (result.rows.length === 0) {

            console.log("LOGIN FAILED: USER NOT FOUND");

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }


        const user = result.rows[0];


        // -------------------------------------------------
        // Compare password
        // -------------------------------------------------

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordMatch) {

            console.log("LOGIN FAILED: WRONG PASSWORD");

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }


        console.log(
            "PASSWORD VERIFIED FOR USER:",
            user.id
        );


        // =================================================
        // CREATE SESSION
        // =================================================

        req.session.user = {

            id: user.id,

            name: user.name,

            email: user.email,

            role: user.role,

            mustChangePassword:
                user.must_change_password ?? false

        };


        console.log(
            "SESSION USER CREATED:",
            req.session.user
        );


        // =================================================
        // SAVE SESSION TO POSTGRESQL
        // =================================================

        req.session.save((error) => {

            if (error) {

                console.error(
                    "SESSION SAVE ERROR:",
                    error
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to create login session."

                });

            }


            console.log(
                "SESSION SAVED ID:",
                req.sessionID
            );


            console.log(
                "SESSION SAVED USER:",
                req.session.user
            );


            console.log("----------------------------------------");


            // -------------------------------------------------
            // Send response
            // -------------------------------------------------

            return res.status(200).json({

                success: true,

                message: "Login successful.",

                user: req.session.user

            });

        });


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error during login."

        });

    }

});


// =====================================================
// CURRENT LOGGED-IN USER
// GET /api/auth/me
// =====================================================

router.get("/me", async (req, res) => {

    try {

        console.log("----------------------------------------");
        console.log("ME REQUEST");

        console.log(
            "SESSION ID:",
            req.sessionID
        );

        console.log(
            "COOKIE HEADER:",
            req.headers.cookie || "NO COOKIE"
        );

        console.log(
            "SESSION USER:",
            req.session?.user
        );


        // -------------------------------------------------
        // Check authentication
        // -------------------------------------------------

        if (
            !req.session ||
            !req.session.user
        ) {

            console.log(
                "ME RESULT: NOT AUTHENTICATED"
            );

            console.log("----------------------------------------");


            return res.status(401).json({

                success: false,

                message:
                    "Not authenticated."

            });

        }


        // -------------------------------------------------
        // User is authenticated
        // -------------------------------------------------

        console.log(
            "ME RESULT: AUTHENTICATED USER",
            req.session.user
        );

        console.log("----------------------------------------");


        return res.status(200).json({

            success: true,

            user: req.session.user

        });

    } catch (error) {

        console.error(
            "ME ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to verify authentication."

        });

    }

});


// =====================================================
// LOGOUT
// POST /api/auth/logout
// =====================================================

router.post("/logout", (req, res) => {

    console.log("----------------------------------------");
    console.log("LOGOUT REQUEST");

    console.log(
        "SESSION ID:",
        req.sessionID
    );


    // -------------------------------------------------
    // No session
    // -------------------------------------------------

    if (!req.session) {

        return res.json({

            success: true,

            message:
                "Already logged out."

        });

    }


    // -------------------------------------------------
    // Destroy session
    // -------------------------------------------------

    req.session.destroy((error) => {

        if (error) {

            console.error(
                "LOGOUT ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Logout failed."

            });

        }


        // -------------------------------------------------
        // Clear browser cookie
        // -------------------------------------------------

        res.clearCookie(
            "connect.sid",
            {
                httpOnly: true,

                secure:
                    process.env.NODE_ENV === "production",

                sameSite:
                    process.env.NODE_ENV === "production"
                        ? "none"
                        : "lax"
            }
        );


        console.log(
            "LOGOUT SUCCESSFUL"
        );

        console.log("----------------------------------------");


        return res.status(200).json({

            success: true,

            message:
                "Logout successful."

        });

    });

});


// =====================================================
// CHANGE PASSWORD
// POST /api/auth/change-password
// ADMIN + STUDENT
// =====================================================

router.post(
    "/change-password",
    async (req, res) => {

        try {

            // -------------------------------------------------
            // Check authentication
            // -------------------------------------------------

            if (
                !req.session ||
                !req.session.user
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Authentication required."

                });

            }


            const {
                currentPassword,
                newPassword
            } = req.body;


            // -------------------------------------------------
            // Validate passwords
            // -------------------------------------------------

            if (
                !currentPassword ||
                !newPassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Current password and new password are required."

                });

            }


            if (
                newPassword.length < 6
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "New password must contain at least 6 characters."

                });

            }


            const userId =
                req.session.user.id;


            // -------------------------------------------------
            // Get current password
            // -------------------------------------------------

            const result = await pool.query(
                `
                SELECT
                    id,
                    password
                FROM users
                WHERE id = $1
                LIMIT 1
                `,
                [userId]
            );


            if (result.rows.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }


            const user =
                result.rows[0];


            // -------------------------------------------------
            // Verify current password
            // -------------------------------------------------

            const passwordMatch =
                await bcrypt.compare(
                    currentPassword,
                    user.password
                );


            if (!passwordMatch) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Current password is incorrect."

                });

            }


            // -------------------------------------------------
            // Hash new password
            // -------------------------------------------------

            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    12
                );


            // -------------------------------------------------
            // Update password
            // -------------------------------------------------

            await pool.query(
                `
                UPDATE users
                SET
                    password = $1,
                    must_change_password = FALSE
                WHERE id = $2
                `,
                [
                    hashedPassword,
                    userId
                ]
            );


            // -------------------------------------------------
            // Update session
            // -------------------------------------------------

            req.session.user.mustChangePassword =
                false;


            req.session.save((error) => {

                if (error) {

                    console.error(
                        "SESSION SAVE ERROR:",
                        error
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            "Password changed but session update failed."

                    });

                }


                return res.status(200).json({

                    success: true,

                    message:
                        "Password changed successfully."

                });

            });

        } catch (error) {

            console.error(
                "CHANGE PASSWORD ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to change password."

            });

        }

    }
);


export default router;
