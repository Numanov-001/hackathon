import base64
import logging

import jwt
from jwt import PyJWKClient

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_jwk_client: PyJWKClient | None = None
_jwk_url: str = ""


def jwks_url() -> str:
    raw = get_settings().clerk_publishable_key.strip()
    if not raw.startswith(("pk_test_", "pk_live_")):
        return ""
    encoded = raw.split("_", 2)[-1]
    pad = "=" * (-len(encoded) % 4)
    try:
        decoded = base64.b64decode(encoded + pad).decode("utf-8")
    except Exception:
        return ""
    host = decoded.rstrip("$").strip()
    if not host or "/" in host or " " in host:
        return ""
    return f"https://{host}/.well-known/jwks.json"


def _client() -> PyJWKClient | None:
    global _jwk_client, _jwk_url
    url = jwks_url()
    if not url:
        return None
    if _jwk_client is None or _jwk_url != url:
        _jwk_client = PyJWKClient(url, cache_keys=True, lifespan=3600)
        _jwk_url = url
    return _jwk_client


def clerk_user_id(authorization: str | None) -> str | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        return None
    client = _client()
    if client is None:
        return None
    try:
        key = client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            key.key,
            algorithms=["RS256"],
            leeway=30,
            options={"verify_aud": False},
        )
    except Exception:
        logger.info("Clerk session token rejected")
        return None
    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject.startswith("user_"):
        return None
    return subject[:128]
