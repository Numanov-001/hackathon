import time

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

router = APIRouter(prefix="/siat", tags=["siat"])

SIAT_1308_URL = "https://siat.stat.uz/api/sdmx/1308/table/"
TTL_SECONDS = 30 * 60
_cache: dict[str, object] = {"at": 0.0, "body": b"", "status": 0}


@router.get("/1308")
def get_dataset_1308() -> Response:
    now = time.time()
    body = _cache["body"]
    cached_at = float(_cache["at"] or 0)
    if isinstance(body, (bytes, bytearray)) and body and now - cached_at < TTL_SECONDS:
        return Response(content=bytes(body), media_type="application/json")
    try:
        with httpx.Client(timeout=45.0) as client:
            response = client.get(SIAT_1308_URL, headers={"Accept": "application/json"})
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="SIAT ulanmadi.") from exc
    _cache["at"] = time.time()
    _cache["body"] = response.content
    _cache["status"] = response.status_code
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="SIAT javob bermadi.")
    return Response(content=response.content, media_type="application/json")
