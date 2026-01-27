from pydantic import BaseModel
from app.schemas.contract import ContractOut

class PortfolioItemOut(BaseModel):
    id: int
    contract: ContractOut
    model_config = {"from_attributes": True}

class PortfolioMetrics(BaseModel):
    total_contracts: int
    total_capacity_mwh: int
    total_cost: float
    weighted_avg_price_per_mwh: float
    by_energy_type: dict[str, dict[str, float]]  # {type: {capacity_mwh, cost}}
