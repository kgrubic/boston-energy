from datetime import date


def test_contracts_crud(client):
    payload = {
        "energy_type": "Solar",
        "quantity_mwh": 500,
        "price_per_mwh": 45.5,
        "delivery_start": str(date(2026, 3, 1)),
        "delivery_end": str(date(2026, 5, 31)),
        "location": "California",
        "status": "Available",
    }

    create_res = client.post("/api/contracts", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    contract_id = created["id"]
    assert created["energy_type"] == "Solar"

    list_res = client.get("/api/contracts")
    assert list_res.status_code == 200
    items = list_res.json()["items"]
    assert any(c["id"] == contract_id for c in items)

    get_res = client.get(f"/api/contracts/{contract_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == contract_id

    update_res = client.patch(
        f"/api/contracts/{contract_id}",
        json={"price_per_mwh": 49.25},
    )
    assert update_res.status_code == 200
    assert float(update_res.json()["price_per_mwh"]) == 49.25

    delete_res = client.delete(f"/api/contracts/{contract_id}")
    assert delete_res.status_code == 204

    missing_res = client.get(f"/api/contracts/{contract_id}")
    assert missing_res.status_code == 404
