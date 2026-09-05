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


// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config();


// =====================================================
// CREATE EXPRESS APP
// =====================================================

const app = express();

const PORT = process.env.PORT || 5000;


// =====================================================
// FILE PATHS
// =====================================================

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


// =====================================================
// TRUST PROXY
// IMPORTANT FOR RENDER
// =====================================================

if (
    process.env.NODE_ENV === "production"
) {
    app.set("trust proxy", 1);
}


// =====================================================
// CORS
// =====================================================

const frontendURL =
    process.env.FRONTEND_URL ||
    "http://localhost:5173";


console.log(
    "FRONTEND URL:",
    frontendURL
);


app.use(
    cors({

        origin: frontendURL,

        credentials: true

    })
);


// =====================================================
// BODY PARSER
// =====================================================

app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended: true
    })
);


// =====================================================
// POSTGRESQL SESSION STORE
// =====================================================

const PgSession =
    connectPgSimple(session);


// =====================================================
// SESSION
// =====================================================

app.use(
    session({

        store:
            new PgSession({

                pool: pool,

                tableName:
                    "user_sessions",

                createTableIfMissing:
                    true

            }),

        secret:
            process.env.SESSION_SECRET ||
            "future-lines-secret-change-this",

        resave: false,

        saveUninitialized: false,

        rolling: true,

        cookie: {

            name: "connect.sid",

            httpOnly: true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",

            maxAge:
                1000 *
                60 *
                60 *
                8

        }

    })
);


// =====================================================
// AUTH ROUTES
// =====================================================

app.use(
    "/api/auth",
    authRoutes
);


// =====================================================
// STUDENT ROUTES
// =====================================================

app.use(
    "/api/students",
    studentRoutes
);


// =====================================================
// ATTENDANCE ROUTES
// =====================================================

app.use(
    "/api/attendance",
    attendanceRoutes
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
    "/api/health",
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "Future Lines Admin API is running"

        });

    }
);


// =====================================================
// SERVE REACT PRODUCTION BUILD
// =====================================================

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


// =====================================================
// REACT SPA FALLBACK
// EXPRESS 5
// =====================================================

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


// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "UNHANDLED SERVER ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }
);


// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Future Lines Admin running on port ${PORT}`
        );

        console.log(
            `Environment: ${
                process.env.NODE_ENV || "development"
            }`
        );

    }
);
