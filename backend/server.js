const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "Bay Ready API is running", timestamp: new Date() });
});

app.get("/api/dashboard", (req, res) => {
  res.json({
    timeSavedToday: 24,
    openingProgress: 65,
    closingProgress: 30,
    tasksRemaining: 12,
    ordersRemaining: 3,
  });
});

// Tasks Routes
app.get("/api/tasks", (req, res) => {
  res.json([
    {
      id: 1,
      title: "Clean hoist",
      assignee: "John",
      priority: "high",
      dueTime: "11:00 AM",
      completed: false,
    },
    {
      id: 2,
      title: "Stock brake pads",
      assignee: "Maria",
      priority: "high",
      dueTime: "2:00 PM",
      completed: false,
    },
  ]);
});

app.post("/api/tasks", (req, res) => {
  res.status(201).json({ success: true, message: "Task created" });
});

app.put("/api/tasks/:id", (req, res) => {
  res.json({ success: true, message: "Task updated" });
});

// Checklists Routes
app.get("/api/checklists/:type", (req, res) => {
  const { type } = req.params;
  res.json({ type, items: [] });
});

app.put("/api/checklists/:type/:taskId", (req, res) => {
  res.json({ success: true, message: "Checklist task updated" });
});

// Orders Routes
app.get("/api/orders", (req, res) => {
  res.json([
    {
      id: 1,
      item: "Synthetic oil 5qt",
      vendor: "Mobil",
      frequency: "Weekly",
      dueDate: "2/5/25",
      completed: false,
    },
  ]);
});

app.post("/api/orders", (req, res) => {
  res.status(201).json({ success: true, message: "Order created" });
});

// Voice Commands
app.post("/api/voice/process", (req, res) => {
  const { command } = req.body;
  // Voice command processing logic here
  res.json({ success: true, message: "Command processed" });
});

// Team/Employees Routes
app.get("/api/employees", (req, res) => {
  res.json([
    { id: 1, name: "John Smith", role: "Tech", status: "active" },
    { id: 2, name: "Maria Garcia", role: "Closer", status: "active" },
  ]);
});

app.post("/api/employees", (req, res) => {
  res.status(201).json({ success: true, message: "Employee added" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🔥 Bay Ready API running on http://localhost:${PORT}`);
});
