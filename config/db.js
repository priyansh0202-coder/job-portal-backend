// // db.js
// import pkg from "pg";
// import dotenv from "dotenv";

// dotenv.config();

// const { Pool } = pkg;

// // create connection pool
// export const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
// });

// // test connection
// pool.connect()
//     .then(() => console.log("✅ Connected to PostgreSQL"))
//     .catch((err) => console.error("❌ PostgreSQL connection error:", err));


// db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
        process.env.NODE_ENV === "production"
            ? { require: true, rejectUnauthorized: false }
            : false,
});

// test connection
pool
    .connect()
    .then(() => console.log("✅ Connected to PostgreSQL"))
    .catch((err) =>
        console.error("❌ PostgreSQL connection error:", err.message)
    );

