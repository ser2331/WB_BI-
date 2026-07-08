from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.schemas.dashboard_data import DashboardDataset

IMAGE_SIZES = ("c246x328", "tm", "big", "c516x688")
EXTENSIONS = ("webp", "jpg")


def basket_number(vol: int) -> str:
    if vol <= 143:
        return "01"
    if vol <= 287:
        return "02"
    if vol <= 431:
        return "03"
    if vol <= 719:
        return "04"
    if vol <= 1007:
        return "05"
    if vol <= 1061:
        return "06"
    if vol <= 1115:
        return "07"
    if vol <= 1169:
        return "08"
    if vol <= 1313:
        return "09"
    if vol <= 1601:
        return "10"
    if vol <= 1655:
        return "11"
    if vol <= 1919:
        return "12"
    if vol <= 2045:
        return "13"
    if vol <= 2189:
        return "14"
    if vol <= 2405:
        return "15"
    if vol <= 2621:
        return "16"
    if vol <= 2875:
        return "17"
    if vol <= 3129:
        return "18"
    if vol <= 3383:
        return "19"
    if vol <= 3637:
        return "20"
    if vol <= 3891:
        return "21"
    if vol <= 4145:
        return "22"
    if vol <= 4399:
        return "23"
    if vol <= 4653:
        return "24"
    if vol <= 4907:
        return "25"
    if vol <= 5161:
        return "26"
    if vol <= 5415:
        return "27"
    if vol <= 5669:
        return "28"
    if vol <= 5923:
        return "29"
    if vol <= 6177:
        return "30"
    if vol <= 6431:
        return "31"
    if vol <= 6685:
        return "32"
    if vol <= 6939:
        return "33"
    if vol <= 7193:
        return "34"
    if vol <= 7447:
        return "35"
    if vol <= 7701:
        return "36"
    if vol <= 7955:
        return "37"
    if vol <= 8209:
        return "38"
    if vol <= 8463:
        return "39"
    return "40"


def basket_hosts(vol: int) -> list[str]:
    primary = int(basket_number(vol))
    hosts: list[str] = []
    for delta in range(2):
        for n in (primary - delta, primary + delta):
            if n < 1 or n > 40:
                continue
            host = f"basket-{n:02d}.wbbasket.ru"
            if host not in hosts:
                hosts.append(host)
    return hosts


def wb_photo_candidates(nm: str | int) -> list[str]:
    try:
        nm_id = int(str(nm).strip())
    except (TypeError, ValueError):
        return []
    if nm_id <= 0:
        return []

    vol = nm_id // 100000
    part = nm_id // 1000
    urls: list[str] = []
    seen: set[str] = set()

    for host in basket_hosts(vol):
        for size in IMAGE_SIZES:
            for ext in EXTENSIONS:
                url = f"https://{host}/vol{vol}/part{part}/{nm_id}/images/{size}/1.{ext}"
                if url not in seen:
                    seen.add(url)
                    urls.append(url)
    return urls


def wb_photo_url(nm: str | int) -> str | None:
    candidates = wb_photo_candidates(nm)
    return candidates[0] if candidates else None


def resolve_photo_url(photo: str | None, nm: str | int) -> str | None:
    if photo:
        lower = photo.strip().lower()
        if lower.startswith("http://") or lower.startswith("https://"):
            return photo.strip()
    return wb_photo_url(nm)


def normalize_dataset_photos(dataset: DashboardDataset) -> DashboardDataset:
    for block in dataset.blocks:
        for product in block.products:
            product.photo = resolve_photo_url(product.photo, product.nm)
    return dataset
