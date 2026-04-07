// controllers/adminController.js
import { createJob, getJobs, getJobById, getAdminDashboard, updateJob, deleteJob, getCompanies } from "../models/jobModel.js";
import { getApplications, getApplicationsByJob, getApplicationById, updateApplicationStatus } from "../models/applicationModel.js";


/**
 * GET /api/admin/dashboard
 * Protected: admin only
 */
export const dashboard = async (req, res) => {
    try {
        const months = parseInt(req.query.months || "5", 10);
        const data = await getAdminDashboard(months);
        return res.json(data);
    } catch (err) {
        console.error("adminController.dashboard:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * GET /api/admin/jobs
 * Protected: admin only 
 */
export const listJobs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit || "20", 10);
        const offset = parseInt(req.query.offset || "0", 10);
        const status = req.query.status; // optional
        const search = req.query.search;
        const user_id = req.query.user_id ? parseInt(req.query.user_id, 10) : undefined;

        const rows = await getJobs(limit, offset, { status, user_id, search });
        return res.json({ jobs: rows });
    } catch (err) {
        console.error("adminController.listJobs:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * GET /api/admin/companies
 * Public/Admin: list distinct companies
 */
export const listCompanies = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit || "20", 10);
        const offset = parseInt(req.query.offset || "0", 10);
        const search = req.query.search;

        const rows = await getCompanies({ search, limit, offset });
        return res.json({ companies: rows });
    } catch (err) {
        console.error("adminController.listCompanies:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const createJobHandler = async (req, res) => {
    try {
        const {
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
            visibility,
            status,
        } = req.body || {};

        if (!title || typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({ error: "title is required" });
        }

        const userId = req.user?.sub || req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "User ID is required" });
        }
        const payload = {
            user_id: userId,
            title: title.trim(),
            company_name: company_name?.trim() ?? null,
            location: location?.trim() ?? null,
            is_remote: Boolean(is_remote),
            job_type: job_type ?? null,
            category: category ?? null,
            experience_level: experience_level ?? null,
            salary_min: salary_min ?? null,
            salary_max: salary_max ?? null,
            salary_text: salary_text ?? null,
            application_deadline: application_deadline ? new Date(application_deadline) : null,
            application_link: application_link ?? null,
            contact_email: contact_email ?? null,
            description: description ?? null,
            requirements: requirements ?? null,
            benefits: benefits ?? null,
            is_urgent: Boolean(is_urgent),
            is_featured: Boolean(is_featured),
            visibility: visibility ?? {},
            status: status ?? "active",
        };

        const job = createJob(payload);
        return res.status(201).json({ job });
    } catch (err) {
        console.error("adminController.createJobHandler:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

/**
 * GET /api/admin/jobs/:id
 * Protected: admin only
 */
export const getJob = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id) return res.status(400).json({ error: "Invalid job id" });

        const job = await getJobById(id);
        if (!job) return res.status(404).json({ error: "Job not found" });
        return res.json({ job });
    } catch (err) {
        console.error("adminController.getJob:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * PUT /api/admin/jobs/:id
 * Protected: admin only
 */
export const updateJobHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id) return res.status(400).json({ error: "Invalid job id" });
        const fields = { ...req.body };
        if (fields.visibility && typeof fields.visibility !== "string") {
            try {
                fields.visibility = fields.visibility;
            } catch (e) {
                fields.visibility = {};
            }
        }
        const updated = await updateJob(id, fields);
        if (!updated) return res.status(404).json({ error: "Job not found" });
        return res.json({ job: updated });
    } catch (err) {
        console.error("adminController.updateJobHandler:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * DELETE /api/admin/jobs/:id
 * Protected: admin only
 */
export const deleteJobHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id) return res.status(400).json({ error: "Invalid job id" });

        const hard = req.query.hard === "true";
        const deleted = await deleteJob(id, { hard });
        if (!deleted) return res.status(404).json({ error: "Job not found" });
        return res.json({ job: deleted });
    } catch (err) {
        console.error("adminController.deleteJobHandler:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};



/**
 * GET /api/admin/applications
 * Protected: admin only
 */
export const listApplications = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit || "20", 10);
        const offset = parseInt(req.query.offset || "0", 10);
        const status = req.query.status;
        const search = req.query.search;
        const user_id = req.query.user_id ? parseInt(req.query.user_id, 10) : undefined;
        const job_id = req.query.job_id ? parseInt(req.query.job_id, 10) : undefined;

        const rows = await getApplications(limit, offset, { status, user_id, job_id, search });
        return res.json({ applications: rows });
    } catch (err) {
        console.error("adminController.listApplications:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * GET /api/admin/jobs/:id/applications
 * Protected: admin only
 */
export const listApplicationsByJob = async (req, res) => {
    try {
        const jobId = parseInt(req.params.id, 10);
        if (!jobId) return res.status(400).json({ error: "Invalid job id" });

        const applications = await getApplicationsByJob(jobId);
        return res.json({ applications });
    } catch (err) {
        console.error("adminController.listApplicationsByJob:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * GET /api/admin/applications/:id
 * Protected: admin only
 */
export const getApplicationDetail = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id) return res.status(400).json({ error: "Invalid application id" });

        const application = await getApplicationById(id);
        if (!application) return res.status(404).json({ error: "Application not found" });
        return res.json({ application });
    } catch (err) {
        console.error("adminController.getApplicationDetail:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * PATCH /api/admin/applications/:id/status
 * Protected: admin only
 * Body: { status, admin_notes? }
 */
const ALLOWED_STATUSES = ["pending", "reviewed", "shortlisted", "rejected", "interview_scheduled", "hired"];

export const updateApplicationStatusHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id) return res.status(400).json({ error: "Invalid application id" });

        const { status, admin_notes, interview_date } = req.body;

        if (!status || !ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(", ")}`
            });
        }

        let parsedDate = null;
        if (interview_date) {
            parsedDate = new Date(interview_date);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({ error: "Invalid interview_date format" });
            }
        }
        const updated = await updateApplicationStatus(id, status, admin_notes || null, parsedDate);
        if (!updated) return res.status(404).json({ error: "Application not found" });

        return res.json({ application: updated });
    } catch (err) {
        console.error("adminController.updateApplicationStatusHandler:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
