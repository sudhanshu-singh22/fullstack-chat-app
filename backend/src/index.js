import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
 import {app,server} from "./lib/socket.js"
dotenv.config();


const PORT = process.env.PORT;
const _dirname=path.resolve();
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",  // Corrected to remove trailing slash
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow specific methods
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true  // Allow cookies to be sent with requests
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
  }
// Start server
server.listen(PORT, () => {
    console.log("Server is running on PORT " + PORT);
    connectDB();  // Connect to the database
});
