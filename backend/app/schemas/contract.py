from datetime import date
from pydantic import BaseModel, Field
from app.models.contract import EnergyType, ContractStatus

class ContractBase(BaseModel):
    energy_type: EnergyType
    quantity_mwh: int = Field(gt=0)
    price_per_mwh: float = Field(gt=0)
    delivery_start: date
    delivery_end: date
    location: str
    status: ContractStatus = ContractStatus.Available

class ContractCreate(ContractBase):
    pass

class ContractUpdate(BaseModel):
    energy_type: EnergyType | None = None
    quantity_mwh: int | None = Field(default=None, gt=0)
    price_per_mwh: float | None = Field(default=None, gt=0)
    delivery_start: date | None = None
    delivery_end: date | None = None
    location: str | None = None
    status: ContractStatus | None = None

class ContractOut(ContractBase):
    id: int
    model_config = {"from_attributes": True}

class ContractListOut(BaseModel):
    items: list[ContractOut]
    page: int
    page_size: int
    total: int

class ContractPriceBoundsOut(BaseModel):
    min_price: float | None
    max_price: float | None
