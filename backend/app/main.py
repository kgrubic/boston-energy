from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from app.core.config import settings
from app.core.cors import setup_cors
from app.routers.health import router as health_router
from app.routers.contracts import router as contracts_router
from app.routers.portfolio import router as portfolio_router

app = FastAPI(title="Energy Contract Marketplace API")

setup_cors(app)

app.include_router(contracts_router, prefix="/api")
app.include_router(portfolio_router, prefix="/api")
app.include_router(health_router, prefix="/api")



dist_dir = Path(__file__).resolve().parent.parent / "static"

if dist_dir.exists():
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")
