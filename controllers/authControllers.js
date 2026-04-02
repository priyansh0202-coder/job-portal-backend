// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import { getUserByEmail, createUser, getUserById, getUserByGoogleId, createGoogleUser, linkGoogleId } from "../models/userModel.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (user) => jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none", // use "none" + secure=true for cross-domain prod
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const registerUser = async (req, res) => {
  try {
    // use let since we may mutate role
    let { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }

    name = name.trim();
    email = email.trim().toLowerCase();
    password = password.trim();

    const existing = await getUserByEmail(email);
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser(name, email, passwordHash, "user");

    const token = signToken(user);
    res.cookie("token", token, cookieOptions);
    return res.status(201).json({ user, token });
  } catch (err) {
    console.error("registerUser error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    email = email.trim().toLowerCase();
    password = password.trim();

    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid password" });

    const token = signToken(user);
    res.cookie("token", token, cookieOptions);

    const { password: _p, ...safeUser } = user;
    return res.json({ user: safeUser, token });
  } catch (err) {
    console.error("loginUser error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.json({ message: "Logged out successfully" });
};

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: "idToken is required" });

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) return res.status(400).json({ error: "Google account has no email" });

    let user;

    // 1. Check if user already exists by Google ID → direct login
    user = await getUserByGoogleId(googleId);
    if (user) {
      const token = signToken(user);
      res.cookie("token", token, cookieOptions);
      const { password: _p, ...safeUser } = user;
      return res.json({ user: safeUser, token });
    }

    // 2. Check if user exists by email → link Google ID to existing account
    user = await getUserByEmail(email);
    if (user) {
      user = await linkGoogleId(user.id, googleId, picture);
      const token = signToken(user);
      res.cookie("token", token, cookieOptions);
      const { password: _p, ...safeUser } = user;
      return res.json({ user: safeUser, token });
    }

    // 3. New user → create account with Google info (no password)
    user = await createGoogleUser(name, email, googleId, picture);
    const token = signToken(user);
    res.cookie("token", token, cookieOptions);
    return res.status(201).json({ user, token });
  } catch (err) {
    console.error("googleLogin error:", err);
    if (err.message?.includes("Token used too late") || err.message?.includes("Invalid token")) {
      return res.status(401).json({ error: "Invalid or expired Google token" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
