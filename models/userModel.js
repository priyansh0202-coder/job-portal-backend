// models/userModel.js
import { pool } from "../config/db.js";

export const getUserByEmail = async (email) => {
    const query = "SELECT * FROM users WHERE email = $1 LIMIT 1";
    const values = [email];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
};

export const getUserById = async (id) => {
    const query = "SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1";
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
};

export const createUser = async (name, email, passwordHash, role = "user") => {
    const query = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
  `;
    const values = [name, email, passwordHash, role];
    const { rows } = await pool.query(query, values);
    return rows[0];
};
