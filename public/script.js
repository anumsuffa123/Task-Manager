// ============================================
// TASK MANAGER - FRONTEND SCRIPT
// ============================================
// This file handles all frontend logic:
// - Fetching data from the backend API
// - Rendering tasks to the DOM
// - Creating, updating, deleting tasks
// - Loading states, error handling, success messages
// - Local state management (no page reloads)
// ============================================

// ---------- Local State ----------
let tasks = [];            // The full list of tasks from the server
let currentFilter = "all"; // Current filter: "all" | "pending" | "completed"
let editingId = null;      // The id of the task being edited (null = not editing)

// ---------- DOM References ----------
const form = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const submitBtn = document.getElementById("submit-btn");
const taskListEl = document.getElementById("task-list");
const loadingEl = document.getElementById("loading");
const messageEl = document.getElementById("message");
const searchInput = document.getElementById("search-input");
const filterBtns = document.querySelectorAll(".filter-btn");

// ---------- API Base URL ----------
const API_URL = "/api/tasks";

// ============================================
// HELPER FUNCTIONS
// ============================================

// Show a loading state on a button (disable + change text)
function setButtonLoading(btn, text) {
  btn.disabled = true;
  btn.dataset.originalText = btn.textContent; // remember original text
  btn.textContent = text;
}

// Restore a button to its normal state (just re-enable it)
function resetButton(btn) {
  btn.disabled = false;
  btn.textContent = btn.dataset.originalText || btn.textContent;
}

// ============================================
// REQUIRED FUNCTIONS
// ============================================

// ---------- showLoading / hideLoading ----------
// Show the loading spinner (used while fetching tasks)
function showLoading() {
  loadingEl.classList.remove("hidden");
  taskListEl.innerHTML = ""; // clear the list while loading
}

// Hide the loading spinner
function hideLoading() {
  loadingEl.classList.add("hidden");
}

// ---------- showError ----------
// Display an error message inside the page (never alert())
function showError(message) {
  messageEl.textContent = message;
  messageEl.className = "message error";
  clearTimeout(messageEl._timer); // stop any previous auto-hide timer
}

// ---------- showSuccess ----------
// Display a success message that disappears after 3 seconds
function showSuccess(message) {
  messageEl.textContent = message;
  messageEl.className = "message success";
  clearTimeout(messageEl._timer);
  messageEl._timer = setTimeout(() => {
    messageEl.textContent = "";
    messageEl.className = "message";
  }, 3000);
}

// Clear the message area immediately
function clearMessage() {
  clearTimeout(messageEl._timer);
  messageEl.textContent = "";
  messageEl.className = "message";
}

// ---------- renderForm ----------
// Switch the form between "Add" mode and "Update" mode
function renderForm() {
  if (editingId === null) {
    // Add mode
    submitBtn.textContent = "Add Task";
    submitBtn.classList.remove("btn-warning");
    submitBtn.classList.add("btn-primary");
  } else {
    // Update mode
    submitBtn.textContent = "Update Task";
    submitBtn.classList.remove("btn-primary");
    submitBtn.classList.add("btn-warning");
  }
}

// ---------- clearForm ----------
// Clear the input field and reset the form to "Add" mode
function clearForm() {
  taskInput.value = "";
  editingId = null;
  renderForm();
  taskInput.focus();
}

// ============================================
// RENDERING
// ============================================

// ---------- renderTasks ----------
// Renders the task list based on local state,
// the current filter, and the search query.
function renderTasks() {
  // 1. Apply the search filter
  const query = searchInput.value.trim().toLowerCase();
  let visibleTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(query)
  );

  // 2. Apply the status filter
  if (currentFilter === "pending") {
    visibleTasks = visibleTasks.filter((task) => !task.completed);
  } else if (currentFilter === "completed") {
    visibleTasks = visibleTasks.filter((task) => task.completed);
  }

  // 3. Show the empty state if there are no tasks to display
  if (visibleTasks.length === 0) {
    taskListEl.innerHTML = `
      <div class="empty-state">
        <div class="big-icon">📭</div>
        <p>No tasks available.</p>
      </div>`;
    return;
  }

  // 4. Build HTML for each task card
  const html = visibleTasks
    .map((task) => {
      const completed = task.completed;
      return `
        <div class="task-card ${completed ? "completed" : ""}" data-id="${task.id}">
          <div class="task-info">
            <div class="task-title">${escapeHtml(task.title)}</div>
            <div class="task-status">
              Completed:
              <span class="status-badge ${completed ? "yes" : "no"}">
                ${completed ? "Yes" : "No"}
              </span>
            </div>
          </div>
          <div class="task-actions">
            <button class="btn btn-sm btn-success" data-action="toggle">
              ${completed ? "Mark Pending" : "Mark Complete"}
            </button>
            <button class="btn btn-sm btn-warning" data-action="edit">
              Edit
            </button>
            <button class="btn btn-sm btn-danger" data-action="delete">
              Delete
            </button>
          </div>
        </div>`;
    })
    .join("");

  taskListEl.innerHTML = html;
}

