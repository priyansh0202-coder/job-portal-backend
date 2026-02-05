// index.js
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";


// important: import db.js so the connection runs
import "./config/db.js"; // optional if you need to query here

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Serve static files (uploaded resumes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => res.send("Hello World!"));

// Use user routes
app.use("/api/auth", userRoutes);                                                                                    

// Use admin routes
app.use("/api/admin", adminRoutes);

// Use user routes
app.use("/api/user", userRoutes);



app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
