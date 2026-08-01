// ============================================
// TASK MANAGER - VERCEL SERVERLESS ENTRY POINT
// ============================================
// Vercel does NOT run a long-lived Node server,
// so it cannot use app.listen(). Instead, Vercel
// calls this file as a serverless function and
// expects the Express app to be exported.
//
// This file reuses the same routes/tasks.js router,
// so the API works identically on Vercel.
// ============================================

const express = require("express");
const path = require("path");
const taskRoutes = require("../routes/tasks");

// Create the Express application
const app = express();

// Allow the server to read JSON data sent in request bodies
app.use(express.json());

// Serve static files (index.html, style.css, script.js).
// __dirname = <project>/api, so the public folder is one level up.
app.use(express.static(path.join(__dirname, "..", "public")));

// Mount the task router (same routes as server.js)
app.use("/api/tasks", taskRoutes);

// Export the app so Vercel can handle requests with it
module.exports = app;

