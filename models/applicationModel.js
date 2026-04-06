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

export const getApplicationsByJob = async (jobId) => {
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
        WHERE ja.job_id = $1
        ORDER BY ja.applied_at DESC
    `;
    const { rows } = await pool.query(query, [jobId]);
    return rows;
}

export const getApplications = async (limit = 20, offset = 0, filters = {}) => {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (filters.status) {
        conditions.push(`ja.status = $${idx++}`);
        params.push(filters.status);
    }
    if (filters.user_id) {
        conditions.push(`ja.user_id = $${idx++}`);
        params.push(filters.user_id);
    }
    if (filters.job_id) {
        conditions.push(`ja.job_id = $${idx++}`);
        params.push(filters.job_id);
    }
    if (filters.search) {
        conditions.push(`(j.title ILIKE $${idx} OR j.company_name ILIKE $${idx} OR u.name ILIKE $${idx})`);
        params.push(`%${filters.search}%`);
        idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

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
            j.job_type,
            j.category,
            u.name as applicant_name,
            u.email as applicant_email
        FROM job_applications ja
        INNER JOIN jobs j ON ja.job_id = j.id
        LEFT JOIN users u ON ja.user_id = u.id
        ${whereClause}
        ORDER BY ja.applied_at DESC
        LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return rows;
};

export const getApplicationById = async (applicationId) => {
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
            j.updated_at,
            u.name as applicant_name,
            u.email as applicant_email
        FROM job_applications ja
        INNER JOIN jobs j ON ja.job_id = j.id
        LEFT JOIN users u ON ja.user_id = u.id
        WHERE ja.id = $1
    `;
    const { rows } = await pool.query(query, [applicationId]);
    return rows[0];
};