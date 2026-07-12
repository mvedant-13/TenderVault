# TenderVault

A full-stack **Tender Management System** built with the MERN stack. Organizations post tenders, vendors submit bids, and admins review and award contracts. AI features assist with summarization, bid scoring, and compliance checking.
---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Vanilla CSS, React Router, Axios, React Hook Form + Zod |
| Backend | Node.js + Express (ESM / `"type": "module"`) |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| File Upload | Multer (local dev) → Cloudinary/S3 (production) |
| AI | OpenAI / Anthropic API (planned) |

---

## Current Progress

### ✅ Phase 0 — Foundation (Complete)

#### 1. Server Setup + MongoDB Connection
- Express server with ESM modules
- MongoDB connected via Mongoose
- Environment variables via dotenv
- Morgan request logging (`dev` mode)

#### 2. Auth APIs
- `POST /api/auth/register` — register with name, email, password, role, companyName, gstNumber
- `POST /api/auth/login` — returns JWT (Bearer token)
- Password hashed with bcryptjs (pre-save hook on User model)
- JWT signed with userId + role, 7-day expiry

#### 3. Auth Middleware
- `protect` — verifies JWT from `Authorization: Bearer` header, attaches `req.user` (password excluded)
- `authorizeRoles(...roles)` — role-based access control, e.g. `authorizeRoles("admin")`
- Errors logged server-side only via `console.error()`, never exposed to client

---

## Project Structure

```
TenderVault/
├── client/                   # React + Vite frontend (not yet scaffolded)
│
└── server/
    ├── config/
    │   └── db.js
    ├── models/
    │   └── User.js
    ├── routes/
    │   └── authRoutes.js
    ├── controllers/
    │   └── authController.js
    ├── middleware/
    │   └── authMiddleware.js
    ├── utils/
    │   └── generateToken.js
    ├── uploads/
    ├── .env
    ├── .env.example
    └── server.js
```

---

## Data Models

**User** — `name`, `email`, `password (hashed)`, `role (admin|vendor)`, `companyName`, `gstNumber`

**Tender** *(planned)* — `title`, `description`, `department`, `category`, `budget`, `deadline`, `status (open|closed|awarded)`, `documents[]`, `aiSummary`, `createdBy → User`

**Bid** *(planned)* — `tender → Tender`, `vendor → User`, `quotedPrice`, `deliveryTime`, `documents[]`, `aiScore`, `aiFlags[]`, `status (submitted|shortlisted|rejected|awarded)`

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
cd TenderVault/server
npm install
```

### Environment Variables

Copy `.env.example` to `.env` inside `/server` and fill in values:

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

### Run Server

```bash
cd server
npm run dev
```

Backend runs on `http://localhost:5000`.

---

## API Reference (Implemented)

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register (admin or vendor) |
| POST | `/api/auth/login` | Public | Login, returns JWT |

### Testing in Postman

For protected routes (once implemented), set in the **Authorization** tab:
- Type: **Bearer Token**
- Token: paste JWT from login response

---

## Roadmap

### Phase 0 — Foundation ✅
- [x] Server setup + MongoDB connection
- [x] Auth APIs — register/login (JWT)
- [x] Auth middleware — protect + role-based routes

### Phase 1 — Frontend Skeleton
- [ ] Frontend scaffolding — Vite + React + Vanilla CSS
- [ ] Auth UI — login/signup, AuthContext, protected routes

### Phase 2 — Tender Slice
- [ ] Tender CRUD APIs
- [ ] Admin dashboard — create/manage tenders
- [ ] Vendor view — browse open tenders

### Phase 3 — Bid Slice
- [ ] Bid APIs
- [ ] Vendor dashboard — submit bids, track status
- [ ] Admin — view/manage bids per tender

### Phase 4 — AI Features
- [ ] AI #1 — tender summarization
- [ ] AI #2 — bid scoring/ranking
- [ ] AI #3 — document compliance check *(optional)*

### Phase 5 — Polish
- [ ] Notifications
- [ ] UI polish + responsive design
- [ ] Testing

### Phase 6 — Ship
- [ ] Deployment — Atlas + Render/Railway + Vercel
- [ ] Documentation — demo video, resume bullets

---