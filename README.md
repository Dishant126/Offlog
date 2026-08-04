# OffLog – Offline Team Management System

A production-ready, fully offline team management system built with React, Node.js, Express, and MongoDB.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 3, React Router v6, Axios |
| Backend  | Node.js, Express.js, Mongoose |
| Database | MongoDB (local or Atlas) |
| Auth     | JWT + bcrypt (password hashing at 12 rounds) |
| File Uploads | Multer (local disk storage) |

---

## Prerequisites

- **Node.js** v18 or later
- **MongoDB** — either:
  - [MongoDB Community Server](https://www.mongodb.com/try/download/community) (fully offline)
  - Or use your existing Atlas cluster (update the URI in `.env`)

---

## Quick Start

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/team_management   # local MongoDB
JWT_SECRET=your_very_strong_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Seed the Admin User

```bash
cd backend
npm run seed
```

This creates: **admin@offlog.com** / **Admin@1234**

### 4. Start Backend

```bash
cd backend
npm run dev
```

The API will be running at `http://localhost:5000`

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Features

### Authentication
- Register / Login / Logout
- JWT with httpOnly cookie + Bearer token
- `tokenVersion` – changing password invalidates **all** other sessions
- Edit profile, change password, upload avatar

### Global Roles
| Role | Permissions |
|---|---|
| `ADMIN` | Manage all users & teams, view all activity logs |
| `USER`  | Create teams, join teams, manage own content |

### Team Roles
| Role | Permissions |
|---|---|
| `TEAM_LEADER` | Full team control (edit, delete, approve/reject, remove members, promote, transfer) |
| `MENTOR`      | View team, view members, help manage |
| `MEMBER`      | View team, leave team |

### Team Features
- Create teams (public or private)
- Unique join codes (`TEAM-XXXXXX`)
- Join public teams directly
- Join private teams via code → approval flow
- Transfer leadership
- Regenerate join code
- Toggle join requests on/off
- Upload team logo

### Notifications
- Real-time-style notifications (polls every 30 seconds)
- Types: join request, join accepted/rejected, role changed, removed from team, leadership transferred

### Admin Dashboard
- User management (search, edit, deactivate, delete)
- Team management (search, delete)
- Activity logs with action color coding
- Platform stats overview

---

## Project Structure

```
team-management-system/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Auth, upload, error, validate
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helpers, logger, response, seed
│   │   └── validators/     # Input validation (express-validator)
│   ├── uploads/
│   │   ├── avatars/        # User avatar files
│   │   └── team-logos/     # Team logo files
│   ├── app.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── assets/styles/  # Tailwind CSS
    │   ├── components/
    │   │   └── common/     # Navbar, Card, Modal, Loader
    │   ├── context/        # AuthContext
    │   ├── hooks/          # useToast
    │   ├── layouts/        # MainLayout
    │   ├── pages/          # All page components
    │   └── services/       # Axios API wrappers
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Security

- Passwords hashed with bcrypt (12 rounds) — never stored in plain text
- JWT signed with secret — verified on every request
- `tokenVersion` field on user — incremented on password change, invalidates all existing tokens
- Helmet.js for security headers
- File upload validation (type + 5MB limit)
- Input validation on all routes (express-validator)
