# API contract

Base URL local: `http://127.0.0.1:8000`

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | liveness |
| GET/POST | `/api/products` | catalog |
| GET/POST | `/api/regions` | catalog |
| GET/POST | `/api/users` | demo users |
| GET/POST | `/api/offers` | P2P intentions. POST broadcasts `new_offer` |
| GET | `/api/market/{product}/history` | daily median ASK + synthetic history |
| GET | `/api/market/{product}/summary` | best ask/bid/spread |
| GET | `/api/recommendations?product=&region=&volume=` | deterministic ranking |
| GET | `/api/search?q=&region=&volume=&max_price=` | tier 1–2 |
| GET | `/api/forecast/{product}` | trend range, not exact price |
| POST | `/api/chat` | intent + explanation |
| WS | `/ws/market` | raw live offers |

`product` can be id or name (`Tomato`).

WebSocket event:

```json
{
  "type": "new_offer",
  "data": {
    "id": 123,
    "product": "Tomato",
    "region": "Namangan",
    "price": "5000.00",
    "volume": "1000.00",
    "order_type": "ASK"
  }
}
```
