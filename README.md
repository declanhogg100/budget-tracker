# BudgetTracker

A full‑stack budgeting app with a React/Vite frontend and Node/Express/Postgres backend. It supports JWT auth, CSV uploads for transactions, automatic categorization, budget tracking, and moving transactions between categories.

## Screenshots
![Dashboard view](./screenshots/budgetScreenShot1)
![Dashboard view](./screenshots/budgetScreenShot2)
## Prerequisites
- Node.js (LTS) and npm
- PostgreSQL running and accessible
- `.env` in `backend/` with:
  ```
  PGUSER=...
  PGPASSWORD=...
  PGDATABASE=...
  PGHOST=...
  PGPORT=...
  JWTSECRET=...
  ```
- Database tables: `users`, `categories`, `transactions` (includes `user_id` FKs). Defaults: `users.budget` integer default 0, `users.date` nullable.

## Install
```bash
# backend deps
cd backend
npm install

# frontend deps
cd ../frontend
npm install
```

## Run
- Backend: `cd backend && npm start` (starts Express on 5001)
- Frontend: `cd frontend && npm run dev` (Vite on 5173; adjust if port in use)

## Key features
- **Auth:** JWT-based signup/login (`/signup`, `/login`, `/verify`)
- **Budget:** Stored per user; fetched via `/totals`, updated via `/budget`
- **CSV upload:** `/upload` parses CSV, auto-categorizes, inserts transactions, updates category totals, tracks last upload date
- **Totals:** `/totals` returns categories and transactions for the logged-in user
- **Move transactions:** `/move` updates a transaction’s category and adjusts category totals
- **Clear data:** `/clear` wipes a user’s transactions/categories/date

## Frontend structure (React/Vite)
- `App.jsx` — top-level state: auth, categories, transactions, budget; passes to pages
- `BudgetTracker.jsx` — budget dashboard, chart, modals
- `Categories.jsx` — category list + transaction list for selected category
  - `CatList.jsx/CSS` — scrollable categories
  - `TransList.jsx/CSS` — transactions with Move action
  - `MovePicker.jsx/CSS` — modal to select a new category for a transaction
- `Directories.jsx/CSS` — navigation
- `csvModal.jsx`, `BudgetModal.jsx`, `DeleteModal.jsx` — modals for upload, budget set, clearing
- Styles: per-component CSS plus `index.css`, `App.css`

## Backend endpoints (Express)
- `POST /signup` — create user
- `POST /login` — issue JWT
- `GET /verify` — validate token
- `GET /totals` — categories (with id, total, color) and transactions
- `POST /budget` — set user budget
- `POST /upload` — CSV ingest; auto-categorize; updates totals and last upload date
- `GET /date` — last upload date
- `POST /clear` — delete user’s transactions/categories, reset date
- `POST /move` — move a transaction between categories and adjust totals

## Build
- Frontend: `npm run build` in `frontend/` (Vite)
- Backend: standard Node/Express; run with `npm start` or your process manager.
