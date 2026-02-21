<div align="center">

# 🎓 SIPA — Smart Internship Performance Analyzer

### *An AI-Enhanced Full-Stack Platform for Tracking, Managing, and Evaluating Internship Performance*

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Problem Statement

Managing internship programs in organizations is chaotic. Mentors juggle multiple interns manually, tasks are tracked in spreadsheets, performance is evaluated subjectively, and there is no centralized system for feedback, analytics, or progress visibility. This leads to poor intern development and no actionable data for organizations.

---

## 💡 Solution Overview

**SIPA** is a centralized, role-based MERN platform that brings structure to internship management. It enables **Admins** to oversee the entire program, **Mentors** to assign and grade tasks, and **Interns** to track their own progress — all in one place. Powered by **Groq AI (LLaMA 3.1)**, SIPA automatically generates intelligent, data-driven performance feedback for each intern based on their real task history and scores.

---

## ✨ Key Features

- 🔐 **JWT Authentication** — Secure login and registration with role-based access control (Admin, Mentor, Intern)
- 📋 **Task Lifecycle Management** — Create, assign, submit, and grade tasks with deadlines and priority levels
- 🤖 **AI-Powered Feedback** — Automated performance reports with Strengths, Weaknesses, and a personalized Roadmap using Groq AI (LLaMA 3.1)
- 📊 **Role-Specific Dashboards** — Separate, tailored dashboards for Admins, Mentors, and Interns
- 🏆 **Top Performers Leaderboard** — Highlights top-performing interns based on task scores
- 📈 **Reports & Analytics** — Completion rate, average score, and deadline discipline metrics per intern
- 🗒️ **Activity Audit Log** — Real-time admin log of all platform actions (task created, graded, AI feedback generated)
- 📱 **Responsive UI** — Mobile and desktop friendly with glassmorphism design and sidebar navigation

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Axios, React Router v6, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcrypt |
| **AI Integration** | Groq AI API (LLaMA 3.1 8B Instant) via OpenAI SDK |
| **Styling** | TailwindCSS, Custom CSS (Glassmorphism) |
| **Dev Tools** | Nodemon, dotenv, express-async-handler |

---

## 🏛️ Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)             │
│   Login → AuthContext → Role-Based Dashboard         │
│   Intern Dashboard | Mentor Dashboard | Admin Panel  │
└─────────────────────┬────────────────────────────────┘
                      │ HTTP (Axios + JWT Token)
                      ▼
┌──────────────────────────────────────────────────────┐
│                  SERVER (Express.js)                 │
│   server.js → Routes → authMiddleware → Controllers  │
│                                                      │
│   /api/auth        → Auth Module                     │
│   /api/tasks       → Task Module                     │
│   /api/users       → User Module                     │
│   /api/performance → Performance Module              │
│   /api/ai-feedback → AI Service (Groq/LLaMA)         │
│   /api/activity    → Activity Log Module             │
└─────────────────────┬────────────────────────────────┘
                      │ Mongoose ODM
                      ▼
┌──────────────────────────────────────────────────────┐
│                  DATABASE (MongoDB)                  │
│   Users | Tasks | ActivityLogs | Performance         │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local or Atlas cloud)
- [Git](https://git-scm.com/)
- A free [Groq API Key](https://console.groq.com/)

---

### 📥 Installation

**1. Clone the repository**
```bash
git clone https://github.com/Abhinay-12-k/SIPA-Smart-Internship-Performance-Analyzer.git
cd SIPA-Smart-Internship-Performance-Analyzer
```

**2. Install Backend dependencies**
```bash
cd backend
npm install
```

**3. Install Frontend dependencies**
```bash
cd ../frontend
npm install
```

---

### 🔑 Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
# Server
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/sipa

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Groq AI API Key (get it free at https://console.groq.com)
GROQ_API_KEY=your_groq_api_key_here
```

> ⚠️ **Never commit your `.env` file.** It is already added to `.gitignore`.

---

### ▶️ Running Locally

**Start the Backend Server** (from the `backend/` folder):
```bash
cd backend
npm run dev
```
> Backend runs on: `http://localhost:5000`

**Start the Frontend Dev Server** (from the `frontend/` folder):
```bash
cd frontend
npm run dev
```
> Frontend runs on: `http://localhost:5173`

Open your browser and navigate to `http://localhost:5173` to use the application.

---

## 👥 User Roles & Access

| Role | Capabilities |
|---|---|
| **Admin** | View all users, tasks, activity logs, platform statistics |
| **Mentor** | Create & assign tasks, grade intern submissions, view intern reports |
| **Intern** | View assigned tasks, submit tasks, view personal performance & AI feedback |

---

## 🤖 AI Feedback Flow

1. Mentor/Admin clicks **"Generate AI Report"** for an intern
2. Backend collects the intern's live task data (completion rate, scores, deadlines)
3. A structured prompt is sent to **Groq AI (LLaMA 3.1 8B)** via the OpenAI-compatible SDK
4. AI returns a JSON report containing:
   - 📝 **Summary** — 3-sentence professional overview
   - 💪 **Strengths** — 3 identified strong points
   - ⚠️ **Weaknesses** — 3 areas for improvement
   - 🗺️ **Roadmap** — 3 personalized learning goals
5. Backend sanitizes the response and sends it to the frontend for display

---

## 🔮 Future Improvements

- [ ] **Email Notifications** — Notify interns on task assignment and feedback
- [ ] **File Submissions** — Allow interns to upload files for task submissions
- [ ] **Multi-Organization Support** — Support for multiple companies/institutes
- [ ] **Export Reports** — Download intern performance reports as PDF
- [ ] **Dark Mode** — Full dark theme support
- [ ] **Real-time Updates** — WebSocket integration for live dashboard updates
- [ ] **CI/CD Pipeline** — GitHub Actions for automated testing and deployment

---

## ✅ CI/CD Ready

This project is structured to be CI/CD pipeline compatible:

- ✔️ Clean root-level `.gitignore` (no credentials, no `node_modules`)
- ✔️ Environment variables are fully externalized via `.env`
- ✔️ Frontend and backend are independently deployable
- ✔️ Can be containerized using Docker
- ✔️ Frontend deployable to **Vercel** / **Netlify**
- ✔️ Backend deployable to **Render** / **Railway** / **AWS EC2**

---

## 📁 Project Structure

```
SIPA/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── middleware/     # JWT auth & error handlers
│   │   └── modules/
│   │       ├── auth/       # Login & Register
│   │       ├── users/      # User management
│   │       ├── tasks/      # Task CRUD
│   │       ├── performance/# Performance metrics
│   │       ├── ai/         # Groq AI service
│   │       └── activity/   # Audit logs
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── components/     # Shared components
│       ├── context/        # Auth context
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           └── Dashboard/
│               ├── Dashboard.jsx       # Shell layout
│               ├── AdminDashboard.jsx
│               ├── MentorDashboard.jsx
│               ├── InternDashboard.jsx
│               ├── InternListView.jsx
│               └── ReportsView.jsx
│
├── .gitignore
└── README.md
```

---

## 🧑‍💻 Author

<div align="center">

**Built with ❤️ by Abhinay**

[![GitHub](https://img.shields.io/badge/GitHub-Abhinay--12--k-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Abhinay-12-k)

*If you found this project helpful, consider giving it a ⭐ on GitHub!*

</div>

---

<div align="center">

**© 2026 SIPA - Smart Internship Performance Analyzer. All rights reserved.**

</div>
