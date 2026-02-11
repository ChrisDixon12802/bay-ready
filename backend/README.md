# Bay Ready - Shop Floor Task Management API

Backend API for Bay Ready, a voice-first task management system for oil change shops and service businesses.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## API Endpoints

### Dashboard

- `GET /api/dashboard` - Get daily metrics

### Tasks

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Checklists

- `GET /api/checklists/:type` - Get checklist by type (opening, mid, closing)
- `PUT /api/checklists/:type/:taskId` - Update checklist task

### Orders

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order

### Voice

- `POST /api/voice/process` - Process voice command

### Employees

- `GET /api/employees` - Get team members
- `POST /api/employees` - Add employee

## Database Models

- Task
- Checklist
- Order
- Employee
- VoiceLog
