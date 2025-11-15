// middlewares/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided" });
        }
        if (authHeader) {
            const token = authHeader.split(" ")[1];
            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (err) {
                    return res.status(403).json({ error: "Token is not valid" });
                }
                req.user = user;
                next();
            });
        } else {
            res.status(401).json({ error: "No token provided" });
        }
    } catch (err) {
        res.status(500).json({ error: "Invalid or Expired Token" });
    }
}

export const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: "Forbidden: Insufficient role" })
        }
        next();
    }
}