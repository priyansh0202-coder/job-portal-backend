// routes/admin.routes.js

import express from "express";
import { createJobHandler, getJob, updateJobHandler, deleteJobHandler, listJobs, dashboard } from "../controllers/adminController.js";

import { verifyToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// Create a new job
router.post("/jobs", verifyToken, requireRole("admin"), createJobHandler);

// Admin dashboard
router.get("/dashboard", verifyToken, requireRole("admin"), dashboard);



// Get single job
router.get("/jobs/:id", verifyToken, requireRole("admin"), getJob);

// Jobs listing for admin (with pagination / filters)
router.get("/jobs", listJobs);

// Update job
router.put("/jobs/:id", verifyToken, requireRole("admin"), updateJobHandler);

// Delete job (soft by default, hard if ?hard=true)
router.delete("/jobs/:id", verifyToken, requireRole("admin"), deleteJobHandler);

export default router;