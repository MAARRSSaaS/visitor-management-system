# 🏢 Visitor Management System


<p align="center">
  A secure, web-based <strong>Visitor Management System</strong> that digitizes visitor check-ins, check-outs, and pre-approvals for an organization — replacing manual front-desk logbooks with a fast, auditable digital workflow.
</p>

---

## 📖 Overview

This system allows **Employees** to pre-register expected guests ("Visitor Requests"), and lets **Admins / Security Personnel** approve or reject those requests, check visitors in when they physically arrive, check them out when they leave, and maintain a complete, searchable audit trail of every visit.

The core workflow:

\`\`\`
Employee creates request → Admin approves/rejects → Admin checks in visitor → Admin checks out visitor
\`\`\`

---

## ✨ Key Features

- 🔐 **Role-Based Access Control (RBAC)** — two distinct roles, **Admin** and **Employee**, each with their own permissions and dashboard.
- 🔑 **Secure JWT Authentication** — token-based login, persisted client-side, with automatic logout on token expiration.
- 📝 **Employee Workflow (Hosts)** — employees pre-register visitors with name, email, phone, company, host, purpose, and visit date/time.
- ✅ **Admin Approval Workflow** — a master dashboard of all requests, with approve/reject actions (rejections require remarks).
- 🚪 **Check-In / Check-Out** — admins record physical arrival and departure, automatically generating a visitor activity log entry.
- 📊 **Comprehensive Audit Logs** — full historical log of all visits, filterable by active/past sessions, visitor name, and status.
- 🔍 **Search, Filter & Pagination** — every listing screen supports search, status/date filtering, and paginated results.
- 🚫 **Duplicate Prevention** — a visitor cannot be checked in twice while already active.
- 💅 **Modern, Responsive UI** — built with Tailwind CSS, featuring slide-in modals, real-time toast notifications, and interactive data tables.
- ⚠️ **Robust Validation & Error Handling** — consistent, meaningful success/failure messages across the app.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **React Router DOM** | Client-side routing & route guarding |
| **Axios** | HTTP client with request/response interceptors |
| **React Hook Form** | Form state management & validation |
| **React Toastify** | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** (Python) | REST API framework |
| **SQLAlchemy (Async)** | ORM / database access layer |
| **Alembic** | Database migrations |
| **PostgreSQL** | Relational database |
| **Passlib / Bcrypt** | Password hashing |
| **Python-JOSE** | JWT creation & verification |
| **Pydantic** | Request/response schema validation |

### Infrastructure
| Component | Notes |
|---|---|
| **Uvicorn** | ASGI server for FastAPI |
| **Environment-based config** | `.env` files for backend and frontend |
| **Monorepo structure** | `backend/` and `frontend/` in a single repository |

---

## 📁 Project Structure

\`\`\`
visitor-management-system/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entrypoint, CORS, middleware
│   │   ├── core/                   # Config & security (JWT, password hashing)
│   │   ├── db/                     # Async engine/session setup, Base
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── repositories/           # Data-access layer (DB queries)
│   │   ├── api/
│   │   │   └── v1/                 # Routers: auth, users, visitor-requests, visitor-logs
│   │   └── deps.py                 # Dependency injection (current user, role guards)
│   ├── alembic/                    # Migration scripts
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/              # Navbar, Modals, DataTable, etc. (reusable UI)
│   │   ├── pages/                    # AdminDashboard, EmployeeDashboard, Login, Register
│   │   ├── api/                      # Axios instance & service calls
│   │   ├── context/                  # AuthContext (JWT/session state)
│   │   └── App.jsx
│   └── .env.example
└── README.md
\`\`\`

---

## ✅ Prerequisites

Make sure the following are installed on your machine before setting up the project:

- **Python 3.12+**
- **Node.js 18+** and **npm**
- **PostgreSQL 14+** (running locally or accessible remotely)
- **Git**

---

## ⚙️ Backend Setup

\`\`\`bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Open .env and set your DATABASE_URL, SECRET_KEY, and FRONTEND_URL

# 5. Create the database (if it doesn't already exist)
# psql -U postgres -c "CREATE DATABASE vms_db;"

# 6. Run database migrations
alembic upgrade head

# 7. Start the development server
uvicorn app.main:app --reload
\`\`\`

The API will be available at **http://localhost:8000**, with interactive Swagger documentation at **http://localhost:8000/docs**.

---

## 💻 Frontend Setup

\`\`\`bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Open .env and set VITE_API_URL to point to your running backend

# 4. Start the development server
npm run dev
\`\`\`

The app will be available at **http://localhost:5173**.

> ⚠️ Ensure the backend is running first, and that its `FRONTEND_URL` (CORS setting) matches the frontend's dev server URL.

---

## 🔑 Environment Variables

### Backend — `backend/.env.example`

\`\`\`env
# Database
DATABASE_URL=postgresql+asyncpg://vms_user:vms_password@localhost:5432/vms_db

# JWT
SECRET_KEY=change_this_to_a_long_random_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS
FRONTEND_URL=http://localhost:5173
\`\`\`

### Frontend — `frontend/.env.example`

\`\`\`env
VITE_API_URL=http://localhost:8000/api/v1
\`\`\`

---

## 🌐 API Architecture

All endpoints are prefixed with **`/api/v1`**. Full interactive documentation is always available at **`/docs`** (Swagger UI) once the backend is running.

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user (Admin or Employee) |
| `POST` | `/auth/login` | Public | Login and receive a JWT access token |
| `GET` | `/auth/me` | Bearer Token | Get the current logged-in user's profile |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users` | Bearer Token | List all active users |

