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

// --------------------------------------------------
// Load Environment Variables
// --------------------------------------------------

dotenv.config();


// --------------------------------------------------
// Create Express App
// --------------------------------------------------

const app = express();

const PORT = process.env.PORT || 5000;


// --------------------------------------------------
// File Paths
// --------------------------------------------------

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


// --------------------------------------------------
// PostgreSQL Session Store
// --------------------------------------------------

const PgSession = connectPgSimple(session);


// --------------------------------------------------
// CORS
// IMPORTANT: CORS should come before API routes
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
// Body Parser
// --------------------------------------------------

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);


// --------------------------------------------------
// SESSION
// IMPORTANT:
// Session MUST come before protected routes
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


// --------------------------------------------------
// API ROUTES
// IMPORTANT:
// These MUST come AFTER session middleware
// --------------------------------------------------


// Authentication
app.use(
    "/api/auth",
    authRoutes
);


// Student Management
app.use(
    "/api/students",
    studentRoutes
);
// Attendance
app.use(
    "/api/attendance",
    attendanceRoutes
);

// --------------------------------------------------
// Health Check
// --------------------------------------------------

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


// --------------------------------------------------
// Serve React Production Files
// --------------------------------------------------

const frontendPath =
    path.join(
        __dirname,
        "../dist"
    );


app.use(
    express.static(frontendPath)
);


// --------------------------------------------------
// React SPA Fallback
// --------------------------------------------------

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


// --------------------------------------------------
// Start Server
// --------------------------------------------------

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Future Lines Admin running on port ${PORT}`
        );

    }
);