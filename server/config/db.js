import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;


// =====================================================
// GET CURRENT FILE DIRECTORY
// =====================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// =====================================================
// LOAD .ENV FROM PROJECT ROOT
// =====================================================

dotenv.config({
    path: path.resolve(__dirname, "../../.env"),
});


// =====================================================
// CHECK DATABASE URL
// =====================================================

console.log(
    "DATABASE_URL exists:",
    !!process.env.DATABASE_URL
);

console.log(
    "DATABASE_URL type:",
    typeof process.env.DATABASE_URL
);


if (!process.env.DATABASE_URL) {

    console.error(
        "❌ DATABASE_URL is missing from environment variables."
    );

    process.exit(1);
}


// =====================================================
// CREATE POSTGRESQL POOL
// =====================================================

const pool = new Pool({

    connectionString:
        process.env.DATABASE_URL,

    ssl:
        process.env.NODE_ENV === "production"
            ? {
                  rejectUnauthorized: false,
              }
            : false,

});


// =====================================================
// DATABASE ERROR
// =====================================================

pool.on("error", (err) => {

    console.error(
        "Unexpected PostgreSQL error:",
        err
    );

});


// =====================================================
// EXPORT
// =====================================================

export default pool;
