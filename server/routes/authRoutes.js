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

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });

        }


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
            `,
            [email.trim()]
        );


        if (result.rows.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });

        }


        const user = result.rows[0];


        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });

        }


        // =================================================
        // SAVE USER IN SESSION
        // =================================================

        req.session.user = {

            id: user.id,

            name: user.name,

            email: user.email,

            role: user.role,

            mustChangePassword:
                user.must_change_password,

        };


        res.json({

            success: true,

            message: "Login successful.",

            user: req.session.user,

        });


    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({

            success: false,

            message: "Server error during login.",

        });

    }

});


// =====================================================
// CURRENT LOGGED-IN USER
// =====================================================

router.get("/me", (req, res) => {

    if (!req.session || !req.session.user) {

        return res.status(401).json({

            success: false,

            message: "Not authenticated.",

        });

    }


    res.json({

        success: true,

        user: req.session.user,

    });

});


// =====================================================
// LOGOUT
// =====================================================

router.post("/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            console.error("Logout error:", error);

            return res.status(500).json({

                success: false,

                message: "Logout failed.",

            });

        }


        res.clearCookie("connect.sid");


        res.json({

            success: true,

            message: "Logout successful.",

        });

    });

});


// =====================================================
// CHANGE PASSWORD
// STUDENT + ADMIN
// =====================================================

router.post("/change-password", async (req, res) => {

    try {

        if (!req.session || !req.session.user) {

            return res.status(401).json({

                success: false,

                message: "Authentication required.",

            });

        }


        const {
            currentPassword,
            newPassword,
        } = req.body;


        if (!currentPassword || !newPassword) {

            return res.status(400).json({

                success: false,

                message:
                    "Current password and new password are required.",

            });

        }


        if (newPassword.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must contain at least 6 characters.",

            });

        }


        const result = await pool.query(

            `
            SELECT password
            FROM users
            WHERE id = $1
            `,

            [req.session.user.id]

        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "User not found.",

            });

        }


        const user = result.rows[0];


        const passwordMatch = await bcrypt.compare(

            currentPassword,

            user.password

        );


        if (!passwordMatch) {

            return res.status(400).json({

                success: false,

                message: "Current password is incorrect.",

            });

        }


        const hashedPassword = await bcrypt.hash(

            newPassword,

            12

        );


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
                req.session.user.id,
            ]

        );


        req.session.user.mustChangePassword = false;


        res.json({

            success: true,

            message: "Password changed successfully.",

        });


    } catch (error) {

        console.error(
            "Change password error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to change password.",

        });

    }

});


export default router;
