from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.deps import require_admin
from app.schemas.auth import AuthUser
from app.schemas.dashboard_data import ImportResponse
from app.services.dataset_memory import clear_dataset, save_dataset
from app.services.file_import import parse_upload
from app.services.photo_resolver import clear_photo_cache

router = APIRouter(prefix="/api", tags=["import"])


@router.post("/import", response_model=ImportResponse)
async def import_file(
    file: UploadFile = File(...),
    _: AuthUser = Depends(require_admin),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Имя файла не указано")

    lower = file.filename.lower()
    if not (lower.endswith(".csv") or lower.endswith(".json")):
        raise HTTPException(status_code=400, detail="Поддерживаются только .csv и .json")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Файл пустой")

    try:
        dataset = parse_upload(file.filename, content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ошибка разбора файла: {e}") from e

    save_dataset(dataset)
    clear_photo_cache()

    products_count = sum(len(b.products) for b in dataset.blocks)
    return ImportResponse(
        success=True,
        message="Файл успешно загружен и обработан",
        file_name=file.filename,
        format=dataset.sourceFormat or "unknown",
        blocks_count=len(dataset.blocks),
        products_count=products_count,
    )


@router.delete("/import")
async def delete_import(_: AuthUser = Depends(require_admin)):
    removed = clear_dataset()
    clear_photo_cache()
    if not removed:
        raise HTTPException(status_code=404, detail="Нет загруженных данных")
    return {"ok": True}
