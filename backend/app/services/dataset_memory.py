import json
import logging
from pathlib import Path
from threading import Lock

from app.schemas.dashboard_data import DashboardDataset
from app.utils.wb_photo import normalize_dataset_photos

logger = logging.getLogger(__name__)

_lock = Lock()
_dataset: DashboardDataset | None = None

DATASET_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DATASET_FILE = DATASET_DIR / "dataset.json"


def get_dataset() -> DashboardDataset | None:
    with _lock:
        return _dataset


def has_dataset() -> bool:
    with _lock:
        return _dataset is not None


def save_dataset(dataset: DashboardDataset) -> None:
    global _dataset
    normalized = normalize_dataset_photos(dataset)
    payload = normalized.model_dump(mode="json")
    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    DATASET_FILE.write_text(
        json.dumps(payload, ensure_ascii=False),
        encoding="utf-8",
    )
    with _lock:
        _dataset = normalized
    logger.info("Dataset saved in memory (%s blocks)", len(normalized.blocks))


def clear_dataset() -> bool:
    global _dataset
    with _lock:
        if _dataset is None and not DATASET_FILE.exists():
            return False
        _dataset = None
    if DATASET_FILE.exists():
        DATASET_FILE.unlink()
    logger.info("Dataset cleared")
    return True


def load_from_disk() -> bool:
    global _dataset
    if not DATASET_FILE.exists():
        return False
    try:
        raw = json.loads(DATASET_FILE.read_text(encoding="utf-8-sig"))
        dataset = normalize_dataset_photos(DashboardDataset.model_validate(raw))
        with _lock:
            _dataset = dataset
        logger.info("Dataset loaded from disk (%s blocks)", len(dataset.blocks))
        return True
    except Exception as e:
        logger.warning("Failed to load dataset from disk: %s", e)
        return False