// Escape HTML so task titles cannot inject scripts (XSS safety)
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// API FUNCTIONS
// ============================================

// ---------- fetchTasks ----------
// Fetches all tasks from the server and renders them
async function fetchTasks() {
  showLoading();
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`Server responded with status ${res.status}`);
    }
    tasks = await res.json();
    renderTasks();
  } catch (error) {
    showError("Unable to connect to the server. Please try again.");
    taskListEl.innerHTML = `
      <div class="empty-state">
        <div class="big-icon">⚠️</div>
        <p>Unable to connect to the server. Please try again.</p>
      </div>`;
  } finally {
    hideLoading();
  }
}

// ---------- createTask ----------
// Creates a new task using the title from the input field
async function createTask() {
  const title = taskInput.value.trim();

  // Validation: do not allow empty titles
  if (title === "") {
    showError("Task title cannot be empty.");
    return;
  }

  setButtonLoading(submitBtn, "Adding task...");
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    // If the response is not OK, throw to the catch block
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to create task");
    }

    const newTask = await res.json();

    // Update local state and re-render (no page reload!)
    tasks.push(newTask);
    renderTasks();

    showSuccess("Task created successfully.");
    clearForm();
  } catch (error) {
    showError(error.message || "Unable to connect to the server. Please try again.");
  } finally {
    submitBtn.disabled = false;
    renderForm();
  }
}

// ---------- updateTask ----------
// Updates the task currently being edited (editingId)
async function updateTask() {
  const title = taskInput.value.trim();

  // Validation: do not allow empty titles
  if (title === "") {
    showError("Task title cannot be empty.");
    return;
  }

  setButtonLoading(submitBtn, "Updating...");
  try {
    const res = await fetch(`${API_URL}/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to update task");
    }

    const updatedTask = await res.json();

    // Update local state and re-render
    const index = tasks.findIndex((t) => t.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
    }
    renderTasks();

    showSuccess("Task updated successfully.");
    clearForm();
  } catch (error) {
    showError(error.message || "Unable to connect to the server. Please try again.");
  } finally {
    submitBtn.disabled = false;
    renderForm();
  }
}

// ---------- deleteTask ----------
// Deletes a task (with confirmation)
async function deleteTask(id) {
  // Confirmation before delete
  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }

  // Find the delete button so we can show its loading state
  const card = taskListEl.querySelector(`.task-card[data-id="${id}"]`);
  const deleteBtn = card ? card.querySelector('[data-action="delete"]') : null;
  if (deleteBtn) {
    setButtonLoading(deleteBtn, "Deleting...");
  }

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to delete task");
    }

    // Update local state and re-render
    tasks = tasks.filter((task) => task.id !== id);
    renderTasks();

    showSuccess("Task deleted successfully.");
  } catch (error) {
    showError(error.message || "Unable to connect to the server. Please try again.");
  } finally {
    if (deleteBtn) {
      resetButton(deleteBtn);
    }
  }
}

// ---------- toggleComplete ----------
// Toggles a task's completed status between true and false
async function toggleComplete(task) {
  // Find the toggle button so we can show its loading state
  const card = taskListEl.querySelector(`.task-card[data-id="${task.id}"]`);
  const toggleBtn = card ? card.querySelector('[data-action="toggle"]') : null;
  if (toggleBtn) {
    setButtonLoading(toggleBtn, "Updating...");
  }

  try {
    const res = await fetch(`${API_URL}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to update task");
    }

    const updatedTask = await res.json();

    // Update local state and re-render
    const index = tasks.findIndex((t) => t.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
    }
    renderTasks();

    showSuccess("Task updated successfully.");
  } catch (error) {
    showError(error.message || "Unable to connect to the server. Please try again.");
  } finally {
    if (toggleBtn) {
      resetButton(toggleBtn);
    }
  }
}

// ============================================
// EVENT HANDLERS
// ============================================

// ---------- Form submit (Add OR Update) ----------
form.addEventListener("submit", (event) => {
  event.preventDefault(); // prevent page reload
  if (editingId === null) {
    createTask();
  } else {
    updateTask();
  }
});

// ---------- Enter key submits form ----------
form.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    form.requestSubmit(); // triggers the submit event
  }
});

// ---------- Task list button clicks (event delegation) ----------
taskListEl.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;

  // Find the task id from the parent card
  const card = btn.closest(".task-card");
  const id = Number(card.dataset.id);

  // Find the matching task in local state
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const action = btn.dataset.action;

  if (action === "toggle") {
    toggleComplete(task);
  } else if (action === "edit") {
    // Fill the form with the existing task and switch to Update mode
    taskInput.value = task.title;
    editingId = task.id;
    renderForm();
    taskInput.focus();
    clearMessage();
  } else if (action === "delete") {
    deleteTask(id);
  }
});

// ---------- Search input (filter as you type) ----------
searchInput.addEventListener("input", () => {
  renderTasks();
});

// ---------- Filter buttons ----------
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Update active button styling
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Update the current filter and re-render
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// ============================================
// INITIALIZATION
// ============================================

// Load tasks when the page loads
fetchTasks();

