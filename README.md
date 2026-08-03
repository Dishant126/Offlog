# Team Management System

A production-ready, offline-capable team management application built with React (Vite), Node.js, Express, and MongoDB.

## Features

- **Authentication**: Register, Login, Logout, Change Password, Edit Profile
- **Session Invalidation**: Password changes log out all other devices via tokenVersion
- **Team Management**: Create teams, join via unique codes, manage members
- **Roles**: Global (ADMIN/USER) and Team-level (TEAM_LEADER/MENTOR/MEMBER)
- **Join Requests**: Request to join, approve/reject by team leader
- **Notifications**: Real-time notifications for team events
- **Admin Dashboard**: Manage users, teams, view activity logs
- **File Uploads**: Avatar and team logo uploads stored locally
- **Offline**: Everything runs locally - no cloud services needed

## Prerequisites

- Node.js (v18+)
- MongoDB (running locally on default port 27017)

## Quick Start

### 1. Start MongoDB
```bash
# macOS/Linux
mongod

# Windows (if installed as service)
net start MongoDB
```

### 2. Setup Backend
```bash
cd backend
npm install
npm run seed    # Creates admin user: admin@local.com / admin123
npm start       # Server runs on http://localhost:5000
```

### 3. Setup Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev     # App runs on http://localhost:5173
```

### 4. Open Browser
Navigate to http://localhost:5173

## Default Admin Account
- **Email**: admin@local.com
- **Password**: admin123

## Project Structure

```
team-management-system/
├── backend/
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── controllers/  # Route handlers
│   │   ├── middlewares/  # Auth, error handling, upload
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Helpers, logger, response
│   │   └── validators/   # Input validation
│   ├── uploads/          # Local file storage
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── context/      # React Context (Auth)
    │   ├── pages/        # Page components
    │   ├── services/     # API service layer
    │   └── assets/       # Styles
    └── vite.config.js
```

## Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication + bcrypt
- Express Validator + Helmet + CORS + Morgan
- Multer (file uploads)

**Frontend:**
- React 18 + Vite
- React Router DOM
- React Context API (state management)
- Tailwind CSS
- Axios
- Lucide React (icons)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/change-password | Change password |
| GET | /api/users/dashboard | User dashboard |
| PUT | /api/users/profile | Update profile |
| POST | /api/users/avatar | Upload avatar |
| GET | /api/teams/my-teams | Get my teams |
| GET | /api/teams/public | Get public teams |
| POST | /api/teams | Create team |
| GET | /api/teams/:id | Get team details |
| PUT | /api/teams/:id | Update team |
| DELETE | /api/teams/:id | Delete team |
| POST | /api/teams/join | Join team by code |
| GET | /api/teams/:id/join-requests | Get join requests |
| PUT | /api/teams/:id/join-requests/:reqId | Respond to request |
| GET | /api/admin/stats | Admin stats |
| GET | /api/admin/users | List users |
| GET | /api/admin/teams | List teams |
| GET | /api/admin/activity-logs | Activity logs |

## Environment Variables

Create `.env` in backend/:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team_management
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```
