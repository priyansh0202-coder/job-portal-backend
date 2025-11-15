// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getUserByEmail, createUser, getUserById } from "../models/userModel.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE || null;

const signToken = (user) => jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const registerUser = async (req, res) => {
  try {
    // use let since we may mutate role
    let { name, email, password, role, adminCode } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }

    name = name.trim();
    email = email.trim().toLowerCase();
    // DO NOT toLowerCase password
    password = password.trim();

    role = (role || "user").trim().toLowerCase();

    // only allow admin when invite code matches
    if (role === "admin") {
      if (!ADMIN_INVITE_CODE || adminCode !== ADMIN_INVITE_CODE) {
        return res.status(403).json({ error: "Invalid admin invite code" });
      }
    } else {
      role = "user";
    }

    const existing = await getUserByEmail(email);
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser(name, email, passwordHash, role);

    const token = signToken(user);
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
    const { password: _p, ...safeUser } = user;
    return res.json({ user: safeUser, token });
  } catch (err) {
    console.error("loginUser error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const me = async (req, res) => {
//   try {
//     const user = await getUserById(req.user.sub || req.user.id);
//     if (!user) return res.status(404).json({ error: "User not found" });
//     return res.json({ user });
//   } catch (err) {
//     console.error("me error:", err);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };
