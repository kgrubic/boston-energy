## Setup (Docker)

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
