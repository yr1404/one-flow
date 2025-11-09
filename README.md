# OneFlow – Plan to Bill

A modern, full‑stack project management and operations app. It helps teams manage projects, tasks, time, products and financial documents (Sales Orders, Purchase Orders, Customer Invoices, Vendor Bills, Expenses) from planning to billing. The frontend is a polished React app; the backend is a Node.js/Express API with PostgreSQL using Sequelize ORM.

## Key features
- Modern UI/UX with glass/gradient styling and responsive layout (mobile hamburger sidebar)
- Projects with status, priority, tags, progress and budget metrics
- Kanban tasks with multi‑assignees and timesheets
- Products and inventory; stock decrement on Sales Order confirmation
- Financial entities (SO/PO/Invoice/Bill/Expense) with printable PDFs
- Role‑based access (Admin, Project Manager, Team Member, Sales/Finance)
- Backend API (auth, projects, tasks) with JWT auth and Sequelize models

## Monorepo layout
- Frontend (Vite + React): root folder
- Backend (Express + Postgres): `backend/`

## Prerequisites
- Node.js 18+
- PostgreSQL 13+

## Quick start (frontend only)
1. Install deps
   
   npm install
2. Start dev server
   
   npm run dev

## Full stack setup
1. Backend env
   Create `backend/.env` with:
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=oneflow
   DB_USER=postgres
   DB_PASS=postgres
   JWT_SECRET=change_this_secret
   FRONTEND_ORIGIN=http://localhost:5173

2. Create database (example)
   
   createdb oneflow
   # Or via psql: CREATE DATABASE oneflow;

3. Install backend deps
   
   cd backend
   npm install

4. Initialize DB schema (Sequelize sync)
   In dev this project syncs models at runtime (no migrations provided). On first run, tables will be created automatically by Sequelize when models are used. You can also add migrations later.

5. Run backend API
   
   npm start
   # API runs on http://localhost:3000

6. Frontend env
   In project root, create `.env.local` (or `.env`) with:
   
   VITE_API_URL=http://localhost:3000/api

7. Install and run frontend
   
   cd ..   # back to project root if needed
   npm install
   npm run dev
   # App runs on http://localhost:5173

## Docker: PostgreSQL quick setup (Linux bash)
If you prefer not to install PostgreSQL locally, run it with Docker.

Run Postgres 15 (with healthcheck and persistent volume):

```
docker run --name oneflow-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=oneflow \
  -e TZ=UTC \
  -p 5432:5432 \
  -v oneflow_pgdata:/var/lib/postgresql/data \
  --health-cmd="pg_isready -U postgres" --health-interval=10s --health-timeout=5s --health-retries=5 \
  -d postgres:15-alpine
```

Match backend `backend/.env`:

```
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=oneflow
DB_USER=postgres
DB_PASS=postgres
JWT_SECRET=change_this_secret
FRONTEND_ORIGIN=http://localhost:5173
```

Verify container:

```
docker ps
# Logs
docker logs -f oneflow-postgres
# psql from host (requires psql client)
psql -h 127.0.0.1 -U postgres -d oneflow -c "SELECT 1;"
```

Common operations:

```
# Stop / start / restart
docker stop oneflow-postgres
docker start oneflow-postgres
docker restart oneflow-postgres

# Open a psql shell inside the container
docker exec -it oneflow-postgres psql -U postgres -d oneflow
```

Notes:
- If port 5432 is in use, change `-p 5432:5432` to another host port (e.g., `-p 5433:5432`) and update `DB_PORT` accordingly.
- Use `DB_HOST=127.0.0.1` (not `localhost`) on some Linux setups to avoid socket issues.

## Cleanup / uninstall Docker resources (free disk space)
Warning: removing volumes deletes your database files. Backup if needed before removing.

Backup (optional):
```
docker exec -t oneflow-postgres pg_dumpall -U postgres > oneflow-backup.sql
```

Remove container:
```
docker stop oneflow-postgres
docker rm oneflow-postgres
```

Remove data volume (permanent data deletion):
```
docker volume rm oneflow_pgdata
```

Remove the Postgres image (optional):
```
docker image rm postgres:15-alpine
```

Aggressive cleanup (prune stopped containers, unused images, networks, and volumes):
```
# Review what will be removed first
docker system df
# Then prune (this can remove a lot; read prompts carefully)
docker system prune -a --volumes
```

## Default flows (after wiring auth)
- Sign Up/Login: JWT stored in localStorage; role selected on signup
- Projects/Tasks: fetched from API when logged in
- Role gates (examples):
  - Project Manager/Admin can create projects and tasks
  - Team Member updates own tasks and logs time
  - Sales/Finance manages financial docs

## Scripts
Frontend (root)
- `npm run dev` – Vite dev server
- `npm run build` – Production build

Backend (`backend/`)
- `npm start` – Start Express API
- `npm test` – Run backend tests (if any)

