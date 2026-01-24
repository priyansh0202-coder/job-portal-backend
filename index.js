// index.js
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";


// important: import db.js so the connection runs
import "./config/db.js"; // optional if you need to query here

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => res.send("Hello World!"));

// Use user routes
app.use("/api/auth", userRoutes);                                                                                    

// Use admin routes
app.use("/api/admin", adminRoutes);


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
