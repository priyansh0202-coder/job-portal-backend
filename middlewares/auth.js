// middlewares/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const verifyToken = (req, res, next) => {
    try {
        let token = null;

        // 1️⃣ Try Authorization header (optional)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
            token = authHeader.split(" ")[1];
        }

        // 2️⃣ Fallback to HttpOnly cookie (MAIN)
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded; // { sub, role }
        next();
    } catch (err) {
        console.error("verifyToken error:", err.message);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res
                .status(403)
                .json({ error: "Forbidden: insufficient permissions" });
        }
        next();
    };
};
