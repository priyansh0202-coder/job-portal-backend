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

export const getApplicationsByUser = async (userId) => {
    const query = `
        SELECT 
            ja.id as application_id,
            ja.job_id,
            ja.user_id,
            ja.resume_url,
            ja.cover_letter,
            ja.status as application_status,
            ja.applied_at,
            j.title,
            j.company_name,
            j.location,
            j.is_remote,
            j.job_type,
            j.category,
            j.experience_level,
            j.salary_min,
            j.salary_max,
            j.salary_text,
            j.application_deadline,
            j.application_link,
            j.contact_email,
            j.description,
            j.requirements,
            j.benefits,
            j.is_urgent,
            j.is_featured,
            j.visibility,
            j.status as job_status,
            j.posted_at,
            j.updated_at
        FROM job_applications ja
        INNER JOIN jobs j ON ja.job_id = j.id
        WHERE ja.user_id = $1
        ORDER BY ja.applied_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
};

