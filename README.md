# 🏫 Smart Campus Issue & Maintenance Reporting Platform (SCRP)

A full-stack **MERN** application for reporting, tracking, and resolving campus maintenance issues.

**Students** report problems → **Staff** resolve them → **Admins** monitor everything via dashboards.

---

## 🚀 Quick Start (Step by Step)

### Prerequisites
- **Node.js** v18+ installed ([download](https://nodejs.org))
- **MongoDB Atlas** account (already configured in `.env`)
- **Internet connection** (required for MongoDB Atlas & Cloudinary)

---

### Step 1: Clone / Open the project

```bash
cd c:\6SemProject
```

---

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

---

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

### Step 4: Start the Backend Server

Open **Terminal 1** (PowerShell/CMD):

```bash
cd c:\6SemProject\backend
node server.js
```

✅ You should see:
```
{"level":"info","message":"MongoDB connected","timestamp":"..."}
{"level":"info","message":"Server started","timestamp":"...","port":5000}
```

> **Troubleshooting**: If MongoDB fails to connect, make sure your IP is whitelisted in MongoDB Atlas:
> 1. Go to https://cloud.mongodb.com
> 2. Navigate to **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)
> 3. Wait 1 minute, then restart the backend

---

### Step 5: Start the Frontend Dev Server

Open **Terminal 2** (PowerShell/CMD):

```bash
cd c:\6SemProject\frontend
npm run dev
```

✅ You should see:
```
VITE ready in 2000ms
➜  Local:   http://localhost:5173/
```

---

### Step 6: Open in Browser

Open **http://localhost:5173** in Chrome/Edge.

---

## 🧪 Testing the Project (Demo Flow)

### Test 1: Register Users (create all 3 roles)

1. Go to **http://localhost:5173/register**

2. **Create a Student account:**
   - Name: `Test Student`
   - Email: `student@test.com`
   - Password: `test123`
   - Role: `Student`
   - Click **Create Account**

3. **Logout** (click your avatar in the sidebar bottom)

4. **Create a Staff account:**
   - Name: `IT Staff Member`
   - Email: `staff@test.com`
   - Password: `test123`
   - Role: `Staff`
   - Department: `IT`
   - Click **Create Account**

5. **Logout**

6. **Create an Admin account:**
   - Name: `Admin User`
   - Email: `admin@test.com`
   - Password: `test123`
   - Role: `Admin`
   - Click **Create Account**

7. **Logout**

---

### Test 2: Student Flow — Report Issues

1. **Login** as `student@test.com` / `test123`
2. Click **Report Issue** in sidebar
3. Fill in the form:
   - Title: `WiFi not working in Block A`
   - Description: `The WiFi has been down since yesterday. Unable to access any online resources.`
   - Category: `WiFi`
   - Priority: `High`
   - Location: `Block A, Floor 2`
   - Optionally upload an image
4. Click **Submit Issue** ✅
5. Create 2-3 more issues with different categories (electricity, plumbing, etc.)
6. Go to **My Issues** — see all your issues with filters
7. Click an issue to see the **Detail page**
8. Go to **Dashboard** — see your issue counts

---

### Test 3: Admin Flow — Assign & Manage

1. **Logout** → **Login** as `admin@test.com` / `test123`
2. **Dashboard** shows full analytics with charts (pie chart, bar chart)
3. Go to **All Issues** — see all issues from all users
4. Click on an issue (e.g., WiFi issue)
5. In the **Actions** panel:
   - Select a staff member from the **Assign** dropdown
   - Click **Assign**
6. The issue status changes to `Assigned`
7. Go to **Analytics** — see status/priority/department charts and trends

---

### Test 4: Staff Flow — Work on Issues

1. **Logout** → **Login** as `staff@test.com` / `test123`
2. **Dashboard** shows issues assigned to you + analytics
3. Go to **All Issues**
4. Click on the assigned issue
5. Change status to **In Progress** → Click **Update Status**
6. Change status to **Resolved** → Click **Update Status**
7. Issue now shows as Resolved ✅

---

### Test 5: Verify Dashboard Analytics

1. **Login as Admin**
2. **Dashboard** should show:
   - Stat cards: Total Issues, Reported, In Progress, Resolved counts
   - Overdue & Escalated counts
   - **Pie chart**: Issues by Status
   - **Bar chart**: Issues by Department
3. Go to **Analytics** page for more detailed charts:
   - Status & Priority pie charts
   - Department bar chart
   - Daily trend area chart
   - Time period selector (7/30/90/365 days)

---

## 📁 Project Structure

```
6SemProject/
├── backend/                  # Node.js + Express API
│   ├── server.js             # Entry point
│   ├── app.js                # Express setup
│   ├── config/               # DB, Cloudinary, Multer, Security
│   ├── constants/            # Issue categories, departments, priorities
│   ├── controllers/          # HTTP request handlers
│   ├── middleware/            # Auth, error handling, rate limiting
│   ├── model/                # Mongoose schemas (User, Issue, Counter)
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic layer
│   ├── validators/           # Request validation
│   ├── utils/                # Helpers (error class, logger, etc.)
│   └── jobs/                 # Cron jobs (auto-escalation)
│
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── api/              # Axios instance with JWT interceptor
│   │   ├── context/          # Auth context (login/logout/register)
│   │   ├── services/         # API service functions
│   │   ├── components/       # Reusable UI components
│   │   │   ├── layout/       # Sidebar, AppLayout, ProtectedRoute
│   │   │   ├── issues/       # IssueCard, filters, badges
│   │   │   ├── dashboard/    # StatCard
│   │   │   └── common/       # Pagination, Spinner, EmptyState
│   │   ├── pages/            # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateIssue.jsx
│   │   │   ├── MyIssues.jsx
│   │   │   ├── IssueDetail.jsx
│   │   │   └── Analytics.jsx
│   │   ├── App.jsx           # Router + providers
│   │   └── index.css         # Design system (dark theme)
│   └── index.html
│
└── project_review.md         # Architecture review document
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | ❌ | Register new user |
| POST | `/api/v1/auth/login` | ❌ | Login, get JWT |
| GET | `/api/v1/auth/me` | ✅ | Get current user |
| GET | `/api/v1/issues` | ✅ | List issues (paginated, filterable) |
| POST | `/api/v1/issues` | ✅ | Create issue (multipart for images) |
| GET | `/api/v1/issues/:ticketId` | ✅ | Get issue detail |
| PATCH | `/api/v1/issues/:ticketId/status` | ✅ Staff/Admin | Update status |
| PATCH | `/api/v1/issues/:ticketId/assign` | ✅ Staff/Admin | Assign issue |
| GET | `/api/v1/issues/assigned/me` | ✅ Staff/Admin | My assigned issues |
| GET | `/api/v1/dashboard` | ✅ | Dashboard summary |
| GET | `/api/v1/dashboard/staff` | ✅ Staff/Admin | Staff dashboard |
| GET | `/api/v1/dashboard/analytics` | ✅ Staff/Admin | Analytics data |
| GET | `/api/v1/users` | ✅ Admin | List all users |

---

## 🛡️ Security Features

- JWT authentication with 7-day expiry
- Bcrypt password hashing (12 salt rounds)
- Role-based access control (Student / Staff / Admin)
- CORS with configurable origins
- Rate limiting (300 req/15min general, 30 req/15min auth)
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Input validation on all endpoints
- File upload security (image-only, 5MB limit)

---

## 🎨 Frontend Features

- Premium dark theme with glassmorphism effects
- Animated gradient backgrounds on auth pages
- Interactive charts (Recharts): pie, bar, area
- Role-based sidebar navigation
- Real-time toast notifications
- Responsive design (mobile-friendly)
- Image upload with preview
- Paginated issue lists with search & filters

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router v7, Recharts |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB Atlas |
| Storage | Cloudinary (image uploads) |
| Auth | JWT + Bcrypt |
| Styling | Vanilla CSS (custom design system) |

---

## 👤 Default Test Accounts

> Create these via the Register page for demo purposes:

| Role | Email | Password |
|------|-------|----------|
| Student | student@test.com | test123 |
| Staff | staff@test.com | test123 |
| Admin | admin@test.com | test123 |
