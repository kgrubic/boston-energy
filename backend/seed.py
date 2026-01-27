from datetime import date
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.contract import Contract, EnergyType, ContractStatus

SAMPLE = [
    dict(energy_type=EnergyType.Solar, quantity_mwh=500, price_per_mwh=45.50,
         delivery_start=date(2026,3,1), delivery_end=date(2026,5,31),
         location="California", status=ContractStatus.Available),
    dict(energy_type=EnergyType.Wind, quantity_mwh=1200, price_per_mwh=38.75,
         delivery_start=date(2026,4,1), delivery_end=date(2026,9,30),
         location="Texas", status=ContractStatus.Available),
    dict(energy_type=EnergyType.NaturalGas, quantity_mwh=800, price_per_mwh=52.00,
         delivery_start=date(2026,2,15), delivery_end=date(2026,8,15),
         location="Northeast", status=ContractStatus.Available),
]

def run():
    db: Session = SessionLocal()
    try:
        if db.query(Contract).count() > 0:
            print("Contracts already exist; skipping seed.")
            return
        db.add_all([Contract(**c) for c in SAMPLE])
        db.commit()
        print("Seeded contracts.")
    finally:
        db.close()

if __name__ == "__main__":
    run()
