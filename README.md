# TenderVault

A full-stack **Tender Management System** built with the MERN stack. Organizations post tenders, vendors submit bids, and admins review and award contracts. AI features assist with summarization, bid scoring, and compliance checking.

---

## Tech Stack

| Layer       | Technology                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend    | React (Vite) + Vanilla CSS, React Router, Axios, React Hook Form + Zod                                                                |
| Backend     | Node.js + Express 5 (ESM / `"type": "module"`)                                                                                        |
| Database    | MongoDB + Mongoose 9                                                                                                                  |
| Auth        | JWT + bcryptjs                                                                                                                        |
| File Upload | Multer (local dev, per-entity subfolders) → Cloudinary/S3 (production) — planned                                                      |
| AI          | Google Gemini API via `@google/genai` — tender summarization and price-competitive bid scoring implemented; compliance checks planned |

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
│   │   │                 MyBids.jsx, BidFormPage.jsx, TenderBids.jsx, TenderBids.css
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
    │   └── Bid.js                 (aiFlags is now a structured {severity, message} array)
    ├── routes/
    │   ├── authRoutes.js
    │   ├── tenderRoutes.js
    │   └── bidRoutes.js           (includes PUT /tender/:tenderId/score)
    ├── controllers/
    │   ├── authController.js
    │   ├── tenderController.js
    │   └── bidController.js       (includes scoreBidsForTender)
    ├── middleware/
    │   ├── authMiddleware.js      (protect, authorizeRoles)
    │   └── uploadMiddleware.js    (createUploader factory — per-subfolder multer instances)
    ├── services/
    │   └── geminiService.js       (Gemini AI — tender summarization + bid scoring)
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
GEMINI_API_KEY=your_gemini_api_key_here
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com) — no credit card required. Use a personal Google account; institutional/Workspace accounts sometimes lack permission to create a Cloud project and key.

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

| Method | Endpoint                     | Access               | Description                                                                                   |
| ------ | ---------------------------- | -------------------- | --------------------------------------------------------------------------------------------- |
| POST   | `/api/tenders`               | Admin only           | Create a tender (multipart/form-data, up to 5 documents)                                      |
| GET    | `/api/tenders`               | Any logged-in user   | List tenders — supports `?status=`, `?category=`, and `?createdBy=` filters                   |
| GET    | `/api/tenders/:id`           | Any logged-in user   | Get a single tender by ID                                                                     |
| PUT    | `/api/tenders/:id`           | Admin (creator only) | Update a tender; supports adding new files and removing existing ones via `documentsToDelete` |
| PUT    | `/api/tenders/:id/summarize` | Admin (creator only) | Regenerate the tender's `aiSummary` using Gemini                                              |
| DELETE | `/api/tenders/:id`           | Admin (creator only) | Delete a tender and its associated files                                                      |

**Notes:**

