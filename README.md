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
│   │   ├── api/            axiosInstance.js, authApi.js
│   │   ├── context/        AuthContextObject.js, AuthContext.jsx, useAuth.js
│   │   ├── components/     Navbar.jsx, ProtectedRoute.jsx
│   │   ├── pages/          Login.jsx, Register.jsx, Dashboard.jsx, Unauthorized.jsx
│   │   ├── routes/         AppRoutes.jsx
│   │   ├── utils/          validationSchemas.js
│   │   ├── App.jsx, App.css, index.css, main.jsx
│   ├── .env / .env.example
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

**Tender** _(planned)_ — `title`, `description`, `department`, `category`, `budget`, `deadline`, `status (open|closed|awarded)`, `documents[]`, `aiSummary`, `createdBy → User`

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

### Testing in Postman

For protected routes (once implemented), set in the **Authorization** tab:

- Type: **Bearer Token**
- Token: paste JWT from login response
