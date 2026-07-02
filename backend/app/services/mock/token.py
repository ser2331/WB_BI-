import base64
import json
import uuid
from datetime import datetime, timedelta


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_mock_jwt(seller_name: str = "Демо Магазин WB BI") -> str:
    """JWT в формате WB (header.payload.signature) с флагом mock."""
    header = {"alg": "ES256", "typ": "JWT", "kid": "mock2026v1"}
    payload = {
        "id": str(uuid.uuid4()),
        "acc": 3,
        "sid": str(uuid.uuid4()),
        "exp": int((datetime.utcnow() + timedelta(days=180)).timestamp()),
        "s": 36,
        "t": False,
        "mock": True,
        "seller": seller_name,
    }
    h = _b64url_encode(json.dumps(header, separators=(",", ":")).encode())
    p = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode())
    sig = _b64url_encode(b"wb-bi-mock-signature")
    return f"{h}.{p}.{sig}"


def decode_mock_payload(token: str) -> dict | None:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        return json.loads(_b64url_decode(parts[1]))
    except (json.JSONDecodeError, ValueError, IndexError):
        return None


def is_mock_token(token: str) -> bool:
    payload = decode_mock_payload(token)
    if payload and payload.get("mock") is True:
        return True
    return token in ("mock", "demo") or token.startswith("mock_")
