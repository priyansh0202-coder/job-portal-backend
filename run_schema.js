import fs from "fs";
import pkg from "pg";

const { Pool } = pkg;

const sql = fs.readFileSync("./schema.sql", "utf8");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }  // required for Render external DB
});

(async () => {
    try {
        console.log("⏳ Applying schema...");
        await pool.query(sql);
        console.log("✅ Schema applied successfully!");
    } catch (err) {
        console.error("❌ Error applying schema:", err);
    } finally {
        await pool.end();
    }
})();
