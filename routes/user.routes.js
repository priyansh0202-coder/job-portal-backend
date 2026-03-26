// routes/user.routes.js
import express from "express";
import { registerUser, loginUser, logoutUser, googleLogin } from "../controllers/authControllers.js";
import { applyJob, getApplyStatus, getUserApplications } from "../controllers/userController.js";
import { verifyToken, onlyUser } from "../middlewares/auth.js";
import { uploadResume, handleMulterError } from "../middlewares/uploadResume.js";

const router = express.Router();

// Register a new user
router.post("/register", registerUser); 

// Login a user
router.post("/login", loginUser);

router.post("/logout", logoutUser);

// Google OAuth login
router.post("/google", googleLogin);

// Apply for a job with resume upload (pdf/docx) and cover letter
router.post("/apply/:jobId", verifyToken, onlyUser, uploadResume, handleMulterError, applyJob);

router.get("/apply/:jobId/status", verifyToken, onlyUser, getApplyStatus);

// Get list of jobs the user has applied to
router.get("/my-applications", verifyToken, onlyUser, getUserApplications);

export default router;