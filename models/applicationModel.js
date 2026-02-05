// models/applicationModel.js
import { pool } from "../config/db.js";

export const createApplication = async (jobId, userId) => {
    const query = `
        INSERT INTO job_applications (job_id, user_id)
        VALUES ($1, $2)
        RETURNING *
    `;
    const { rows } = await pool.query(query, [jobId, userId]);
    return rows[0];
};

export const getApplication = async (jobId, userId) => {
    const query = `SELECT id FROM job_applications WHERE job_id=$1 AND user_id=$2`;
    const { rows } = await pool.query(query, [jobId, userId]);
    return rows[0];
};

