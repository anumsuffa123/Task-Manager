// ============================================
// TASK MANAGER - SERVER (Entry Point)
// ============================================
// This file creates the Express server, serves
// the static frontend files (public folder), and
// mounts the /api/tasks routes.
// ============================================

const express = require("express");

// Import the task routes (defined in routes/tasks.js)
const taskRoutes = require("./routes/tasks");

// Create the Express application
const app = express();

// The port the server will listen on (defaults to 3000)
const PORT = process.env.PORT || 3000;

// ---------- MIDDLEWARE ----------

// Allow the server to read JSON data sent in request bodies
app.use(express.json());

// Serve all static files (index.html, style.css, script.js)
// automatically from the "public" folder
app.use(express.static("public"));

// ---------- ROUTES ----------

// Mount the task router.
// All routes defined inside routes/tasks.js will be
// prefixed with /api/tasks
app.use("/api/tasks", taskRoutes);

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`✅ Task Manager server running at http://localhost:${PORT}`);
});

