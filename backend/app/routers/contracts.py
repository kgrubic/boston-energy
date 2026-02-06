from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.contract import EnergyType, ContractStatus
from app.schemas.contract import ContractCreate, ContractOut, ContractUpdate, ContractListOut, ContractPriceBoundsOut
from app.services import contracts_service

router = APIRouter(prefix="/contracts", tags=["contracts"])

@router.get("/price-bounds", response_model=ContractPriceBoundsOut)
def price_bounds(
    db: Session = Depends(get_db),
    energy_type: list[EnergyType] | None = Query(default=None),
    location: list[str] | None = Query(default=None),
    status: ContractStatus | None = ContractStatus.Available,
    qty_min: int | None = None,
    qty_max: int | None = None,
    start_from: date | None = None,
    end_to: date | None = None,
):
    return contracts_service.get_price_bounds(
        db=db,
        energy_type=energy_type,
        location=location,
        status=status,
        qty_min=qty_min,
        qty_max=qty_max,
        start_from=start_from,
        end_to=end_to,
    )

@router.get("/locations", response_model=list[str])
def list_locations(db: Session = Depends(get_db)):
    return contracts_service.list_locations(db)

@router.post("", response_model=ContractOut, status_code=201)
def create_contract(payload: ContractCreate, db: Session = Depends(get_db)):
    return contracts_service.create_contract(db, payload)

@router.get("", response_model=ContractListOut)
def list_contracts(
    db: Session = Depends(get_db),
    energy_type: list[EnergyType] | None = Query(default=None),
    location: list[str] | None = Query(default=None),
    status: ContractStatus | None = ContractStatus.Available,
    sort_by: str | None = None,
    sort_dir: str = "desc",
    page: int = 1,
    page_size: int = 20,
    price_min: float | None = None,
    price_max: float | None = None,
    qty_min: int | None = None,
    qty_max: int | None = None,
    start_from: date | None = None,
    end_to: date | None = None,
):
    return contracts_service.list_contracts(
        db=db,
        energy_type=energy_type,
        location=location,
        status=status,
        sort_by=sort_by,
        sort_dir=sort_dir,
        page=page,
        page_size=page_size,
        price_min=price_min,
        price_max=price_max,
        qty_min=qty_min,
        qty_max=qty_max,
        start_from=start_from,
        end_to=end_to,
    )

@router.get("/{contract_id}", response_model=ContractOut)
def get_contract(contract_id: int, db: Session = Depends(get_db)):
    return contracts_service.get_contract(db, contract_id)

@router.patch("/{contract_id}", response_model=ContractOut)
def update_contract(contract_id: int, payload: ContractUpdate, db: Session = Depends(get_db)):
    return contracts_service.update_contract(db, contract_id, payload)

@router.delete("/{contract_id}", status_code=204)
def delete_contract(contract_id: int, db: Session = Depends(get_db)):
    return contracts_service.delete_contract(db, contract_id)
