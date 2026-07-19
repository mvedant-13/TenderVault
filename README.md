# TenderVault

A full-stack **Tender Management System** built with the MERN stack. Organizations post tenders, vendors submit bids, and admins review and award contracts. AI features assist with summarization, bid scoring, and compliance checking.

---

## Tech Stack

| Layer       | Technology                                                             |
| ----------- | ---------------------------------------------------------------------- |
| Frontend    | React (Vite) + Vanilla CSS, React Router, Axios, React Hook Form + Zod |
| Backend     | Node.js + Express 5 (ESM / `"type": "module"`)                         |
| Database    | MongoDB + Mongoose 9                                                   |
| Auth        | JWT + bcryptjs                                                         |
| File Upload | Multer (local dev) → Cloudinary/S3 (production) — planned              |
| AI          | OpenAI / Anthropic API (planned)                                       |

---

## Project Structure

```
TenderVault/
├── .gitignore
├── client/
│   ├── src/
│   │   ├── api/            axiosInstance.js, authApi.js, tenderApi.js
│   │   ├── context/        AuthContextObject.js, AuthContext.jsx, useAuth.js
│   │   ├── components/     Navbar.jsx, ProtectedRoute.jsx
│   │   ├── pages/          Login.jsx, Register.jsx, Dashboard.jsx, Unauthorized.jsx,
│   │   │                   Tenders.jsx, Tenders.css, MyTenders.jsx, MyTenders.css
│   │   ├── routes/         AppRoutes.jsx
│   │   ├── utils/          validationSchemas.js
│   │   ├── App.jsx, App.css, index.css, main.jsx
│   ├── .env / .env.example
│
└── server/
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── User.js
    │   └── Tender.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── tenderRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   └── tenderController.js
    ├── middleware/
    │   ├── authMiddleware.js       (protect, authorizeRoles)
    │   └── uploadMiddleware.js     (multer config)
    ├── utils/
    │   ├── generateToken.js
    │   ├── cleanupUploadedFiles.js
    │   └── handleControllerError.js
    ├── uploads/
    │   └── tenders/                (local file storage — dev only)
    ├── .env
    ├── .env.example
    └── server.js
```

---

## Data Models

**User** — `name`, `email`, `password (hashed)`, `role (admin|vendor)`, `companyName`, `gstNumber`

**Tender** — `title`, `description`, `department`, `category`, `budget`, `deadline`, `status (open|closed|awarded, default: open)`, `documents[] ({fileName, filePath, uploadedAt})`, `aiSummary`, `createdBy → User`

**Bid** _(planned)_ — `tender → Tender`, `vendor → User`, `quotedPrice`, `deliveryTime`, `documents[]`, `aiScore`, `aiFlags[]`, `status (submitted|shortlisted|rejected|awarded)`

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally (or Atlas URI)
- WSL2 / Linux / macOS terminal

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/TenderVault.git
cd TenderVault

# Backend
cd server
npm install

# Frontend (separate terminal)
cd ../client
npm install
```

### Environment Variables

**Server** — copy `server/.env.example` to `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/tendervault
JWT_SECRET=your_long_random_secret_here
NODE_ENV=development
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Client** — copy `client/.env.example` to `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Run

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

> **WSL note:** MongoDB (via systemd) does not auto-start on new WSL sessions. Run `sudo systemctl start mongod` before starting the server if you get an `ECONNREFUSED 127.0.0.1:27017` error.

---

## API Reference (Implemented)

### Auth

| Method | Endpoint             | Access | Description                |
| ------ | -------------------- | ------ | -------------------------- |
| POST   | `/api/auth/register` | Public | Register (admin or vendor) |
| POST   | `/api/auth/login`    | Public | Login, returns JWT         |

### Tenders

| Method | Endpoint           | Access               | Description                                                                                   |
| ------ | ------------------ | -------------------- | --------------------------------------------------------------------------------------------- |
| POST   | `/api/tenders`     | Admin only           | Create a tender (multipart/form-data, up to 5 documents)                                      |
| GET    | `/api/tenders`     | Any logged-in user   | List tenders — supports `?status=`, `?category=`, and `?createdBy=` filters                   |
| GET    | `/api/tenders/:id` | Any logged-in user   | Get a single tender by ID                                                                     |
| PUT    | `/api/tenders/:id` | Admin (creator only) | Update a tender; supports adding new files and removing existing ones via `documentsToDelete` |
| DELETE | `/api/tenders/:id` | Admin (creator only) | Delete a tender and its associated files                                                      |

**Notes:**

- Only the admin who created a tender can update or delete it — other admins are blocked.
- `?createdBy=<userId>` filters tenders by the creating admin — used by the admin's "My Tenders" view so ownership filtering happens on the backend, not by fetching everything and filtering client-side.
- `documentsToDelete` (on PUT) accepts a JSON-stringified array of document `_id`s to remove, e.g. `["64f1a2b3c4d5e6f7g8h9i0j1"]`.
- Deleting a tender, or removing individual documents on update, also deletes the corresponding files from `server/uploads/tenders/`.
- Uploaded files are validated for type (`pdf`, `doc`, `docx`, `jpeg`, `png`) and size (10MB limit per file).

### Testing in Postman

For protected routes, set in the **Authorization** tab:

- Type: **Bearer Token**
- Token: paste JWT from the login response

For tender create/update requests, use **Body → form-data** (not raw JSON) since these routes accept file uploads alongside text fields.

---

## Frontend Routes (Implemented)

| Path            | Access       | Description                                                                                                              |
| --------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `/login`        | Public       | Login form                                                                                                               |
| `/register`     | Public       | Registration form (choose admin or vendor)                                                                               |
| `/dashboard`    | Admin/Vendor | Placeholder landing page                                                                                                 |
| `/tenders`      | Admin only   | Read-only table of all tenders (all statuses, all admins). Will extend to vendors in Step 8, scoped to open tenders only |
| `/my-tenders`   | Admin only   | The logged-in admin's own tenders — create, edit, and delete, with file upload/removal                                   |
| `/unauthorized` | —            | Shown when a logged-in user hits a route their role can't access                                                         |

---

## Error Handling

All controllers return a safe, generic message to the client (`{ message: "..." }`) while logging full error details server-side only. Common response codes:

| Status | Meaning                                                  |
| ------ | -------------------------------------------------------- |
| 400    | Missing/invalid fields, invalid ID format, past deadline |
| 401    | Missing or invalid JWT                                   |
| 403    | Authenticated but not authorized for this action         |
| 404    | Resource not found                                       |
| 409    | Duplicate value (e.g. email already registered)          |
| 500    | Unexpected server error                                  |

---

## Roadmap

- [x] Phase 0 — Foundation (server, MongoDB, auth APIs, auth middleware)
- [x] Phase 1 — Frontend skeleton (auth pages, protected routing, navbar)
- [x] Phase 2, Step 6 — Tender CRUD APIs (backend)
- [ ] Phase 2, Step 7 — Admin dashboard (frontend) — built and styled (`Tenders.jsx` + `MyTenders.jsx`), end-to-end testing pending
- [ ] Phase 2, Step 8 — Vendor tender browsing (frontend)
- [ ] Phase 3 — Bid slice (APIs + vendor/admin dashboards)
- [ ] Phase 4 — AI features (summarization, bid scoring, compliance checks)
- [ ] Phase 5 — Notifications, UI polish, testing
- [ ] Phase 6 — Deployment (Atlas + Render/Railway + Vercel)
