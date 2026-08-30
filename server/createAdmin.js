import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import pool from "./config/db.js";

dotenv.config();

async function createAdmin() {
    try {
        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Users table ready.");

        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            console.log("Admin already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await pool.query(
            `INSERT INTO users
             (name, email, password, role)
             VALUES ($1, $2, $3, $4)`,
            [
                "Future Lines Admin",
                email,
                hashedPassword,
                "admin",
            ]
        );

        console.log("Admin created successfully.");
        console.log("Email:", email);

        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
}

createAdmin();