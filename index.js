// index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";

// important: import db.js so the connection runs
import "./config/db.js"; // optional if you need to query here

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => res.send("Hello World!"));

// Use user routes
app.use("/api/auth", userRoutes);




app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
