// controllers/userController.js
import { createApplication, getApplication } from "../models/applicationModel.js";

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

        // 2. Apply
        const application = await createApplication(jobId, userId);

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
