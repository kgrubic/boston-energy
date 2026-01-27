import enum
from datetime import date
from sqlalchemy import Enum, String, Date, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class EnergyType(str, enum.Enum):
    Solar = "Solar"
    Wind = "Wind"
    NaturalGas = "Natural Gas"
    Nuclear = "Nuclear"
    Coal = "Coal"
    Hydro = "Hydro"

class ContractStatus(str, enum.Enum):
    Available = "Available"
    Reserved = "Reserved"
    Sold = "Sold"

class Contract(Base):
    __tablename__ = "contracts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    energy_type: Mapped[EnergyType] = mapped_column(Enum(EnergyType), index=True)
    quantity_mwh: Mapped[int] = mapped_column(Integer, index=True)
    price_per_mwh: Mapped[float] = mapped_column(Numeric(12, 2), index=True)
    delivery_start: Mapped[date] = mapped_column(Date, index=True)
    delivery_end: Mapped[date] = mapped_column(Date, index=True)
    location: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[ContractStatus] = mapped_column(Enum(ContractStatus), index=True, default=ContractStatus.Available)
