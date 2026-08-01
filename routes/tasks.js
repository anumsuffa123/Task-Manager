// ============================================
// TASK ROUTES - /api/tasks
// ============================================
// This file contains the CRUD endpoints for the
// Task resource. Data is stored in an in-memory
// array (no database required).
// ============================================

const express = require("express");

// Create a new Router instance
const router = express.Router();

// ---------- IN-MEMORY STORAGE ----------
// This array acts as our "database".
// It is reset every time the server restarts.
let tasks = [];

// Helper that generates the next id for a new task
let nextId = 1;

// Helper to find a task by its id
function findTask(id) {
  return tasks.find((task) => task.id === id);
}

// ---------- GET /api/tasks ----------
// Returns all tasks
router.get("/", (req, res) => {
  res.json(tasks);
});

// ---------- POST /api/tasks ----------
// Creates a new task
// Body: { "title": "Buy groceries" }
router.post("/", (req, res) => {
  const { title } = req.body;

  // Validation: title is required and cannot be empty
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }

  // Create the new task object
  const newTask = {
    id: nextId++,
    title: title.trim(),
    completed: false,
  };

  // Add it to the array (our "database")
  tasks.push(newTask);

  // Return the newly created task with a 201 status
  res.status(201).json(newTask);
});

// ---------- PUT /api/tasks/:id ----------
// Updates a task's title and/or completed status
// Body: { "title": "New title", "completed": true }
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = findTask(id);

  // If the task does not exist, return a 404 error
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, completed } = req.body;

  // Update the title if a valid one was provided
  if (title !== undefined && typeof title === "string" && title.trim() !== "") {
    task.title = title.trim();
  }

  // Update the completed status if a valid boolean was provided
  if (typeof completed === "boolean") {
    task.completed = completed;
  }

  // Return the updated task
  res.json(task);
});

// ---------- DELETE /api/tasks/:id ----------
// Deletes a task
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const taskIndex = tasks.findIndex((task) => task.id === id);

  // If the task does not exist, return a 404 error
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Remove the task from the array
  tasks.splice(taskIndex, 1);

  // Return a success message
  res.json({ message: "Task deleted successfully" });
});

// Export the router so it can be used in server.js
module.exports = router;

