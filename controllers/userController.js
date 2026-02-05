// controllers/userController.js
import { createApplication, getApplication, getApplicationsByUser } from "../models/applicationModel.js";

export const applyJob = async (req, res) => {
    try {
        const userId = req.user.sub || req.user.id; // handle both sub (standard) and id
        const jobId = parseInt(req.params.jobId, 10);

        if (!jobId) {
            return res.status(400).json({ message: "Invalid Job ID" });
        }

        // 1. Check duplicate
        const exists = await getApplication(jobId, userId);

        if (exists) {
            return res.status(400).json({ message: "Already applied" });
        }

        // 2. Get resume URL from uploaded file (if any)
        let resumeUrl = null;
        if (req.file) {
            // Store the relative path to access the file
            resumeUrl = `/uploads/resumes/${req.file.filename}`;
        }

        // 3. Get cover letter from request body
        const coverLetter = req.body.coverLetter || null;

        // 4. Apply with resume and cover letter
        const application = await createApplication(jobId, userId, resumeUrl, coverLetter);

        return res.status(201).json({
            message: "Applied successfully",
            application: application,
        });
    } catch (err) {
        console.error("applyJob error:", err);
        // Check for foreign key violation if job doesn't exist (code 23503)
        if (err.code === '23503') {
            return res.status(404).json({ message: "Job or User not found" });
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getApplyStatus = async (req, res) => {
    try {
        const userId = req.user.sub || req.user.id;
        const jobId = parseInt(req.params.jobId, 10);

        if (!jobId) {
            return res.status(400).json({ applied: false });
        }

        const application = await getApplication(jobId, userId);

        return res.json({
            applied: !!application
        });
    } catch (err) {
        console.error("getApplyStatus error:", err);
        return res.status(500).json({ applied: false });
    }
};

export const getUserApplications = async (req, res) => {
    try {
        const userId = req.user.sub || req.user.id;
        const applications = await getApplicationsByUser(userId);

        return res.json({
            count: applications.length,
            applications: applications
        });
    } catch (err) {
        console.error("getUserApplications error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
