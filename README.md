# TenderVault

A full-stack **Tender Management System** built with the MERN stack. Organizations post tenders, vendors submit bids, and admins review and award contracts. AI features assist with summarization, bid scoring, and compliance checking.

---

## Tech Stack

| Layer       | Technology                                                                       |
| ----------- | -------------------------------------------------------------------------------- |
| Frontend    | React (Vite) + Vanilla CSS, React Router, Axios, React Hook Form + Zod           |
| Backend     | Node.js + Express 5 (ESM / `"type": "module"`)                                   |
| Database    | MongoDB + Mongoose 9                                                             |
| Auth        | JWT + bcryptjs                                                                   |
| File Upload | Multer (local dev, per-entity subfolders) → Cloudinary/S3 (production) — planned |
| AI          | OpenAI / Anthropic API (planned)                                                 |

---

## Project Structure

```
TenderVault/
├── .gitignore
├── client/
│   ├── src/
│   │   ├── api/          axiosInstance.js, authApi.js, tenderApi.js, bidApi.js
│   │   ├── context/      AuthContextObject.js, AuthContext.jsx, useAuth.js
│   │   ├── components/   Navbar.jsx, Navbar.css, ProtectedRoute.jsx, TenderForm.jsx,
│   │   │                 TenderForm.css, BidForm.jsx, BidForm.css
│   │   ├── pages/        Login.jsx, Register.jsx, Dashboard.jsx, Unauthorized.jsx,
│   │   │                 Tenders.jsx, MyTenders.jsx, TenderDetail.jsx, TenderFormPage.jsx,
│   │   │                 MyBids.jsx, BidFormPage.jsx, TenderBids.jsx
│   │   ├── routes/       AppRoutes.jsx
│   │   ├── utils/        validationSchemas.js
│   │   ├── App.jsx, App.css, index.css, main.jsx
│   ├── .env / .env.example
│
└── server/
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── User.js
    │   ├── Tender.js
    │   └── Bid.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── tenderRoutes.js
    │   └── bidRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   ├── tenderController.js
    │   └── bidController.js
    ├── middleware/
    │   ├── authMiddleware.js      (protect, authorizeRoles)
    │   └── uploadMiddleware.js    (createUploader factory — per-subfolder multer instances)
    ├── utils/
    │   ├── generateToken.js
    │   ├── cleanupUploadedFiles.js
    │   └── handleControllerError.js
    ├── uploads/
    │   ├── tenders/   (local file storage — dev only)
    │   └── bids/      (local file storage — dev only)
    ├── .env
    ├── .env.example
    └── server.js
```

---

## Design System

Vanilla CSS with custom properties defined in `client/src/index.css`:

- **Colors:** `--color-bg`, `--color-surface`, `--color-primary`, `--color-primary-dark`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-error`, `--color-error-bg`
- **Spacing scale:** `--space-2xs` through `--space-2xl` (0.25rem–3rem), used consistently across all page and component stylesheets instead of ad-hoc values
- **Motion:** `--transition-fast` (150ms ease) applied to buttons, table rows, and hover states
- **Elevation:** `--shadow-card` (default) and `--shadow-card-hover` (on hover)
- **Accessibility:** a global `:focus-visible` outline is defined once and applies app-wide

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

| Method | Endpoint             | Access | Description                                                                                     |
| ------ | -------------------- | ------ | ----------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/register` | Public | Register (admin or vendor)                                                                      |
| POST   | `/api/auth/login`    | Public | Login, returns JWT and user object (`_id`, `name`, `email`, `role`, `companyName`, `gstNumber`) |

### Tenders

| Method | Endpoint           | Access               | Description                                                                                   |
| ------ | ------------------ | -------------------- | --------------------------------------------------------------------------------------------- |
| POST   | `/api/tenders`     | Admin only           | Create a tender (multipart/form-data, up to 5 documents)                                      |
| GET    | `/api/tenders`     | Any logged-in user   | List tenders — supports `?status=`, `?category=`, and `?createdBy=` filters                   |
| GET    | `/api/tenders/:id` | Any logged-in user   | Get a single tender by ID                                                                     |
| PUT    | `/api/tenders/:id` | Admin (creator only) | Update a tender; supports adding new files and removing existing ones via `documentsToDelete` |
| DELETE | `/api/tenders/:id` | Admin (creator only) | Delete a tender and its associated files                                                      |

**Notes:**

- Only the admin who created a tender can update, delete, or view bids on it — other admins are blocked.
- `?createdBy=<userId>` filters tenders by the creating admin — used by the admin's "My Tenders" view.
- `documentsToDelete` (on PUT) accepts a JSON-stringified array of document `_id`s to remove.
- Deleting a tender, or removing individual documents on update, also deletes the corresponding files from disk.
- Uploaded files are validated for type (`pdf`, `doc`, `docx`, `jpeg`, `png`) and size (10MB limit per file).

### Bids

