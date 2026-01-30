from fastapi import APIRouter, HTTPException

from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, TokenOut

router = APIRouter(prefix="/auth", tags=["auth"])

DEMO_USERNAME = "demo"
DEMO_PASSWORD = "1234"


@router.post("/login", response_model=TokenOut)
def login(payload: LoginRequest):
    if payload.username != DEMO_USERNAME or payload.password != DEMO_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(payload.username)
    return TokenOut(access_token=token)
