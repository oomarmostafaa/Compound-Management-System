<div align="center">

# 🏙️ Compound Hub — Smart Living Management System

**A Full-Stack Production-Ready Residential Compound Management Platform**

[![Vercel](https://img.shields.io/badge/deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://compound-management-system-pkiucbo4b-omar-mostafa-s-projects.vercel.app/)
[![Railway](https://img.shields.io/badge/deployed_on-Railway-0B0D0E?style=for-the-badge&logo=railway)](https://compound-management-system-production.up.railway.app/api-docs/)
[![Neon](https://img.shields.io/badge/database-Neon-00E599?style=for-the-badge&logo=neon)](https://neon.tech)
[![Docker](https://img.shields.io/badge/containerized-Docker-2496ED?style=for-the-badge&logo=docker)](https://hub.docker.com/r/oomarmostafaa/compound-api)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](https://github.com/oomarmostafaa/Compound-Management-System)

---

---

[🌐 Live Demo](https://compound-management-system-pkiucbo4b-omar-mostafa-s-projects.vercel.app/) &nbsp;•&nbsp; 
[📖 API Docs](https://compound-management-system-production.up.railway.app/api-docs/) &nbsp;•&nbsp; 
[📊 ERD Diagram](/docs/ERD%20Digram.png) &nbsp;•&nbsp; 
[📄 Full Plan](/docs/Doc.pdf)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture & Design](#-architecture--design)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Database Schema (9 Models)](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Role-Based Access Control (RBAC)](#-role-based-access-control)
- [Authentication & Security](#-authentication--security)
- [Getting Started](#-getting-started)
- [Docker Setup](#-docker-setup)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Seed Data](#-seed-data)
- [Frontend Overview](#-frontend-overview)
- [Code Quality & Patterns](#-code-quality--patterns)
- [Performance & Optimization](#-performance--optimization)

---

## 📖 Overview

**Compound Hub** is a production-grade, full-stack web application designed to manage residential compounds efficiently. The system serves three distinct user roles — **Admins**, **Residents**, and **Staff** — each with tailored dashboards and permissions.

The platform streamlines compound operations:

- 📝 **Residents** submit maintenance requests and complaints, upload identity documents, pre-register visitors, and view community announcements.
- 👷 **Staff** (electricians, plumbers, security, etc.) manage their assigned tasks and approve/reject visitor entries.
- 🛡️ **Admins** have full control: manage buildings, apartments, residents, staff, all requests, visitor approvals, announcements, and view comprehensive dashboard statistics.

The backend is deployed on **Railway** with a **Neon PostgreSQL** database, and the frontend is served via **Vercel**, all containerized with **Docker** for portability.

---

## 🚀 Tech Stack

### Backend (server/)

| Technology | Purpose |
|---|---|
| **Node.js 20** + **Express 5** | Server runtime & web framework |
| **Prisma ORM 7** + **PostgreSQL** | Database ORM with type-safe queries |
| **JWT (jsonwebtoken)** | Stateless authentication |
| **Bcryptjs** | Password hashing |
| **Joi** | Request body validation |
| **Cloudinary + Multer** | Image/PDF upload & storage |
| **Nodemailer** (Gmail SMTP) | Password reset emails |
| **Swagger (swagger-jsdoc + swagger-ui-express)** | Auto-generated API documentation |
| **Helmet** | Security headers |
| **express-rate-limit** | Rate limiting (100 req/15 min) |
| **Morgan** | HTTP request logging |
| **Docker** | Containerization |

### Frontend (client/)

| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Framer Motion 12** | Animation library |
| **Axios** | HTTP client |
| **React Router DOM 7** | Client-side routing |
| **Lucide React** | Icon library |

### DevOps & Deployment

| Tool | Purpose |
|---|---|
| **Vercel** | Frontend hosting (SPA with rewrites) |
| **Railway** | Backend hosting |
| **Neon** | Serverless PostgreSQL database |
| **Docker + Docker Compose** | Containerization |
| **GitHub Actions** (configurable) | CI/CD pipeline |

---

## 🏗️ Architecture & Design

```
┌──────────────────────────────────────────────────────────┐
│                    🌐 Vercel (Frontend)                   │
│                  React SPA (client/)                     │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTPS / REST API
                       ▼
┌──────────────────────────────────────────────────────────┐
│                🚂 Railway (Backend Server)                │
│              Node.js + Express (server/)                  │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ Modules  │  │ Auth     │  │ RBAC     │               │
│  │ (CRUD)   │  │ (JWT)    │  │ Middleware│               │
│  └────┬─────┘  └──────────┘  └──────────┘               │
│       │                                                  │
│       ▼                                                  │
│  ┌─────────────────────────────────────────────────┐     │
│  │           Prisma ORM + Adapter-PG               │     │
│  └──────────────────────┬──────────────────────────┘     │
└──────────────────────────┼───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│              🐘 Neon PostgreSQL (Database)                │
│                       9 Models                           │
└──────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Modular Architecture**: Each domain (auth, buildings, apartments, etc.) is encapsulated in its own module with routes, controllers, services, and validations — following the Separation of Concerns principle.
- **Middleware Pipeline**: Auth → Role → Validation chain ensures clean, composable request processing.
- **Soft Deletes**: Residents and Staff records use `isDeleted` flags instead of hard deletion, preserving data integrity and audit trails.
- **Transactional Operations**: Critical operations (e.g., creating a resident + assigning an apartment) use Prisma transactions to ensure atomicity.
- **Stateless JWT**: No refresh tokens; access tokens expire in 7 days. Simplifies the security model for this use case.
- **Constant-Time Password Verification**: All auth comparisons use `bcrypt.compare()` to prevent timing attacks.

---

## 📁 Project Structure

```
Compound Management System/
├── 📦 client/                          # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Loader.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Auth state management
│   │   ├── pages/
│   │   │   ├── Admin/                  # Dashboard, Buildings, Apartments,
│   │   │   │                           # Residents, Staff, Requests,
│   │   │   │                           # Visitors, Announcements
│   │   │   ├── Auth/                   # Login, ForgotPassword, ResetPassword
│   │   │   ├── Resident/               # Profile, Requests, Visitors, Announcements
│   │   │   └── Staff/                  # Tasks, Security
│   │   ├── services/
│   │   │   └── api.js                  # Axios instances + interceptors
│   │   ├── App.jsx                     # Router setup with lazy loading
│   │   ├── index.css                   # Tailwind + global styles
│   │   └── main.jsx                    # Entry point
│   ├── .env.production                 # Production environment variables
│   └── package.json
│
├── 📦 server/                          # Node.js Backend
│   ├── src/
│   │   ├── server.js                   # Entry point
│   │   ├── app.js                      # Express app setup
│   │   ├── config/
│   │   │   ├── db.js                   # Prisma client (adapter-pg)
│   │   │   └── cloudinary.js           # Cloudinary configuration
│   │   ├── docs/
│   │   │   └── swagger.js              # Swagger/OpenAPI 3.0 specs
│   │   ├── middlewares/
│   │   │   ├── auth.js                 # JWT authentication
│   │   │   ├── role.js                 # RBAC (restrictTo, restrictToAdminOrSelf, canUpdateRequestStatus)
│   │   │   ├── upload.js               # Multer (memory storage, 5MB limit, JPEG/PNG/PDF)
│   │   │   └── validate.js             # Joi validation middleware
│   │   ├── modules/
│   │   │   ├── auth/                   # Login, forgot-password, reset-password, change-password, logout
│   │   │   ├── buildings/              # CRUD (Admin only)
│   │   │   ├── apartments/             # CRUD + assign resident (Admin only)
│   │   │   ├── residents/              # CRUD + upload profile image + getMe
│   │   │   ├── staff/                  # CRUD (Admin only)
│   │   │   ├── documents/              # Upload/view/delete documents (Resident)
│   │   │   ├── requests/               # CRUD + assign staff + update status
│   │   │   ├── visitors/               # Pre-register + approve/reject
│   │   │   ├── announcements/          # CRUD (Admin) + view (all)
│   │   │   └── dashboard/              # Aggregated statistics
│   │   ├── prisma/
│   │   │   ├── schema.prisma           # 9 models, enums, relations, indexes
│   │   │   ├── seed.js                 # Full seed (130+ records)
│   │   │   └── migrations/             # Prisma migrations
│   │   └── utils/
│   │       ├── AppError.js             # Custom error class
│   │       ├── token.js                # JWT sign/verify helpers
│   │       ├── email.js                # Nodemailer transport (Gmail)
│   │       └── cloudinaryUpload.js     # Upload stream helper
│   ├── Dockerfile                      # Multi-stage Docker build
│   ├── docker-compose.yml              # Service orchestration
│   ├── prisma.config.js
│   └── package.json
│
├── 📄 docs/
│   ├── Compound Management System plan.txt   # Full project specification
│   ├── ERD Digram.png                        # Database entity relationship diagram
│   ├── Doc.pdf                               # Additional documentation
│   └── test performance.PNG                  # Performance testing results
│
├── vercel.json                        # Vercel deployment configuration
└── README.md                         # You are here
```

---

## ✨ Features

### 🔐 Authentication & Security
| Feature | Implementation |
|---|---|
| JWT-based login | 7-day access token, no refresh tokens |
| Password hashing | Bcryptjs with 10 salt rounds |
| RBAC middleware | Role-based route protection (3 roles) |
| Forgot/Reset password | Nodemailer + Gmail SMTP + 1-hour expiry token |
| Change password | Authenticated endpoint verifying old password |
| Rate limiting | 100 requests per 15 minutes per IP |
| Security headers | Helmet middleware |
| Input validation | Joi schemas for all request bodies |
| CORS | Whitelist for Vercel, Railway, localhost |

### 🏢 Building & Apartment Management (Admin)
- **CRUD** for buildings with search & pagination
- **CRUD** for apartments with search, status filter (EMPTY/OCCUPIED), & pagination
- **Assign residents** to apartments (auto-updates status to OCCUPIED)
- Duplicate detection (building number, apartment number)

### 👥 Resident & Staff Management (Admin)
- Create residents with email, password, phone, nationalId, optional apartment
- Create staff with email, password, phone, job title
- **Soft delete** with cascading effects (marks user, frees apartment)
- Profile image upload (Resident) — Cloudinary auto-detect
- Search by email, phone, nationalId

### 📄 Document Management (Resident)
- Upload **NATIONAL_ID**, **OWNERSHIP_CONTRACT**, **RENTAL_CONTRACT**
- Multer → Cloudinary (auto-detect images & PDF, 5MB limit)
- View own documents; Admin can view all
- Delete own documents

### 📋 Request System (Complaints & Maintenance)
| Role | Capabilities |
|---|---|
| **Resident** | Create request with optional image, view own, close (→ CLOSED) |
| **Admin** | View all, search/filter, assign staff (auto → IN_PROGRESS) |
| **Staff** | View assigned requests, update status |

- Status flow: `OPEN → IN_PROGRESS → COMPLETED → CLOSED`
- Types: `COMPLAINT`, `MAINTENANCE`
- Search across title, description, resident email/phone, assigned staff email

### 🚪 Visitor Management
- **Resident**: Pre-register visitors with name, phone, visit date
- **Admin/Staff**: View all, search by name/phone/apartment, approve/reject
- Status: `PENDING → APPROVED / REJECTED`

### 📢 Announcements
- **Admin**: Full CRUD with sorting (by createdAt, title) & date range filtering
- **Resident**: Read-only view of all announcements

### 📊 Admin Dashboard
Real-time aggregated statistics:
- Total residents, staff, buildings
- Apartments (total, occupied, empty, occupancy rate %)
- Requests broken down by status (OPEN, IN_PROGRESS, COMPLETED, CLOSED)

### 🔍 Advanced Filtering & Pagination
Every listing endpoint supports:
- **Search**: Across relevant fields (name, email, number, etc.)
- **Filter**: By status, type, date range where applicable
- **Pagination**: Returns `{ page, limit, total, totalPages, data }`
- **Sorting**: Announcements sortable by createdAt (asc/desc) or title (asc/desc)

---

## 🗄️ Database Schema

Nine models with carefully designed relationships and indexes.

```
User ──→ Resident (1:1)
User ──→ Staff (1:1)
User ──→ Announcement (1:Many)

Building ──→ Apartment (1:Many)
Apartment ──→ Resident (1:1)

Resident ──→ Document (1:Many)
Resident ──→ Request (1:Many)
Resident ──→ Visitor (1:Many)

Staff ──→ Request (1:Many)  [assigned staff]
```

### Indexes
- `User.email` — Fast login lookups
- `Resident.nationalId` — Unique ID verification
- `Apartment.number` — Unique apartment identification
- `Building.number` — Unique building numbering

### Enums
- `Role`: ADMIN, RESIDENT, STAFF
- `ApartmentStatus`: OCCUPIED, EMPTY
- `DocumentType`: NATIONAL_ID, OWNERSHIP_CONTRACT, RENTAL_CONTRACT
- `RequestType`: COMPLAINT, MAINTENANCE
- `RequestStatus`: OPEN, IN_PROGRESS, COMPLETED, CLOSED
- `VisitorStatus`: PENDING, APPROVED, REJECTED

---

## 🌐 API Endpoints

<details>
<summary><b>🔐 Authentication</b></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Login with email + password |
| POST | `/api/auth/forgot-password` | ❌ | Request password reset email |
| POST | `/api/auth/reset-password` | ❌ | Reset password with token |
| POST | `/api/auth/change-password` | ✅ | Change password (authenticated) |
| POST | `/api/auth/logout` | ❌ | Logout (stateless) |
</details>

<details>
<summary><b>🏢 Buildings</b> <i>(Admin Only)</i></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/buildings` | List (search + pagination) |
| POST | `/api/buildings` | Create |
| GET | `/api/buildings/:id` | Get one (with apartments) |
| PUT | `/api/buildings/:id` | Update |
| DELETE | `/api/buildings/:id` | Delete |
</details>

<details>
<summary><b>🏠 Apartments</b> <i>(Admin Only)</i></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/apartments` | List (search + filter by status + pagination) |
| POST | `/api/apartments` | Create |
| PUT | `/api/apartments/:id` | Update |
| DELETE | `/api/apartments/:id` | Delete |
| POST | `/api/apartments/:id/assign` | Assign resident |
</details>

<details>
<summary><b>👤 Residents</b></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/residents` | Admin | List (search + pagination) |
| POST | `/api/residents` | Admin | Create (with optional apartment) |
| GET | `/api/residents/me` | Resident | Get own profile |
| GET | `/api/residents/:id` | Admin/Self | Get profile |
| PUT | `/api/residents/:id` | Admin | Update |
| DELETE | `/api/residents/:id` | Admin | Soft delete |
| POST | `/api/residents/profile-image` | Resident | Upload profile image (multipart) |
</details>

<details>
<summary><b>👷 Staff</b></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/staff` | Admin | List (search + pagination) |
| POST | `/api/staff` | Admin | Create |
| GET | `/api/staff/:id` | Admin/Self | Get profile |
| DELETE | `/api/staff/:id` | Admin | Soft delete |
</details>

<details>
<summary><b>📄 Documents</b></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/documents` | Admin/Resident | List (Admin: all, Resident: own) |
| POST | `/api/documents` | Resident | Upload (type + file, multipart) |
| DELETE | `/api/documents/:id` | Resident | Delete own |
</details>

<details>
<summary><b>📋 Requests</b></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/requests` | All | List (scoped by role, search + filter + pagination) |
| POST | `/api/requests` | Resident | Create (with optional image, multipart) |
| POST | `/api/requests/:id/assign` | Admin | Assign staff (auto → IN_PROGRESS) |
| PATCH | `/api/requests/:id/status` | All | Update status (role-constrained) |
</details>

<details>
<summary><b>🚪 Visitors</b></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/visitors` | All | List (scoped, search + filter + pagination) |
| POST | `/api/visitors` | Resident | Pre-register |
| PATCH | `/api/visitors/:id/status` | Staff/Admin | Approve/Reject |
</details>

<details>
<summary><b>📢 Announcements</b></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/announcements` | All | List (sort + date filter + pagination) |
| POST | `/api/announcements` | Admin | Create |
| GET | `/api/announcements/:id` | All | Get one |
| PUT | `/api/announcements/:id` | Admin | Update |
| DELETE | `/api/announcements/:id` | Admin | Delete |
</details>

<details>
<summary><b>📊 Dashboard</b></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/stats` | Admin | Aggregated statistics |
</details>

---

## 🔒 Role-Based Access Control (RBAC)

The system implements a three-tier RBAC model with composable middleware:

### Middleware Architecture

```
Request → authMiddleware (JWT verify) → roleMiddleware (permission check) → controller
```

| Middleware | Function |
|---|---|
| `authMiddleware` | Decodes JWT, fetches user+profile from DB, attaches `req.user` |
| `restrictTo(roles...)` | Allows only specified roles access |
| `restrictToAdminOrSelf(paramName, userField)` | Admin OR the resource owner |
| `canUpdateRequestStatus` | Role-specific status update logic |

### Permission Matrix

| Resource | Admin | Resident | Staff |
|----------|-------|----------|-------|
| Buildings | ✅ CRUD | ❌ | ❌ |
| Apartments | ✅ CRUD + Assign | ❌ | ❌ |
| Residents | ✅ CRUD | 👤 Own profile only | ❌ |
| Staff | ✅ CRUD | ❌ | 👤 Own profile |
| Documents | ✅ View all | ✅ Upload own, view own | ❌ |
| Requests | ✅ View all, assign, update status | ✅ Create own, view own, close own | ✅ View assigned, update status |
| Visitors | ✅ View all, approve/reject | ✅ Pre-register, view own | ✅ View all, approve/reject |
| Announcements | ✅ CRUD | ✅ View | ❌ |
| Dashboard | ✅ View | ❌ | ❌ |

---

## 🛡️ Authentication & Security

### Authentication Flow
```
Login Request (/api/auth/login)
      │
      ▼
  Validate (Joi) ──❌──→ 400 Bad Request
      │✅
      ▼
  Find user by email ──❌──→ 401 Invalid credentials
      │✅
      ▼
  bcrypt.compare(password, hash) ──❌──→ 401 Invalid credentials
      │✅
      ▼
  Generate JWT (7d expiry)
      │
      ▼
  Response: { user, accessToken }
```

### Security Measures
| Layer | Protection |
|---|---|
| **Helmet** | Sets security headers (CSP, HSTS, X-Frame-Options, etc.) |
| **Rate Limiting** | 100 requests / 15 min per IP (disabled in dev) |
| **Joi Validation** | Prevents injection & malformed input attacks |
| **Bcrypt** | 10 salt rounds — computationally expensive for brute force |
| **CORS** | Whitelist restricted to known origins only |
| **JWT** | Stateless, signed with secret, 7-day expiry |
| **Soft Deletes** | Prevents accidental data loss via hard deletes |
| **Multer Limits** | 5MB max file size, only JPEG/PNG/PDF allowed |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- PostgreSQL database (local or Neon)
- Cloudinary account (for file uploads)
- Gmail account (for password reset emails)

### 1. Clone the Repository
```bash
git clone https://github.com/oomarmostafaa/Compound-Management-System.git
cd Compound-Management-System
```

### 2. Backend Setup

```bash
cd server

# Copy environment variables
cp .env.example .env   # (create .env from template below)

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database with demo data
npm run seed

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:5173`.

---

## 🐳 Docker Setup

The entire application can be run using Docker Compose:

```bash
cd server

# Build and start containers
docker-compose up --build

# Run migrations
docker-compose exec app npx prisma migrate dev

# Seed the database
docker-compose exec app npm run seed
```

The `Dockerfile` uses a multi-stage build with `node:20-alpine` for a minimal production image (~150MB).

---

## 🌍 Deployment

The application is deployed across three services:

### Frontend → Vercel
- **URL**: [compound-management-system-pkiucbo4b-omar-mostafa-s-projects.vercel.app](https://compound-management-system-pkiucbo4b-omar-mostafa-s-projects.vercel.app/)
- **Configuration**: `vercel.json` — SPA rewrites, build from `client/`
- **Build Command**: `cd client && npm install && npm run build`
- **Output Directory**: `client/dist`
- **Environment**: `VITE_API_URL` set to Railway backend URL

### Backend → Swagger
- **URL**: [compound-management-system-production.up.railway.app](https://compound-management-system-production.up.railway.app/api-docs/)
- **Swagger Docs**: `/api-docs`
- **Configuration**: Dockerfile-based deployment
- **Environment**: All variables from `.env` (see table below)

### Database → Neon
- Serverless PostgreSQL with auto-scaling
- Connection via pooled `DATABASE_URL_PRODUCTION`

---

## 🔑 Environment Variables

Create a `.env` file in the `server/` directory:

```env
# ─── Server ───
PORT=5000
NODE_ENV=development

# ─── Database (PostgreSQL) ───
DATABASE_URL=postgresql://user:password@localhost:5432/compound_db
DATABASE_URL_PRODUCTION=postgresql://user:password@ep-...neon.tech/compound_db?sslmode=require

# ─── JWT ───
JWT_ACCESS_SECRET=your-super-secret-jwt-key-change-in-production

# ─── Cloudinary ───
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── Email (Gmail SMTP) ───
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM="Compound Hub" <noreply@compoundhub.com>

# ─── API URL (for Swagger) ───
API_URL=https://compound-management-system-production.up.railway.app
```

### Frontend Environment (`client/.env.production`)
```env
VITE_API_URL=https://compound-management-system-production.up.railway.app
```

---

## 🌱 Seed Data

Run `npm run seed` from the `server/` directory to populate the database with:

| Data | Count | Details |
|------|-------|---------|
| 👤 Admin | 1 | `admin@compound.com` / `admin123` |
| 🏢 Buildings | 20 | Arabic names (الفرسان, الأندلس, غرناطة...) |
| 🏠 Apartments | 60 | 3 per building (20 floors × 3) |
| 👨‍👩‍👧‍👦 Residents | 40 | `resident1@compound.com`..`resident40@compound.com` / `resident123` |
| 👷 Staff | 39 | `staff1@compound.com`..`staff39@compound.com` / `staff123` (Electricians, Plumbers, Security...) |
| 📋 Requests | 40 | Mix of COMPLAINT + MAINTENANCE across all statuses |
| 🚶 Visitors | 30 | PENDING (10) + APPROVED (10) + REJECTED (10) |
| 📄 Documents | 20 | NATIONAL_ID, OWNERSHIP_CONTRACT, RENTAL_CONTRACT |
| 📢 Announcements | 10 | Community updates in Arabic |

---

## 🎨 Frontend Overview

The frontend is a modern React SPA with:

### Routing
- **Public routes**: `/login`, `/forgot-password`, `/reset-password`
- **Admin routes**: `/admin/dashboard`, `/admin/buildings`, `/admin/apartments`, `/admin/residents`, `/admin/staff`, `/admin/requests`, `/admin/visitors`, `/admin/announcements`
- **Resident routes**: `/resident/profile`, `/resident/requests`, `/resident/visitors`, `/resident/announcements`
- **Staff routes**: `/staff/tasks`, `/staff/security`

### UI/UX Features
- **Dark theme** with glass-morphism design
- **Framer Motion** animations (spring-based transitions, layout animations)
- **Responsive** layout with Tailwind CSS
- **Lazy loading** with `React.lazy()` and `<Suspense>` for code splitting
- **Token-based session restoration** on page reload
- **Role-based navigation** (Navbar adapts to user role)
- **Protected routes** with `<ProtectedRoute>` component

### State Management
- **AuthContext** provides user state, login/logout, and token management globally
- **JWT payload decoding** for instant session restoration (no extra API call)

---

## 📐 Code Quality & Patterns

### Backend Patterns
- **Controller-Service-Validation** separation per module
- **Async error handling** with `try/catch` + `next(error)` → global error middleware
- **Custom `AppError`** class for predictable error responses
- **Prisma transactions** for atomic multi-table operations
- **Memory-efficient file uploads** (Multer memoryStorage → Cloudinary stream)
- **Consistent pagination** format across all list endpoints

### Frontend Patterns
- **Axios interceptors** for automatic JWT injection
- **Lazy-loaded routes** for optimal initial bundle size
- **CSS utility-first** with Tailwind (no separate CSS files for components)
- **Context API** for auth state (no Redux overhead for this scale)
- **Controlled forms** with immediate validation feedback

### Best Practices Followed
- ✅ Environment variables for all secrets
- ✅ Input validation on all endpoints
- ✅ Role-based access control on every protected route
- ✅ Soft deletes for critical data
- ✅ Rate limiting in production
- ✅ Security headers via Helmet
- ✅ CORS whitelist
- ✅ Password hashing with bcrypt
- ✅ JWT with expiry
- ✅ Docker multi-stage builds
- ✅ Consistent error response format

---

## 🧪 Quality Assurance & Testing Strategy

To ensure system stability under heavy transactional scenarios, a comprehensive quality assurance strategy is enforced across backend and frontend boundaries:

| Testing Method | Purpose |
|---|---|
| **Manual API Testing (Swagger)** | Structured visual exploration and immediate validation of request/response contracts during localized endpoint adjustments |
| **Postman Collection Validation** | Rapid integration testing, environment variable parity, and bulk request staging configurations |
| **Load Testing (Autocannon)** | Benchmarks server resilience, requests-per-second thresholds, and continuous database connection pooling stamina |
| **Frontend Performance (Lighthouse)** | Audits core web vitals, page load dynamics, semantic structure accessibility, and bundle delivery footprints |

---

## 📊 Backend Load Testing & Stress Performance

To verify production readiness, the backend API underwent rigorous stress testing using **Autocannon**. The load testing script bombarded the Express runtime with continuous concurrent pipeline connections for 30 seconds.

| Load Testing Metric | Result | Assessment |
|---|---|---|
| **Average Response Time** | **35 ms** | 🟢 Ultra-low latency |
| **Requests per Second (RPS)** | **900+ req/sec** | 🟢 High throughput capacity |
| **Data Throughput** | **1.8 MB/s** | 🟢 Optimized payload transfer |
| **Failed Requests** | **0 failures** | 🟢 100% stability under load |
| **HTTP Keep-Alive** | Enabled | Optimizes connection re-use |
| **Test Duration** | 30 seconds | Sustained heavy concurrency |

### Performance Highlights

- **Zero Failed Requests**: The Express middleware pipeline processed over **27,000 requests** without a single connection drop or execution timeout.
- **Database Sub-Millisecond Speed**: Leveraged connection pooling via Prisma ORM to prevent database connection exhaustion under heavy loads.
- **Optimized Middleware Stack**: Removed redundant logic to ensure fast request-response lifecycles.

---

## 🎯 Frontend Quality & Google Lighthouse Audit

The client application was thoroughly audited using **Google Lighthouse** inside a simulated mobile environment to ensure the user experience remains fast and fluid even on lower-tier networks.

| Lighthouse Category | Score | Assessment |
|---|---|---|
| **Performance** | **92 / 100** | 🟢 Excellent |
| **Accessibility** | **91 / 100** | 🟢 Excellent |
| **Best Practices** | **96 / 100** | 🟢 Excellent |
| **SEO Optimization** | **92 / 100** | 🟢 Excellent |

### Core Web Vitals Deep-Dive

Beyond broad categories, the React frontend was tuned to pass Google's strict **Core Web Vitals** criteria on mobile network topologies.

| Core Web Vital | Measured Result | Threshold Assessment |
|---|---|---|
| **First Contentful Paint (FCP)** | **2.4 s** | 🟢 Good |
| **Largest Contentful Paint (LCP)** | **2.9 s** | 🟢 Good |
| **Total Blocking Time (TBT)** | **40 ms** | 🟢 Excellent |
| **Cumulative Layout Shift (CLS)** | **0.00** | 🟢 Perfect — Zero Shift |
| **Speed Index** | **2.4 s** | 🟢 Excellent |

### Frontend Optimization Techniques

- **Production Bundling via Vite**: Splitting dependencies into optimized chunks, reducing initial JavaScript payloads.
- **Code Splitting & Lazy Loading**: Components render only when required by the client routing path.
- **Asset Management**: Strict image dimensions and modern formats prevent unexpected layout shifting during page assembly.

---

<div align="center">

**Built with ❤️ by [Omar Mostafa](https://github.com/oomarmostafaa)**

[![GitHub](https://img.shields.io/badge/GitHub-oomarmostafaa-181717?style=for-the-badge&logo=github)](https://github.com/oomarmostafaa)

---

</div>
