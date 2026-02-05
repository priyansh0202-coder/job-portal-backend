// models/applicationModel.js
import { pool } from "../config/db.js";

export const createApplication = async (jobId, userId, resumeUrl = null, coverLetter = null) => {
    const query = `
        INSERT INTO job_applications (job_id, user_id, resume_url, cover_letter)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const { rows } = await pool.query(query, [jobId, userId, resumeUrl, coverLetter]);
    return rows[0];
};

export const getApplication = async (jobId, userId) => {
    const query = `SELECT id FROM job_applications WHERE job_id=$1 AND user_id=$2`;
    const { rows } = await pool.query(query, [jobId, userId]);
    return rows[0];
};

