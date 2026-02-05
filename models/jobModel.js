// models/jobModel.js
import { pool } from "../config/db.js";

/**
 * Create a new job
 * @param {Object} job - job payload
 * @returns {Object} inserted job row
 */
export const createJob = async (job) => {
    const {
        user_id,
        title,
        company_name,
        location,
        is_remote = false,
        job_type,
        category,
        experience_level,
        salary_min = null,
        salary_max = null,
        salary_text = null,
        application_deadline = null,
        application_link = null,
        contact_email = null,
        description = null,
        requirements = null,
        benefits = null,
        is_urgent = false,
        is_featured = false,
        visibility = {},
        status = "active",
    } = job;

    const q = `
    INSERT INTO jobs (
      user_id, title, company_name, location, is_remote, job_type, category, experience_level,
      salary_min, salary_max, salary_text, application_deadline, application_link, contact_email,
      description, requirements, benefits, is_urgent, is_featured, visibility, status, posted_at, updated_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,
      $9,$10,$11,$12,$13,$14,
      $15,$16,$17,$18,$19,$20,$21, now(), now()
    ) RETURNING *;
  `;

    const values = [
        user_id,
        title,
        company_name,
        location,
        is_remote,
        job_type,
        category,
        experience_level,
        salary_min,
        salary_max,
        salary_text,
        application_deadline,
        application_link,
        contact_email,
        description,
        requirements,
        benefits,
        is_urgent,
        is_featured,
        JSON.stringify(visibility || {}),
        status,
    ];

    const { rows } = await pool.query(q, values);
    return rows[0];
};

/**
 * Get list of jobs (with optional pagination)
 * @param {number} limit
 * @param {number} offset
 * @param {Object} opts - optional filters { status, user_id, search }
 */
export const getJobs = async (limit = 20, offset = 0, opts = {}) => {
    const { status, user_id, search } = opts;

    // Base query
    let q = `
    SELECT
      id, user_id, title, company_name, location, is_remote, job_type, category, experience_level,
      salary_min, salary_max, salary_text, application_deadline, application_link, contact_email,
      description, requirements, benefits, is_urgent, is_featured, visibility, status, posted_at, updated_at
    FROM jobs
  `;

    const conditions = [];
    const values = [];

    if (typeof status === "string") {
        values.push(status);
        conditions.push(`status = $${values.length}`);
    }

    if (typeof user_id !== "undefined" && user_id !== null) {
        values.push(user_id);
        conditions.push(`user_id = $${values.length}`);
    }

    if (search) {
        // simple ILIKE across title and company_name (you can use full-text search if available)
        values.push(`%${search}%`);
        values.push(`%${search}%`);
        conditions.push(`(title ILIKE $${values.length - 1} OR company_name ILIKE $${values.length})`);
    }

    if (conditions.length) {
        q += ` WHERE ${conditions.join(" AND ")}`;
    }

    q += ` ORDER BY posted_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2};`;
    values.push(limit, offset);

    const { rows } = await pool.query(q, values);
    return rows;
};

/**
 * Get a single job by id (full row)
 * @param {number} id
 */
export const getJobById = async (id) => {
    const q = `SELECT * FROM jobs WHERE id = $1`;
    const { rows } = await pool.query(q, [id]);
    return rows[0] || null;
};

/**
 * Update a job (partial update)
 * @param {number} id
 * @param {Object} fields - fields to update
 */
export const updateJob = async (id, fields = {}) => {
    // Build dynamic SET clause
    const keys = Object.keys(fields);
    if (keys.length === 0) return getJobById(id);

    const sets = keys.map((k, idx) => `"${k}" = $${idx + 1}`);
    const values = keys.map((k) => {
        // If updating visibility, ensure it's JSON string
        if (k === "visibility" && typeof fields[k] !== "string") {
            return JSON.stringify(fields[k] || {});
        }
        return fields[k];
    });

    // push updated_at
    values.push(new Date());
    const updatedAtIndex = values.length;

    const q = `
    UPDATE jobs
    SET ${sets.join(", ")}, updated_at = $${updatedAtIndex}
    WHERE id = $${updatedAtIndex + 1}
    RETURNING *;
  `;

    values.push(id);
    const { rows } = await pool.query(q, values);
    return rows[0] || null;
};

/**
 * Soft delete (mark status closed) or hard delete
 * @param {number} id
 * @param {Object} opts - { hard: boolean }
 */
export const deleteJob = async (id, opts = { hard: false }) => {
    if (opts.hard) {
        const { rows } = await pool.query(`DELETE FROM jobs WHERE id = $1 RETURNING *;`, [id]);
        return rows[0] || null;
    } else {
        const { rows } = await pool.query(`UPDATE jobs SET status = 'closed', updated_at = now() WHERE id = $1 RETURNING *;`, [id]);
        return rows[0] || null;
    }
};

/**
 * Recent jobs (limit)
 */
// export const getRecentJobs = async (limit = 5) => {
//     const q = `
//     SELECT id, title, company_name, location, is_remote, job_type, is_urgent, is_featured, status, posted_at
//     FROM jobs
//     ORDER BY posted_at DESC
//     LIMIT $1;
//   `;
//     const { rows } = await pool.query(q, [limit]);
//     return rows;
// };

/**
 * Dashboard aggregates:
 * - counts: total jobs, active jobs, total applications
 * - monthly applications for last N months
 * - recent jobs
 */
export const getAdminDashboard = async (months = 5) => {
    // counts
    const countsQ = `
    SELECT
      (SELECT COUNT(*) FROM jobs)::INT AS total_jobs,
      (SELECT COUNT(*) FROM jobs WHERE status = 'active')::INT AS active_jobs,
      (SELECT COUNT(*) FROM applications)::INT AS total_applications
  `;
    const countsRes = await pool.query(countsQ);
    const counts = countsRes.rows[0] || { total_jobs: 0, active_jobs: 0, total_applications: 0 };

    // monthly applications for last `months+1` months (including current)
    const monthlyQ = `
    SELECT to_char(date_trunc('month', created_at), 'Mon') AS month_label,
           date_trunc('month', created_at) AS month_start,
           COUNT(*)::INT AS cnt
    FROM applications
    WHERE created_at >= (date_trunc('month', now()) - ($1::int || ' months')::interval)
    GROUP BY month_start
    ORDER BY month_start;
  `;
    const monthlyRes = await pool.query(monthlyQ, [months]);
    const monthly = monthlyRes.rows || [];

    // recent jobs
    const recentJobsQ = `
    SELECT id, title, company_name, posted_at, is_active, status
    FROM jobs
    ORDER BY posted_at DESC
    LIMIT 5;
  `;
    const recentJobsRes = await pool.query(recentJobsQ);
    const recentJobs = recentJobsRes.rows || [];

    return { counts, monthly, recentJobs };
};
