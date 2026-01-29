from datetime import date
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, and_

from app.db.session import get_db
from app.models.contract import Contract, EnergyType, ContractStatus
from app.schemas.contract import ContractCreate, ContractOut, ContractUpdate

router = APIRouter(prefix="/contracts", tags=["contracts"])

@router.get("/locations", response_model=list[str])
def list_locations(db: Session = Depends(get_db)):
    stmt = select(Contract.location).distinct().order_by(Contract.location.asc())
    return db.scalars(stmt).all()

@router.post("", response_model=ContractOut, status_code=201)
def create_contract(payload: ContractCreate, db: Session = Depends(get_db)):
    c = Contract(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

@router.get("", response_model=list[ContractOut])
def list_contracts(
    db: Session = Depends(get_db),
    energy_type: list[EnergyType] | None = Query(default=None),
    location: list[str] | None = Query(default=None),
    status: ContractStatus | None = ContractStatus.Available,
    sort_by: str | None = None,
    sort_dir: str = "desc",
    price_min: float | None = None,
    price_max: float | None = None,
    qty_min: int | None = None,
    qty_max: int | None = None,
    start_from: date | None = None,
    end_to: date | None = None,
):
    if price_min is not None and price_max is not None and price_min > price_max:
        raise HTTPException(status_code=400, detail="price_min cannot be greater than price_max")
    if qty_min is not None and qty_max is not None and qty_min > qty_max:
        raise HTTPException(status_code=400, detail="qty_min cannot be greater than qty_max")
    if start_from is not None and end_to is not None and start_from > end_to:
        raise HTTPException(status_code=400, detail="start_from cannot be after end_to")
    if sort_dir not in ("asc", "desc"):
        raise HTTPException(status_code=400, detail="sort_dir must be asc or desc")

    filters = []
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

    stmt = select(Contract).where(and_(*filters)) if filters else select(Contract)

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

    return db.scalars(stmt).all()

@router.get("/{contract_id}", response_model=ContractOut)
def get_contract(contract_id: int, db: Session = Depends(get_db)):
    c = db.get(Contract, contract_id)
    if not c:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Contract not found")
    return c

@router.patch("/{contract_id}", response_model=ContractOut)
def update_contract(contract_id: int, payload: ContractUpdate, db: Session = Depends(get_db)):
    c = db.get(Contract, contract_id)
    if not c:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Contract not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(c, k, v)

    db.commit()
    db.refresh(c)
    return c

@router.delete("/{contract_id}", status_code=204)
def delete_contract(contract_id: int, db: Session = Depends(get_db)):
    c = db.get(Contract, contract_id)
    if not c:
        return
    db.delete(c)
    db.commit()
