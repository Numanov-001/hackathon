import pytest
from app.services.prediction_service import _fallback_prediction, _normalize_name, MARKET_PROFILES


def test_normalize_name():
    assert _normalize_name("Bug‘doy uni") == "Bug'doy uni"
    assert _normalize_name("Kungaboqar yog‘i") == "Kungaboqar yog'i"
    assert _normalize_name("Pomidor") == "Pomidor"


def test_market_profiles_complete():
    # All 10 products from desk_catalog must be present in MARKET_PROFILES
    products = [
        "Pomidor", "Kartoshka", "Piyoz", "Bodring",
        "PE suv trubasi", "Metall truba", "PVC kanalizatsiya",
        "Bug'doy uni", "Kungaboqar yog'i", "Guruch",
    ]
    for p in products:
        assert p in MARKET_PROFILES, f"{p} missing from MARKET_PROFILES"
        profile = MARKET_PROFILES[p]
        assert "hubs" in profile
        assert "season" in profile
        assert "drivers" in profile
        assert len(profile["drivers"]) >= 2


def test_fallback_prediction_uzbek():
    history = [("2026-08", 5000), ("2026-09", 6000)]
    pred = _fallback_prediction("Pomidor", history, 3, 6000)
    assert pred.product == "Pomidor"
    assert pred.horizon == 3
    assert len(pred.predicted_points) == 3
    assert pred.trend in ("up", "down", "flat")
    assert pred.confidence == "past"
    assert pred.best_action in ("Hozir olish", "Kutish", "Kuzatib turish")
    # All explanations must be in Uzbek
    assert "oyda narx" in pred.explanation.direction
    assert pred.explanation.seasonal.startswith("Mavsum:")
    assert pred.explanation.driver.startswith("Asosiy omillar:")


def test_predict_endpoint_auth(client):
    # Unauthenticated request must return 401
    resp = client.post("/api/forecast/pomidor/predict", json={"horizon": 6})
    assert resp.status_code == 401


def test_predict_endpoint_nonexistent(client):
    # Even if unauthenticated, 401 is first
    resp = client.post("/api/forecast/random-unknown-item/predict", json={"horizon": 6})
    assert resp.status_code == 401


def test_predict_endpoint_success(client, db, monkeypatch):
    from app.models import Product, Subscription
    from app.schemas.forecast import PredictionExplanation, PredictionPoint, PredictionRead
    from app.services.desk_catalog import seed_desk

    seed_desk(db)
    db.commit()

    # Mock clerk_user_id to return a test user with a business subscription
    monkeypatch.setattr("app.api.forecast.clerk_user_id", lambda auth: "test_paid_user")
    db.add(Subscription(clerk_user_id="test_paid_user", plan="business"))
    db.commit()

    async def mock_predict(*args, **kwargs):
        return PredictionRead(
            product="Pomidor",
            horizon=3,
            predicted_points=[
                PredictionPoint(date="2026-10", price=10000, low=9000, high=11000),
                PredictionPoint(date="2026-11", price=12000, low=11000, high=13000),
                PredictionPoint(date="2026-12", price=14000, low=13000, high=15000),
            ],
            trend="up",
            explanation=PredictionExplanation(
                direction="Narx 40% oshadi.",
                seasonal="Qish yaqinlashmoqda.",
                driver="Issiqxona xarajati.",
                recommendation="Hozir oling.",
            ),
            confidence="yuqori",
            best_action="Hozir olish",
            disclaimer="Test",
        )

    monkeypatch.setattr("app.api.forecast.predict_price", mock_predict)

    # Request prediction for pomidor
    resp = client.post(
        "/api/forecast/pomidor/predict",
        json={"horizon": 3},
        headers={"Authorization": "Bearer fake_token"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["product"] == "Pomidor"
    assert data["horizon"] == 3
    assert len(data["predicted_points"]) == 3
    assert data["trend"] in ("up", "down", "flat")
    assert "direction" in data["explanation"]
    assert "recommendation" in data["explanation"]

