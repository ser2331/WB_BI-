import logging

import httpx

from app.utils.wb_photo import IMAGE_SIZES, basket_number, wb_photo_candidates

logger = logging.getLogger(__name__)

_cache: dict[str, str | None] = {}
_MAX_BASKET = 40
_CARD_JSON_PROBES = 20
_IMAGE_PROBES = 24


def _basket_probe_order(vol: int) -> list[int]:
    primary = int(basket_number(vol))
    ordered: list[int] = []
    for delta in range(_MAX_BASKET):
        for candidate in (primary - delta, primary + delta):
            if 1 <= candidate <= _MAX_BASKET and candidate not in ordered:
                ordered.append(candidate)
    for candidate in range(1, _MAX_BASKET + 1):
        if candidate not in ordered:
            ordered.append(candidate)
    return ordered


async def _probe_url(client: httpx.AsyncClient, url: str) -> bool:
    try:
        response = await client.head(url, follow_redirects=True)
        if response.status_code == 200:
            return True
        if response.status_code == 405:
            response = await client.get(url, follow_redirects=True)
            return response.status_code == 200
    except Exception:
        return False
    return False


async def _resolve_via_card_json(client: httpx.AsyncClient, nm_id: int) -> str | None:
    vol = nm_id // 100000
    part = nm_id // 1000

    for basket in _basket_probe_order(vol)[:_CARD_JSON_PROBES]:
        host = f"basket-{basket:02d}.wbbasket.ru"
        card_url = f"https://{host}/vol{vol}/part{part}/{nm_id}/info/ru/card.json"
        try:
            response = await client.get(card_url)
            if response.status_code != 200:
                continue
            payload = response.json()
            if not isinstance(payload, dict) or not payload:
                continue
        except Exception:
            continue

        for size in IMAGE_SIZES:
            for ext in ("webp", "jpg"):
                url = f"https://{host}/vol{vol}/part{part}/{nm_id}/images/{size}/1.{ext}"
                if await _probe_url(client, url):
                    return url
    return None


async def _resolve_via_wb_card_api(client: httpx.AsyncClient, nm_id: int) -> str | None:
    card_url = f"https://card.wb.ru/cards/v2/detail?appType=1&curr=rub&dest=-1257786&nm={nm_id}"
    try:
        response = await client.get(card_url)
        if response.status_code != 200:
            return None
        payload = response.json()
        products = payload.get("data", {}).get("products", [])
        if not products:
            return None
        product = products[0]
        vol = nm_id // 100000
        part = nm_id // 1000
        pics = int(product.get("pics") or 1)
        for basket in _basket_probe_order(vol)[:8]:
            host = f"basket-{basket:02d}.wbbasket.ru"
            for pic_idx in range(1, min(pics, 3) + 1):
                for size in IMAGE_SIZES:
                    for ext in ("webp", "jpg"):
                        url = (
                            f"https://{host}/vol{vol}/part{part}/{nm_id}/images/"
                            f"{size}/{pic_idx}.{ext}"
                        )
                        if await _probe_url(client, url):
                            return url
    except Exception:
        return None
    return None


async def resolve_product_photo(nm: str) -> str | None:
    nm_str = str(nm).strip()
    if not nm_str:
        return None
    if nm_str in _cache:
        return _cache[nm_str]

    try:
        nm_id = int(nm_str)
    except ValueError:
        _cache[nm_str] = None
        return None

    if nm_id <= 0:
        _cache[nm_str] = None
        return None

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(4.0, connect=2.0),
        headers={"User-Agent": "WB-BI/1.0"},
    ) as client:
        for resolver in (_resolve_via_card_json, _resolve_via_wb_card_api):
            url = await resolver(client, nm_id)
            if url:
                _cache[nm_str] = url
                return url

        for url in wb_photo_candidates(nm_str)[:_IMAGE_PROBES]:
            if await _probe_url(client, url):
                _cache[nm_str] = url
                return url

    _cache[nm_str] = None
    logger.debug("No photo found for nm=%s", nm_str)
    return None


def clear_photo_cache() -> None:
    _cache.clear()
