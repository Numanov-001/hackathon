from decimal import Decimal

from sqlalchemy import select

from app.models import Offer, Product, Region
from app.services.ai_service import parse_intent
from app.services.market_service import daily_median_by_region, market_summary
from app.services.recommendation_service import recommend_asks
from app.utils.fuzzy_search import fuzzy_match_product, normalize_product_name


def test_create_ask_and_bid(client):
    products = client.get("/api/products").json()
    regions = client.get("/api/regions").json()
    users = client.get("/api/users").json()
    ask = client.post(
        "/api/offers",
        json={
            "product_id": products[0]["id"],
            "region_id": regions[0]["id"],
            "seller_id": users[0]["id"],
            "price": "5200",
            "volume": "200",
            "order_type": "ASK",
        },
    )
    bid = client.post(
        "/api/offers",
        json={
            "product_id": products[0]["id"],
            "region_id": regions[0]["id"],
            "seller_id": users[1]["id"],
            "price": "4100",
            "volume": "150",
            "order_type": "BID",
        },
    )
    assert ask.status_code == 200
    assert bid.status_code == 200
    assert ask.json()["order_type"] == "ASK"
    assert bid.json()["order_type"] == "BID"


def test_median_excludes_bids(db):
    offers = list(db.execute(select(Offer)).scalars())
    medians = daily_median_by_region(offers)
    namangan = medians["Namangan"]
    today = next(iter(namangan.values()))
    assert today == Decimal("5050")


def test_market_summary_spread(db):
    summary = market_summary(db, "Tomato", "Namangan")
    assert summary.best_ask == Decimal("5000")
    assert summary.best_bid == Decimal("3500")
    assert summary.spread == Decimal("1500")
    assert summary.active_asks == 2
    assert summary.active_bids == 2


def test_history_uses_ask_only(client):
    history = client.get("/api/market/Tomato/history").json()
    assert history["product"] == "Tomato"
    namangan = next(item for item in history["regions"] if item["region"] == "Namangan")
    live = [point for point in namangan["data"] if point["source"] == "user_ask_median"]
    assert live
    assert float(live[-1]["median_price"]) == 5050


def test_recommendation_prefers_region_and_volume(db):
    tomato = db.execute(select(Product).where(Product.name == "Tomato")).scalar_one()
    namangan = db.execute(select(Region).where(Region.name == "Namangan")).scalar_one()
    ranked = recommend_asks(db, tomato.id, namangan.id, Decimal("500"))
    assert ranked[0]["region"] == "Namangan"
    assert float(ranked[0]["volume"]) >= 500


def test_fuzzy_search(client):
    assert normalize_product_name("pomidor") == "Tomato"
    assert fuzzy_match_product("помидор", ["Tomato", "Potato"]) == "Tomato"
    result = client.get("/api/search", params={"q": "pomidor", "region": "Namangan"}).json()
    assert result["product"] == "Tomato"
    assert result["tier"] in (1, 2)
    assert result["offers"]


def test_forecast_is_range(client):
    data = client.get("/api/forecast/Tomato").json()
    assert data["method"].startswith("LinearRegression")
    assert "точно" not in data["summary"].lower()
    assert "disclaimer" in data


def test_ai_intent_fallback():
    intent, used_llm = parse_intent("Мне нужно 2 тонны помидоров в Намангане дешевле 5000")
    assert used_llm is False
    assert intent.product == "Tomato"
    assert intent.region == "Namangan"
    assert intent.volume == Decimal("2000")
    assert intent.max_price == Decimal("5000")


def test_websocket_new_offer(client):
    products = client.get("/api/products").json()
    regions = client.get("/api/regions").json()
    users = client.get("/api/users").json()
    with client.websocket_connect("/ws/market") as ws:
        response = client.post(
            "/api/offers",
            json={
                "product_id": products[0]["id"],
                "region_id": regions[0]["id"],
                "seller_id": users[0]["id"],
                "price": "5300",
                "volume": "120",
                "order_type": "ASK",
            },
        )
        assert response.status_code == 200
        event = ws.receive_json()
        assert event["type"] == "new_offer"
        assert event["data"]["order_type"] == "ASK"
        assert str(event["data"]["price"]).startswith("5300")


def test_desk_catalog_and_offers(db, client):
    from app.services.desk_catalog import seed_desk

    seed_desk(db)
    db.commit()
    catalog = client.get("/api/desk/catalog").json()
    assert len(catalog) == 10
    pomidor = next(item for item in catalog if item["id"] == "pomidor")
    assert len(pomidor["chartData"]) == 24
    assert pomidor["price"] > 0
    offers = client.get("/api/desk/offers").json()
    assert len(offers) >= 10
    assert {item["side"] for item in offers} == {"buy", "sell"}
    assert offers[0]["phone"].startswith("+998")
    posted = client.post(
        "/api/desk/offers",
        json={
            "productId": "pomidor",
            "region": "Samarqand",
            "side": "sell",
            "price": "9000",
            "quantity": "2000",
            "phone": "901112233",
            "name": "Test dehqon",
            "payment": "Naqd",
        },
    )
    assert posted.status_code == 200
    body = posted.json()
    assert body["phone"] == "+998901112233"
    assert body["side"] == "sell"
    assert body["available"] == 2000
    missing = client.post("/api/desk/offers", json={"productId": "pomidor", "side": "buy", "price": "1", "quantity": "1", "phone": "12", "region": "Samarqand"})
    assert missing.status_code == 400
