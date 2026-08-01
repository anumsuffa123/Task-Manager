# ✅ Task Manager

A beginner-friendly full-stack **CRUD** application for managing tasks. Built with **Node.js**, **Express.js**, **HTML**, **CSS**, and **Vanilla JavaScript**. Tasks are stored in an **in-memory array** (no database required).

---

## ✨ Features

- **Create** a new task
- **Read** / list all tasks
- **Update** a task's title
- **Delete** a task
- **Toggle Complete** — mark a task as completed / pending
- **Search** tasks by title
- **Filter** tasks by All / Completed / Pending
- **Loading states** for every action (spinner + disabled buttons)
- **Error handling** with friendly in-page messages (no `alert()`)
- **Success messages** that auto-hide after 3 seconds
- **Empty state** — "No tasks available."
- **Delete confirmation** before removing a task
- **Responsive UI** with modern cards, rounded corners, subtle shadows and hover effects
- **Local state management** — the page never reloads during CRUD operations

---

## 🛠️ Technologies

| Layer      | Technology            |
|------------|-----------------------|
| Backend    | Node.js, Express.js   |
| Frontend   | HTML, CSS, Vanilla JS |
| Storage    | In-memory JS array    |

---

## 🔌 API Endpoints

Base URL: `http://localhost:3000/api/tasks`

| Method   | Endpoint          | Description                        |
|----------|-------------------|------------------------------------|
| `GET`    | `/api/tasks`      | Get all tasks                      |
| `POST`   | `/api/tasks`      | Create a task `{ "title": "..." }` |
| `PUT`    | `/api/tasks/:id`  | Update a task (title / completed)  |
| `DELETE` | `/api/tasks/:id`  | Delete a task                      |

### Response Examples

**Create task**

```
POST /api/tasks
Body: { "title": "Buy groceries" }

Response (201):
{
  "id": 1,
  "title": "Buy groceries",
  "completed": false
}
```

**Task not found**

```
PUT /api/tasks/999

Response (404):
{ "error": "Task not found" }
```

**Delete task**

```
DELETE /api/tasks/1

Response (200):
{ "message": "Task deleted successfully" }
```

---

## 📁 Folder Structure

```
task-manager/
│
├── server.js
├── package.json
├── README.md
│
├── routes/
│      tasks.js
│
└── public/
       index.html
       style.css
       script.js
```

---

## 🚀 Installation

1. **Install Node.js** from [nodejs.org](https://nodejs.org) (if not already installed).

2. **Navigate to the project folder:**

```bash
cd task-manager
```

3. **Install dependencies:**

```bash
npm install
```

---

## ▶️ Running the Application

```bash
npm start
```

Then open your browser and visit:

```
http://localhost:3000
```

---

## 📝 How It Works

1. The **backend** (Express) exposes REST API CRUD endpoints and keeps tasks in an in-memory array.
2. The **frontend** (vanilla JS) uses `fetch()` with `async/await` to talk to those endpoints.
3. Every action updates **local state** (`tasks` array) and re-renders the UI — no page reloads.
4. Loading states, error messages and success messages are shown inside the page.

> **Note:** Since tasks are stored in memory, they are reset whenever the server restarts.

