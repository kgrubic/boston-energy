# Boston Energy - Energy Contract Marketplace

Full-stack demo marketplace for browsing energy contracts, filtering results, building a portfolio, and comparing contracts.

## Live

- App: https://kgrubic.github.io/boston-energy/
- API docs: https://boston-energy-backend.onrender.com/docs#/

## Tech

- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Frontend: React + MUI + React Query
- Docker Compose for local dev

## Features

- Contract browsing with filters (energy type, location, quantity, price range, delivery dates)
- Sorting (price, quantity, date)
- Pagination
- Contract details page
- Contract comparison (select 2-3 items)
- Portfolio with metrics and energy-type breakdown
- Simple demo auth (JWT)
- Mark contract as sold

## Routes

- `/` Home
- `/contracts` Contracts list
- `/contracts/:id` Contract details
- `/portfolio` Portfolio
- `/login` Login

Note: `/contracs` redirects to `/contracts`.

## Auth

Demo credentials:

- Username: `demo`
- Password: `1234`

Contracts and portfolio pages require login. When logged out, you will see a "Not authorized" message.

## Backend Setup (Docker)

1. Clone the repo

```bash
git clone git@github.com:kgrubic/boston-energy.git
cd boston-energy
```

2. Create environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Build + start containers

```bash
docker compose up --build -d
```

4. Wait for Postgres to be ready (run until it says "accepting connections")

```bash
docker compose exec db pg_isready -U postgres -d energy
```

5. Run migrations and seed data

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python seed.py
```

6. Open the app

```text
http://localhost:5173/boston-energy/
```

Backend (local):

```text
http://localhost:8000
http://localhost:8000/docs
```

Hot reload (Docker):

- Frontend is volume-mounted and uses Vite dev server
- Backend runs `uvicorn --reload`

## Environment Variables

Backend (`backend/.env`):

- `DATABASE_URL` (required)
- `JWT_SECRET` (optional; default is `dev-secret-change-me`)
- `JWT_EXPIRES_MINUTES` (optional; default is `60`)

Frontend (`frontend/.env`):

- Uses Vite defaults; no required variables for local dev

## API Notes

Key endpoints:

- `POST /api/auth/login` (demo auth)
- `GET /api/contracts` (filters, sorting, pagination)
- `GET /api/contracts/price-bounds` (min/max price for slider)
- `PATCH /api/contracts/{id}` (update status, mark sold)
- `GET /api/portfolio/items`
- `GET /api/portfolio/metrics`

## Seed Data

Seed script: `backend/seed.py` (includes 10+ sample contracts).

## Tests (Backend)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"
pytest
```
