FROM python:3.11-slim

WORKDIR /app
COPY pyproject.toml /app/
COPY app /app/app
RUN pip install --no-cache-dir -e .

RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*

COPY alembic.ini /app/
COPY alembic /app/alembic

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