| Method | Endpoint               | Access                        | Description                                                                                                                    |
| ------ | ---------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/api/bids`            | Vendor only                   | Submit a bid on an open tender (multipart/form-data, up to 5 documents). One bid per tender per vendor.                        |
| GET    | `/api/bids`            | Any logged-in user            | Vendors: always returns only their own bids. Admins: requires `?tender=<id>`, returns bids only if the admin owns that tender. |
| GET    | `/api/bids/:id`        | Owning vendor or owning admin | Get a single bid by ID                                                                                                         |
| PUT    | `/api/bids/:id`        | Owning vendor only            | Edit `quotedPrice`, add/remove documents — only while `status === "submitted"` and before the tender's deadline                |
| DELETE | `/api/bids/:id`        | Owning vendor only            | Withdraw a bid — only while `status === "submitted"` and before the tender's deadline                                          |
| PUT    | `/api/bids/:id/status` | Admin (tender owner only)     | Change bid status to `shortlisted`, `rejected`, or `awarded`                                                                   |

**Notes:**

- A vendor cannot submit more than one bid on the same tender (enforced via a unique compound index in the schema, not just app logic).
- Bids can only be created against tenders with `status: "open"` and a future deadline.
- The `tender` ID is sent inside the FormData body on `POST /api/bids` (not as a query param).
- Once an admin changes a bid's status away from `submitted`, the vendor can no longer edit or withdraw it.
- Bid status can only move to `shortlisted`, `rejected`, or `awarded` — it can never be reverted back to `submitted` via this endpoint.
- `documentsToDelete` on `PUT /api/bids/:id` follows the same convention as Tenders — a JSON-stringified array of document `_id`s.
- Bid documents are stored in `server/uploads/bids/`, separate from tender documents in `server/uploads/tenders/`, both served via the same `/uploads` static mount.

### Testing in Postman

For protected routes, set in the **Authorization** tab:

- Type: **Bearer Token**
- Token: paste JWT from the login response

For tender/bid create/update requests, use **Body → form-data** (not raw JSON) since these routes accept file uploads alongside text fields. Do not manually set a Content-Type header — let axios/Postman generate the multipart boundary automatically.

---

## Frontend Routes (Implemented)

| Path                      | Access                    | Description                                                                                                                                                                                                                          |
| ------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/login`                  | Public                    | Login form                                                                                                                                                                                                                           |
| `/register`               | Public                    | Registration form (choose admin or vendor)                                                                                                                                                                                           |
| `/dashboard`              | Admin/Vendor              | Placeholder landing page                                                                                                                                                                                                             |
| `/tenders`                | Admin/Vendor              | Read-only table of tenders. Admins see all statuses; vendors see only `open` tenders                                                                                                                                                 |
| `/tenders/:id`            | Admin/Vendor              | Tender detail view with documents. Owning admin gets edit/delete/view-bids access. Vendor gets a Submit Bid action (hidden if already bid), or a "Your Bid" panel showing quoted price, status, and documents if they've already bid |
| `/tenders/:tenderId/bids` | Admin (tender owner only) | Review bids on one tender — shortlist, reject, or award each bid                                                                                                                                                                     |
| `/my-tenders`             | Admin only                | The logged-in admin's own tenders — create, edit, and delete, with file upload/removal                                                                                                                                               |
| `/my-bids`                | Vendor only               | The logged-in vendor's own bids — edit/withdraw while status is `submitted`                                                                                                                                                          |
| `/my-bids/:id/edit`       | Vendor only               | Edit an existing submitted bid                                                                                                                                                                                                       |
| `/unauthorized`           | —                         | Shown when a logged-in user hits a route their role can't access                                                                                                                                                                     |

---

## Error Handling

All controllers return a safe, generic message to the client (`{ message: "..." }`) while logging full error details server-side only. Common response codes:

| Status | Meaning                                                        |
| ------ | -------------------------------------------------------------- |
| 400    | Missing/invalid fields, invalid ID format, past deadline       |
| 401    | Missing or invalid JWT                                         |
| 403    | Authenticated but not authorized for this action               |
| 404    | Resource not found                                             |
| 409    | Duplicate value (e.g. email already registered, duplicate bid) |
| 500    | Unexpected server error                                        |

---

## Roadmap

- [x] Phase 0 — Foundation (server, MongoDB, auth APIs, auth middleware)
- [x] Phase 1 — Frontend skeleton (auth pages, protected routing, navbar)
- [x] Phase 2, Step 6 — Tender CRUD APIs (backend)
- [x] Phase 2, Step 7 — Admin dashboard (frontend) — built, styled, full manual test checklist passed
- [x] Phase 2, Step 8 — Vendor tender browsing (frontend) — code confirmed correct on review, in-browser click-through still pending
- [x] Phase 3, Step 9 — Bid CRUD + status APIs (backend) — fully built and Postman-tested (18/18 cases passed)
- [x] Phase 3, Steps 10–11 — Vendor bid dashboard + admin bid review (frontend) — built; bid creation and tender-ownership actions (View Bids/Edit/Delete) confirmed working in-browser; full vendor edit/withdraw and admin shortlist/reject/award click-through still pending
- [x] UI/CSS design system — unified spacing scale, hover/transition polish, and accessibility focus states applied across all pages
- [ ] Phase 4 — AI features (summarization, bid scoring, compliance checks)
- [ ] Phase 5 — Notifications, UI polish, testing
- [ ] Phase 6 — Deployment (Atlas + Render/Railway + Vercel)
