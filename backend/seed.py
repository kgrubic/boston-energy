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
    dict(energy_type=EnergyType.Hydro, quantity_mwh=650, price_per_mwh=41.25,
         delivery_start=date(2026,6,1), delivery_end=date(2026,11,30),
         location="Pacific Northwest", status=ContractStatus.Available),
    dict(energy_type=EnergyType.Nuclear, quantity_mwh=2000, price_per_mwh=62.10,
         delivery_start=date(2026,5,15), delivery_end=date(2027,5,14),
         location="Midwest", status=ContractStatus.Available),
    dict(energy_type=EnergyType.Coal, quantity_mwh=1500, price_per_mwh=35.90,
         delivery_start=date(2026,3,15), delivery_end=date(2026,12,31),
         location="Appalachia", status=ContractStatus.Available),
    dict(energy_type=EnergyType.Solar, quantity_mwh=900, price_per_mwh=47.80,
         delivery_start=date(2026,7,1), delivery_end=date(2026,10,31),
         location="Arizona", status=ContractStatus.Available),
    dict(energy_type=EnergyType.Wind, quantity_mwh=1100, price_per_mwh=39.40,
         delivery_start=date(2026,8,1), delivery_end=date(2027,1,31),
         location="Oklahoma", status=ContractStatus.Available),
    dict(energy_type=EnergyType.NaturalGas, quantity_mwh=700, price_per_mwh=50.25,
         delivery_start=date(2026,9,15), delivery_end=date(2027,3,15),
         location="Louisiana", status=ContractStatus.Available),
    dict(energy_type=EnergyType.Hydro, quantity_mwh=480, price_per_mwh=43.60,
         delivery_start=date(2026,10,1), delivery_end=date(2027,4,30),
         location="New York", status=ContractStatus.Available),
    dict(energy_type=EnergyType.Nuclear, quantity_mwh=1800, price_per_mwh=60.50,
         delivery_start=date(2026,11,1), delivery_end=date(2027,10,31),
         location="Southeast", status=ContractStatus.Available),
    dict(energy_type=EnergyType.Coal, quantity_mwh=1300, price_per_mwh=33.75,
         delivery_start=date(2026,12,1), delivery_end=date(2027,6,30),
         location="Wyoming", status=ContractStatus.Available),
    dict(energy_type=EnergyType.Solar, quantity_mwh=750, price_per_mwh=44.20,
         delivery_start=date(2027,1,15), delivery_end=date(2027,6,15),
         location="Nevada", status=ContractStatus.Available),
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