- Only the admin who created a tender can update, delete, view bids on, or regenerate the AI summary of it — other admins are blocked.
- `?createdBy=<userId>` filters tenders by the creating admin — used by the admin's "My Tenders" view.
- `documentsToDelete` (on PUT) accepts a JSON-stringified array of document `_id`s to remove.
- Deleting a tender, or removing individual documents on update, also deletes the corresponding files from disk.
- Uploaded files are validated for type (`pdf`, `doc`, `docx`, `jpeg`, `png`) and size (10MB limit per file).
- `aiSummary` is auto-generated by Gemini on tender creation, and can be regenerated on demand via `PUT /api/tenders/:id/summarize`. Only PDF and image (jpeg/png) attachments are read by the AI — DOC/DOCX files are not natively supported by Gemini and are skipped for summarization purposes (they're still stored and attached normally). If Gemini fails or the key is missing, `aiSummary` falls back to an empty string rather than blocking tender creation.

### Bids

| Method | Endpoint                           | Access                        | Description                                                                                                                    |
| ------ | ---------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/api/bids`                        | Vendor only                   | Submit a bid on an open tender (multipart/form-data, up to 5 documents). One bid per tender per vendor.                        |
| GET    | `/api/bids`                        | Any logged-in user            | Vendors: always returns only their own bids. Admins: requires `?tender=<id>`, returns bids only if the admin owns that tender. |
| GET    | `/api/bids/:id`                    | Owning vendor or owning admin | Get a single bid by ID                                                                                                         |
| PUT    | `/api/bids/:id`                    | Owning vendor only            | Edit `quotedPrice`, add/remove documents — only while `status === "submitted"` and before the tender's deadline                |
| DELETE | `/api/bids/:id`                    | Owning vendor only            | Withdraw a bid — only while `status === "submitted"` and before the tender's deadline                                          |
| PUT    | `/api/bids/:id/status`             | Admin (tender owner only)     | Change bid status to `shortlisted`, `rejected`, or `awarded`                                                                   |
| PUT    | `/api/bids/tender/:tenderId/score` | Admin (tender owner only)     | Score every bid on this tender for price competitiveness using Gemini AI (see AI Features below)                               |

**Notes:**

- A vendor cannot submit more than one bid on the same tender (enforced via a unique compound index in the schema, not just app logic).
- Bids can only be created against tenders with `status: "open"` and a future deadline.
- The `tender` ID is sent inside the FormData body on `POST /api/bids` (not as a query param).
- Once an admin changes a bid's status away from `submitted`, the vendor can no longer edit or withdraw it.
- Bid status can only move to `shortlisted`, `rejected`, or `awarded` — it can never be reverted back to `submitted` via this endpoint.
- `documentsToDelete` on `PUT /api/bids/:id` follows the same convention as Tenders — a JSON-stringified array of document `_id`s.
- Bid documents are stored in `server/uploads/bids/`, separate from tender documents in `server/uploads/tenders/`, both served via the same `/uploads` static mount.
- `PUT /api/bids/tender/:tenderId/score` re-scores **all** bids on the tender in one call (not a single bid) since scoring is relative — every call recalculates the full set, so older bids' scores update too when new bids arrive. Returns `400` if the tender has no bids yet, and `502` (with no database writes) if the AI call fails for any reason.

### Testing in Postman

For protected routes, set in the **Authorization** tab:

- Type: **Bearer Token**
- Token: paste JWT from the login response

For tender/bid create/update requests, use **Body → form-data** (not raw JSON) since these routes accept file uploads alongside text fields. Do not manually set a Content-Type header — let axios/Postman generate the multipart boundary automatically.

---

## AI Features

### Tender Summarization (Implemented)

Uses **Google Gemini** (`@google/genai` — the current SDK; `@google/generative-ai` is deprecated and must not be used) via `server/services/geminiService.js`.

- Model: `gemini-flash-latest` — an alias that tracks Google's current flash-tier model, used deliberately instead of a hardcoded version string so the app doesn't break when Google deprecates a specific model (this has already happened once during development).
- Triggered automatically on `POST /api/tenders`, and can be regenerated on demand via `PUT /api/tenders/:id/summarize`.
- Reads the tender's **PDF and image** attachments directly (sent as inline base64 file data) so the summary reflects actual document content, not just the short `description` field. DOC/DOCX attachments are not read by the AI (Gemini has no native support for them) but are still uploaded and stored normally.
- Fails gracefully: if the Gemini API key is missing, quota is exceeded, or the request fails for any reason, `aiSummary` is simply left as an empty string — it never blocks tender creation.

**Implementation note for future maintainers:** the Gemini client in `geminiService.js` is intentionally lazy-initialized inside a `getClient()` function rather than constructed at module load time. Constructing it at the top of the file causes it to read `process.env.GEMINI_API_KEY` before `dotenv` has loaded `.env` (an ES-module import-hoisting issue), producing a confusing "could not load default credentials" error instead of an obvious missing-API-key error.

### Bid Scoring (Implemented)

Also powered by Gemini, via the same `geminiService.js` (`generateBidScores`) and a new admin-only endpoint (`scoreBidsForTender` in `bidController.js`).

- **What it measures:** `aiScore` (0–100) reflects **price competitiveness only** — it does not consider delivery time, vendor reputation, or document compliance. A score is always **relative to the other bids on the same tender**, not an absolute measure.
- **Per-item awareness:** rather than comparing only the top-line `quotedPrice`, the AI reads each vendor's uploaded quotation document(s) (PDF/image, same file-reading approach as tender summarization) and compares vendors **per line item** where items reasonably match, since a single total price can hide bloated or underpriced individual items.
- **Trigger:** on-demand only, via `PUT /api/bids/tender/:tenderId/score` (admin, tender owner only) — deliberately not automatic on bid submission, since a relative score can only be computed against the full current set of bids. Every call re-scores **all** bids on that tender, so older bids' scores stay accurate as new bids come in.
- **`aiFlags`:** an array of `{ severity: "info" | "warning", message: string }` objects, generated as a byproduct of the same price comparison — e.g. a specific line item priced notably above other vendors, an unusually low total (possible unrealistic bid), or a tie. Scoped strictly to price-related observations; document-completeness/compliance flagging is intentionally out of scope here and reserved for the planned compliance-checking feature.
- **Fails gracefully:** if Gemini fails for any reason, no bids are modified and the endpoint returns `502` — same "never partially write" guarantee as the rest of the app's AI integration.
- **Frontend:** a "Score Bids (AI)" button on the admin's bid-review page (`/tenders/:tenderId/bids`) triggers scoring for that tender; results (score + flags) render inline in a new table column.

### Compliance Checking (Planned)

Not yet implemented — see Roadmap.

---

## Frontend Routes (Implemented)

| Path                      | Access                    | Description                                                                                                                                                                                                                          |
| ------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/login`                  | Public                    | Login form                                                                                                                                                                                                                           |
| `/register`               | Public                    | Registration form (choose admin or vendor)                                                                                                                                                                                           |
| `/dashboard`              | Admin/Vendor              | Placeholder landing page                                                                                                                                                                                                             |
| `/tenders`                | Admin/Vendor              | Read-only table of tenders. Admins see all statuses; vendors see only `open` tenders                                                                                                                                                 |
| `/tenders/:id`            | Admin/Vendor              | Tender detail view with documents. Owning admin gets edit/delete/view-bids access. Vendor gets a Submit Bid action (hidden if already bid), or a "Your Bid" panel showing quoted price, status, and documents if they've already bid |
| `/tenders/:tenderId/bids` | Admin (tender owner only) | Review bids on one tender — shortlist, reject, or award each bid; also includes a "Score Bids (AI)" button and an AI Score column showing price-competitiveness scores and flags                                                     |
| `/my-tenders`             | Admin only                | The logged-in admin's own tenders — create, edit, and delete, with file upload/removal                                                                                                                                               |
| `/my-bids`                | Vendor only               | The logged-in vendor's own bids — edit/withdraw while status is `submitted`                                                                                                                                                          |
| `/my-bids/:id/edit`       | Vendor only               | Edit an existing submitted bid                                                                                                                                                                                                       |
| `/unauthorized`           | —                         | Shown when a logged-in user hits a route their role can't access                                                                                                                                                                     |

---

## Error Handling

All controllers return a safe, generic message to the client (`{ message: "..." }`) while logging full error details server-side only. Common response codes:

| Status | Meaning                                                                    |
| ------ | -------------------------------------------------------------------------- |
| 400    | Missing/invalid fields, invalid ID format, past deadline, no bids to score |
| 401    | Missing or invalid JWT                                                     |
| 403    | Authenticated but not authorized for this action                           |
| 404    | Resource not found                                                         |
| 409    | Duplicate value (e.g. email already registered, duplicate bid)             |
| 502    | AI (Gemini) call failed — used for bid scoring only                        |
| 500    | Unexpected server error                                                    |

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
- [x] Phase 4, Step 1 — Tender AI summarization (Google Gemini API via `@google/genai`) — auto-generates on tender creation, regenerable on demand, reads PDF/image attachments natively; backend complete, frontend UI not yet built
- [x] Phase 4, Step 2 — Bid scoring (`aiScore` / `aiFlags`) — price-competitiveness scoring relative to other bids on the same tender, reads per-item quotation breakdowns, on-demand admin trigger, backend and frontend ("Score Bids" button + AI Score column) both complete; full multi-vendor/failure-path Postman test matrix written but not fully executed yet
- [ ] Phase 4, Step 3 — Compliance checking
- [ ] Phase 5 — Notifications, UI polish, testing
- [ ] Phase 6 — Deployment (Atlas + Render/Railway + Vercel)
