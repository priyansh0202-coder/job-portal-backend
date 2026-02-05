// routes/user.routes.js
import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/authControllers.js";
import { applyJob, getApplyStatus } from "../controllers/userController.js";
import { verifyToken, onlyUser } from "../middlewares/auth.js";
import { uploadResume, handleMulterError } from "../middlewares/uploadResume.js";

const router = express.Router();

// Register a new user
router.post("/register", registerUser); 

// Login a user
router.post("/login", loginUser);

router.post("/logout", logoutUser);

// Apply for a job with resume upload (pdf/docx) and cover letter
router.post("/apply/:jobId", verifyToken, onlyUser, uploadResume, handleMulterError, applyJob);

router.get("/apply/:jobId/status", verifyToken, onlyUser, getApplyStatus);

export default router;