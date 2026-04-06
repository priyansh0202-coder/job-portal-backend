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
import "./config/db.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:3000",
  "https://job-portal-eosin-three.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => res.send("Hello World!"));

// Use user auth routes
app.use("/api/auth", userRoutes);                                                                                    

// Use admin routes
app.use("/api/admin", adminRoutes);

// Use user routes
app.use("/api/user", userRoutes);



app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