### Visitor Requests
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/visitor-requests` | Bearer Token | Create a new visitor request |
| `GET` | `/visitor-requests` | Bearer Token | List all requests (paginated, searchable, filterable) |
| `GET` | `/visitor-requests/my` | Bearer Token | List the current employee's own requests |
| `GET` | `/visitor-requests/{id}` | Bearer Token | Get a specific request by ID |
| `PUT` | `/visitor-requests/{id}` | Bearer Token | Update a visitor request |
| `DELETE` | `/visitor-requests/{id}` | Admin Only | Delete a visitor request |
| `POST` | `/visitor-requests/{id}/approve` | Admin Only | Approve a pending request |
| `POST` | `/visitor-requests/{id}/reject` | Admin Only | Reject a request (with remarks) |
| `POST` | `/visitor-requests/{id}/cancel` | Employee (Owner) | Cancel your own pending request |
| `POST` | `/visitor-requests/{id}/check-in` | Admin Only | Check in visitor & create an activity log |
| `POST` | `/visitor-requests/{id}/check-out` | Admin Only | Check out visitor & close the activity log |

### Visitor Logs
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/visitor-logs` | Admin Only | List all visitor activity logs (paginated) |

### Query Parameters

| Parameter | Used On | Description |
|---|---|---|
| `page` | `/visitor-requests`, `/visitor-logs` | Page number (default: `1`) |
| `page_size` | `/visitor-requests`, `/visitor-logs` | Items per page (default: `10`) |
| `search` | `/visitor-requests` | Search across name, email, phone, company, purpose, host |
| `status` | `/visitor-requests`, `/visitor-logs` | Filter by status: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `COMPLETED` |
| `date` | `/visitor-requests` | Filter by visit date (`YYYY-MM-DD`) |
| `is_active` | `/visitor-logs` | Filter currently checked-in visitors (`true` / `false`) |

---

## 🔐 Authentication Flow

1. A user registers via `POST /auth/register`, specifying a `role` of either `ADMIN` or `EMPLOYEE`.
2. On `POST /auth/login`, the backend verifies credentials and issues a **JWT access token** containing the user's identity and role.
3. The frontend stores this token (e.g. in `localStorage`) and attaches it to every subsequent request as an `Authorization: Bearer <token>` header via an Axios interceptor.
4. On each protected request, the backend decodes the token, resolves the current user via dependency injection, and enforces **role guards** — e.g. only `ADMIN` tokens can hit `/visitor-requests/{id}/approve`.
5. On the frontend, the decoded role determines which dashboard is rendered:
   - `ADMIN` → **Admin Dashboard** (all requests, approvals, check-in/out, logs)
   - `EMPLOYEE` → **Employee Dashboard** (create/view/manage own requests)
6. If a request returns `401 Unauthorized` (expired or invalid token), the Axios response interceptor clears the stored session and redirects the user back to the **Login** page automatically.

---

## 🤝 Contribution Guidelines

Contributions are welcome! To contribute:

1. **Fork** the repository.
2. Create a feature branch:
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`
3. Commit your changes with clear, descriptive messages:
   \`\`\`bash
   git commit -m "feat: add visitor check-out reminder notifications"
   \`\`\`
4. Push to your fork and open a **Pull Request** against `main`.
5. Ensure your code follows the existing project structure and passes any existing tests before submitting.

Please open an issue first for major changes, to discuss what you'd like to change.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ to replace the front-desk logbook, one visitor at a time.</p>
