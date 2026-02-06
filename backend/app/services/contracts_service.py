from datetime import date

from fastapi import HTTPException
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.models.contract import Contract, ContractStatus, EnergyType
from app.schemas.contract import (
    ContractCreate,
    ContractListOut,
    ContractPriceBoundsOut,
    ContractUpdate,
)


def get_price_bounds(
    db: Session,
    energy_type: list[EnergyType] | None,
    location: list[str] | None,
    status: ContractStatus | None,
    qty_min: int | None,
    qty_max: int | None,
    start_from: date | None,
    end_to: date | None,
) -> ContractPriceBoundsOut:
    if qty_min is not None and qty_max is not None and qty_min > qty_max:
        raise HTTPException(status_code=400, detail="qty_min cannot be greater than qty_max")
    if start_from is not None and end_to is not None and start_from > end_to:
        raise HTTPException(status_code=400, detail="start_from cannot be after end_to")

    filters = _build_filters(
        energy_type=energy_type,
        location=location,
        status=status,
        price_min=None,
        price_max=None,
        qty_min=qty_min,
        qty_max=qty_max,
        start_from=start_from,
        end_to=end_to,
    )

    stmt = (
        select(func.min(Contract.price_per_mwh), func.max(Contract.price_per_mwh)).where(
            and_(*filters)
        )
        if filters
        else select(func.min(Contract.price_per_mwh), func.max(Contract.price_per_mwh))
    )
    min_price, max_price = db.execute(stmt).one()
    return ContractPriceBoundsOut(
        min_price=float(min_price) if min_price is not None else None,
        max_price=float(max_price) if max_price is not None else None,
    )


def list_locations(db: Session) -> list[str]:
    stmt = select(Contract.location).distinct().order_by(Contract.location.asc())
    return db.scalars(stmt).all()


def create_contract(db: Session, payload: ContractCreate) -> Contract:
    c = Contract(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


def list_contracts(
    db: Session,
    energy_type: list[EnergyType] | None,
    location: list[str] | None,
    status: ContractStatus | None,
    sort_by: str | None,
    sort_dir: str,
    page: int,
    page_size: int,
    price_min: float | None,
    price_max: float | None,
    qty_min: int | None,
    qty_max: int | None,
    start_from: date | None,
    end_to: date | None,
) -> ContractListOut:
    if price_min is not None and price_max is not None and price_min > price_max:
        raise HTTPException(status_code=400, detail="price_min cannot be greater than price_max")
    if qty_min is not None and qty_max is not None and qty_min > qty_max:
        raise HTTPException(status_code=400, detail="qty_min cannot be greater than qty_max")
    if start_from is not None and end_to is not None and start_from > end_to:
        raise HTTPException(status_code=400, detail="start_from cannot be after end_to")
    if sort_dir not in ("asc", "desc"):
        raise HTTPException(status_code=400, detail="sort_dir must be asc or desc")
    if page < 1:
        raise HTTPException(status_code=400, detail="page must be >= 1")
    if page_size < 1 or page_size > 100:
        raise HTTPException(status_code=400, detail="page_size must be 1..100")

    filters = _build_filters(
        energy_type=energy_type,
        location=location,
        status=status,
        price_min=price_min,
        price_max=price_max,
        qty_min=qty_min,
        qty_max=qty_max,
        start_from=start_from,
        end_to=end_to,
    )

    stmt = select(Contract).where(and_(*filters)) if filters else select(Contract)

    count_stmt = (
        select(func.count()).select_from(Contract).where(and_(*filters))
        if filters
        else select(func.count()).select_from(Contract)
    )
    total = db.scalar(count_stmt) or 0

    sort_map = {
        "price": Contract.price_per_mwh,
        "quantity": Contract.quantity_mwh,
        "date": Contract.delivery_start,
    }
    if sort_by:
        if sort_by not in sort_map:
            raise HTTPException(
                status_code=400,
                detail="sort_by must be one of: price, quantity, date",
            )
        sort_col = sort_map[sort_by]
        order = sort_col.asc() if sort_dir == "asc" else sort_col.desc()
        stmt = stmt.order_by(order)
    else:
        stmt = stmt.order_by(Contract.id.desc())

    offset = (page - 1) * page_size
    items = db.scalars(stmt.offset(offset).limit(page_size)).all()
    return ContractListOut(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
    )


def get_contract(db: Session, contract_id: int) -> Contract:
    c = db.get(Contract, contract_id)
    if not c:
        raise HTTPException(status_code=404, detail="Contract not found")
    return c


def update_contract(db: Session, contract_id: int, payload: ContractUpdate) -> Contract:
    c = db.get(Contract, contract_id)
    if not c:
        raise HTTPException(status_code=404, detail="Contract not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(c, k, v)

    db.commit()
    db.refresh(c)
    return c


def delete_contract(db: Session, contract_id: int) -> None:
    c = db.get(Contract, contract_id)
    if not c:
        return
    db.delete(c)
    db.commit()


def _build_filters(
    *,
    energy_type: list[EnergyType] | None,
    location: list[str] | None,
    status: ContractStatus | None,
    price_min: float | None,
    price_max: float | None,
    qty_min: int | None,
    qty_max: int | None,
    start_from: date | None,
    end_to: date | None,
) -> list:
    filters: list = []
    if status is not None:
        filters.append(Contract.status == status)
    if energy_type:
        filters.append(Contract.energy_type.in_(energy_type))
    if location:
        filters.append(Contract.location.in_(location))
    if price_min is not None:
        filters.append(Contract.price_per_mwh >= price_min)
    if price_max is not None:
        filters.append(Contract.price_per_mwh <= price_max)
    if qty_min is not None:
        filters.append(Contract.quantity_mwh >= qty_min)
    if qty_max is not None:
        filters.append(Contract.quantity_mwh <= qty_max)
    if start_from is not None:
        filters.append(Contract.delivery_start >= start_from)
    if end_to is not None:
        filters.append(Contract.delivery_end <= end_to)
    return filters
