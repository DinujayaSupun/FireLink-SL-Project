# FireLink-SL — Fire & Rescue Management System

A fire department management system built for the Colombo Municipal Council fire service.
Covers staff and shift management, training with QR attendance, inventory and vehicles,
supplier procurement, finance, mission records, and public fire-safety permit applications.

Stack: **MongoDB · Express · React · Node** (MERN).

## Project structure

```
FireLink-SL-Project/
├── backend/                  Express + Mongoose REST API (port 5000)
│   ├── config/
│   │   ├── config.env        Your local config — gitignored, create from config.sample.env
│   │   ├── config.sample.env Template
│   │   └── database.js
│   ├── controllers/
│   ├── middlewares/          auth, roles, error handling, validation
│   ├── models/
│   ├── routes/
│   ├── seeders/              Database seed + migration scripts
│   ├── services/
│   ├── validators/
│   ├── app.js                Express app + route mounting
│   └── server.js             Entry point
├── frontend/                 React 18 + Vite + Tailwind (port 5173)
│   ├── src/
│   │   ├── api/              Inventory API clients
│   │   ├── components/
│   │   ├── config/api.js     Backend URL — import from here, never hardcode a host
│   │   ├── context/          Auth context + the global axios token interceptor
│   │   ├── pages/
│   │   └── services/
│   ├── .env                  Your local config — gitignored
│   └── .env.example          Template
└── package.json              Runs both apps via concurrently
```

## Prerequisites

- Node.js 18+
- MongoDB 6+ running locally (or a connection string to one)

## Setup

**1. Install dependencies** — from the repo root:

```bash
npm install
npm run deps
```

> `npm run deps` passes `--legacy-peer-deps`. This is required: `react-qr-reader@3.0.0-beta-1`
> declares a peer range that predates React 18. A plain `npm install` will fail with ERESOLVE.

**2. Configure the backend.** Copy `backend/config/config.sample.env` to
`backend/config/config.env` and fill it in:

```env
NODE_ENV=development
PORT=5000
DB_URI=mongodb://localhost:27017/itp_database
JWT_SECRET=<a long random string>
JWT_REFRESH_SECRET=<a different long random string>
ACCESS_TOKEN_EXP=15m
REFRESH_TOKEN_EXP=7d
COOKIE_EXPIRE=7
FRONTEND_URL=http://localhost:5173
```

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Google OAuth (civilian sign-in) is optional — leave the placeholder values and that one
button stays inert; everything else works.

**3. Configure the frontend.** Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

**4. Seed the database:**

```bash
npm run seed
```

This creates one staff account per position plus sample suppliers, inventory, vehicles and
expenses. **Seeding users is required** — `POST /users` is restricted to an authenticated
chief officer, so the first one has to come from the seeder.

**5. Run it:**

```bash
npm run dev
```

Backend on http://localhost:5000, frontend on http://localhost:5173.

## Signing in

**Staff sign in with a generated Staff ID, not an email address.** `npm run seed:users`
prints the full table of IDs when it runs. They look like `INV53183` — the prefix comes from
the position, so it differs on every seed.

Default seeded password: `password123` (override with `SEED_PASSWORD`).

There are three separate login portals:

| Portal | Path | Credential |
|---|---|---|
| Fire staff | `/staff-login` | Staff ID + password |
| Civilians | `/civilian-login` | Email + password, or Google |
| Suppliers | `/supplier-login` | Email + password |

## Positions

`position` is the role field on a user. These exact strings are what route guards match, so
keep them in sync between `frontend/src/pages/UserManagement/AddUsers.jsx`, the
`ProtectedRoute` guards in `App.jsx`, and `authorizePositions(...)` on the backend:

| Position | Access |
|---|---|
| `chief officer` | Full access; the only role that can create staff or delete inventory |
| `1stclassofficer` | Operational management; can create staff |
| `finance_manager` | Budgets, expenses, employee payments |
| `supply_manager` | Suppliers, supply requests, procurement reports |
| `inventorymanager` | Inventory, vehicles, reorders |
| `recordmanager` | Mission records |
| `preventionmanager` | Fire prevention and certificates |
| `trainingsessionmanager` | Training sessions and attendance |
| `teamcaptain` | Team management |
| `fighter` | Basic access |

