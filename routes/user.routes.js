// routes/user.routes.js
import express from "express";
import { registerUser, loginUser} from "../controllers/authControllers.js";

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login a user
router.post("/login", loginUser);

export default router;