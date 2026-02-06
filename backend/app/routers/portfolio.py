import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.db.session import get_db
from app.models.portfolio import PortfolioItem
from app.models.contract import Contract
from app.schemas.portfolio import PortfolioItemOut, PortfolioMetrics
from app.core.security import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

DEFAULT_USER_ID = 1

@router.post("/items/{contract_id}", status_code=201)
def add_to_portfolio(
    contract_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    logger.info("portfolio.add: user_id=%s contract_id=%s", DEFAULT_USER_ID, contract_id)
    # upsert-ish
    existing = db.scalar(select(PortfolioItem).where(
        PortfolioItem.user_id == DEFAULT_USER_ID,
        PortfolioItem.contract_id == contract_id
    ))
    if existing:
        logger.info("portfolio.add: already exists user_id=%s contract_id=%s", DEFAULT_USER_ID, contract_id)
        return {"ok": True, "already": True}

    item = PortfolioItem(user_id=DEFAULT_USER_ID, contract_id=contract_id)
    db.add(item)
    db.commit()
    logger.info("portfolio.add: created user_id=%s contract_id=%s", DEFAULT_USER_ID, contract_id)
    return {"ok": True}

@router.delete("/items/{contract_id}", status_code=204)
def remove_from_portfolio(
    contract_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    logger.info("portfolio.remove: user_id=%s contract_id=%s", DEFAULT_USER_ID, contract_id)
    item = db.scalar(select(PortfolioItem).where(
        PortfolioItem.user_id == DEFAULT_USER_ID,
        PortfolioItem.contract_id == contract_id
    ))
    if not item:
        logger.warning("portfolio.remove: not found user_id=%s contract_id=%s", DEFAULT_USER_ID, contract_id)
        return
    db.delete(item)
    db.commit()
    logger.info("portfolio.remove: deleted user_id=%s contract_id=%s", DEFAULT_USER_ID, contract_id)

@router.get("/items", response_model=list[PortfolioItemOut])
def list_items(
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    items = db.scalars(
        select(PortfolioItem).where(PortfolioItem.user_id == DEFAULT_USER_ID)
        .order_by(PortfolioItem.id.desc())
    ).all()
    if not items:
        logger.info("portfolio.list: empty user_id=%s", DEFAULT_USER_ID)
    else:
        logger.info("portfolio.list: count=%s user_id=%s", len(items), DEFAULT_USER_ID)
    return items

@router.get("/metrics", response_model=PortfolioMetrics)
def metrics(
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    rows = db.execute(
        select(Contract.energy_type, Contract.quantity_mwh, Contract.price_per_mwh)
        .join(PortfolioItem, PortfolioItem.contract_id == Contract.id)
        .where(PortfolioItem.user_id == DEFAULT_USER_ID)
    ).all()
    if not rows:
        logger.info("portfolio.metrics: empty user_id=%s", DEFAULT_USER_ID)

    total_contracts = len(rows)
    total_capacity = sum(int(q) for _, q, _ in rows)
    total_cost = sum(float(q) * float(p) for _, q, p in rows)
    weighted_avg = (total_cost / total_capacity) if total_capacity else 0.0

    by_type: dict[str, dict[str, float]] = {}
    for et, q, p in rows:
        k = str(et.value)
        by_type.setdefault(k, {"capacity_mwh": 0.0, "cost": 0.0})
        by_type[k]["capacity_mwh"] += float(q)
        by_type[k]["cost"] += float(q) * float(p)

    return PortfolioMetrics(
        total_contracts=total_contracts,
        total_capacity_mwh=total_capacity,
        total_cost=round(total_cost, 2),
        weighted_avg_price_per_mwh=round(weighted_avg, 2),
        by_energy_type=by_type,
    )
