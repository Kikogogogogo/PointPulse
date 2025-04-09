#!/usr/bin/env node
'use strict';

// Use environment port (Render sets process.env.PORT)
const port = process.env.PORT || 3001;

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Dependencies
const express = require("express");
const cors = require("cors");
const path = require("path");
const { expressjwt: jwt } = require("express-jwt");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const eventRoutes = require("./routes/eventRoutes");
const promotionRoutes = require("./routes/promotionRoutes");

// Import error handlers
const { notFoundHandler, errorHandler } = require("./middlewares/errorMiddleware");

// Import JWT config
const { JWT_SECRET } = require("./utils/jwtConfig");

// Create Express app
const app = express();

// CORS setup
app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// JSON body parser
app.use(express.json());

// Serve static files (e.g., uploaded images or files)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Public routes (no token required)
app.use("/auth", authRoutes);

// JWT middleware (protects everything else)
app.use(
    jwt({
        secret: JWT_SECRET,
        algorithms: ["HS256"],
    }).unless({
        path: [
            /^\/auth\//, // Exclude all auth routes
        ],
    })
);

// Protected routes
app.use("/users", userRoutes);
app.use("/transactions", transactionRoutes);
app.use("/events", eventRoutes);
app.use("/promotions", promotionRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(` Cannot start server: ${err.message}`);
    process.exit(1);
});