Comparison is normalised (lowercased, non-alphanumerics stripped), so `chief officer` and
`chiefofficer` match. It is **not** fuzzy — `supply_manager` and `suppliermanager` are
different roles as far as the guards are concerned.

## API

Mounted in `backend/app.js`:

| Prefix | Purpose |
|---|---|
| `/users` | Staff CRUD and `/users/stafflogin` |
| `/sessions`, `/attendance` | Training sessions and attendance |
| `/shift-schedules`, `/api/shifts`, `/api/shiftChange` | Shift scheduling |
| `/api/inventory` | Inventory items, dashboard stats, reports |
| `/api/inventory-vehicles`, `/api/inventory-reorders`, `/api/inventory-logs` | Inventory sub-resources |
| `/api/v1/supplier`, `/api/v1/supply-requests`, `/api/v1/supply-reports` | Procurement |
| `/api/v1/finance`, `/api/v1/salaries` | Finance |
| `/api/v1/missions` | Mission records |
| `/api/prevention/certificates`, `/api/prevention-officer` | Fire prevention |
| `/api/v1/civilian-auth` | Civilian login/registration |

Protected routes expect `Authorization: Bearer <token>`. On the frontend this is attached
automatically by the axios interceptor in `src/context/auth.jsx` — you do not need to set it
per request.

## Tests

```bash
npm run seed:all        # from backend/ — the suite signs in as the seeded accounts
npm run backend:dev     # in another terminal
npm run test:api        # from backend/
```

`backend/tests/api-smoke.js` drives the real API against the real database — integration
tests, not unit tests, and deliberately dependency-free so no test framework is imposed on
the project. It covers auth, staff CRUD and role enforcement, inventory (including the
quantity arithmetic), the QR attendance round trip, finance totals reconciled against the
database, and cross-identity token isolation. It cleans up everything it creates and exits
non-zero on failure.

Several checks exist specifically as regression guards for bugs that were live in this
codebase — the password hash leaking into login responses, phone numbers losing their leading
zero, forged QR tokens, and civilian tokens reaching staff endpoints. Please don't delete
them; each one has failed for real.

## Seeding

Run individually from `backend/` if you don't want the full set:

| Script | Seeds |
|---|---|
| `npm run seed:users` | One staff account per position (prints the Staff IDs) |
| `npm run seed:suppliers` | Suppliers |
| `npm run seed:inventory` | Inventory items |
| `npm run seed:inventory-vehicles` | Inventory vehicles |
| `npm run seed:vehicle-items` | Vehicle ↔ item assignments (needs the two above) |
| `npm run seed:reorders` | Reorder requests (needs inventory) |
| `npm run seed:vehicles` | Fleet vehicles |
| `npm run seed:exp` | Expenses |
| `npm run migrate:phone` | One-off: repairs phone numbers stored before `phone` became a String |

`npm run seed:all` runs them in dependency order.

## Conventions worth knowing

- **Never hardcode `http://localhost:5000`.** Import `API_BASE_URL` from `src/config/api.js`.
- **Filename casing matters.** `middlewares/roleMiddleware.js` and `models/SupplyRequest.js`
  are capitalised exactly as their imports expect. Windows and macOS won't notice a mismatch;
  Linux and Docker will fail to boot.
- **Phone numbers are Strings**, not Numbers — a Number silently eats the leading zero from
  Sri Lankan numbers (`0771234567`).
- **Passwords must be 8+ characters.** Enforced in `UserController` and mirrored in the
  Add Staff form; change both together.

## Troubleshooting

**`npm install` fails with ERESOLVE** — use `npm run deps`, or add `--legacy-peer-deps`.

**`MODULE_NOT_FOUND` on Linux/Docker but fine on Windows** — an import's casing doesn't match
the real filename. Windows is case-insensitive and hides it.

**MongoDB connection error** — check `DB_URI` in `backend/config/config.env` and that MongoDB
is actually running. `PORT` and `DB_URI` are both required; the server exits without them.

**Port already in use** — change `PORT` in `config.env` (backend) or `server.port` in
`vite.config.js` (frontend). Update `FRONTEND_URL` to match, or CORS will reject the browser.

**401 on every API call** — you're not sending a token. Sign in at `/staff-login`; the
interceptor handles the rest.

**403 "Access denied for position: X"** — that position isn't in the route's allowed list.
Check the `authorizePositions(...)` call on the route against the Positions table above.

## License

MIT
