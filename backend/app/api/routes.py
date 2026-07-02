from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session
from app.models.database import WBAccount
from app.schemas.api import (
    DATA_SOURCE_META,
    DashboardData,
    DataSourceConfigResponse,
    DataSourceConfigUpdate,
    SyncRequest,
    SyncResult,
    WBConnectionStatus,
    WBTokenRequest,
)
from app.services.dashboard import build_dashboard_from_cache
from app.services.data_sync import ensure_data_sources, sync_enabled_sources
from app.services.mock.token import create_mock_jwt, decode_mock_payload, is_mock_token
from app.services.mock_seed import connect_mock_account, seed_mock_analytics
from app.services.wb_client import WBAPIError
from app.services.wb_factory import create_wb_client

router = APIRouter(prefix="/api", tags=["api"])


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "mock_wb": settings.mock_wb,
        "auto_seed_mock": settings.auto_seed_mock,
    }


@router.get("/mock/token")
async def get_mock_token():
    if not settings.mock_wb:
        raise HTTPException(status_code=404, detail="Mock mode disabled")
    token = create_mock_jwt()
    return {
        "token": token,
        "hint": "Вставьте этот JWT в настройках или вызовите POST /api/wb/connect-mock",
    }


@router.post("/wb/connect-mock", response_model=WBConnectionStatus)
async def wb_connect_mock(session: AsyncSession = Depends(get_session)):
    if not settings.mock_wb:
        raise HTTPException(status_code=403, detail="Mock mode disabled")
    _, seller_name = await connect_mock_account(session)
    await seed_mock_analytics(session)
    return WBConnectionStatus(
        connected=True,
        message="Демо-режим (mock JWT + данные)",
        seller_name=seller_name,
        is_mock=True,
    )


@router.get("/wb/status", response_model=WBConnectionStatus)
async def wb_status(session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(WBAccount)
        .where(WBAccount.is_active == True)  # noqa: E712
        .order_by(WBAccount.updated_at.desc())
        .limit(1)
    )
    account = result.scalar_one_or_none()
    if not account:
        return WBConnectionStatus(connected=False, message="Аккаунт не подключён")

    if is_mock_token(account.api_token):
        payload = decode_mock_payload(account.api_token) or {}
        name = payload.get("seller", "Демо Магазин")
        return WBConnectionStatus(
            connected=True,
            message="Демо-режим (mock)",
            seller_name=name,
            is_mock=True,
        )

    client = create_wb_client(account.api_token)
    if not await client.ping():
        return WBConnectionStatus(connected=False, message="Токен недействителен")

    try:
        info = await client.get_seller_info()
        name = info.get("name") or info.get("tradeMark") or "Продавец"
        return WBConnectionStatus(connected=True, message="Подключено", seller_name=name)
    except WBAPIError as e:
        return WBConnectionStatus(connected=True, message=str(e))


@router.post("/wb/connect", response_model=WBConnectionStatus)
async def wb_connect(
    body: WBTokenRequest, session: AsyncSession = Depends(get_session)
):
    use_mock = is_mock_token(body.api_token)
    if use_mock and not settings.mock_wb:
        raise HTTPException(status_code=400, detail="Mock-токены отключены")

    client = create_wb_client(body.api_token)
    if not await client.ping():
        raise HTTPException(status_code=400, detail="Неверный API-токен")

    try:
        info = await client.get_seller_info()
    except WBAPIError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    existing = await session.execute(select(WBAccount))
    for acc in existing.scalars().all():
        acc.is_active = False

    session.add(WBAccount(api_token=body.api_token, is_active=True))
    await ensure_data_sources(session)

    name = info.get("name") or info.get("tradeMark") or "Продавец"
    message = "Демо-режим (mock)" if use_mock else "Подключено"
    return WBConnectionStatus(
        connected=True, message=message, seller_name=name, is_mock=use_mock
    )


@router.delete("/wb/disconnect")
async def wb_disconnect(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(WBAccount))
    for acc in result.scalars().all():
        acc.is_active = False
    await session.commit()
    return {"ok": True}


@router.get("/data-sources", response_model=list[DataSourceConfigResponse])
async def list_data_sources(session: AsyncSession = Depends(get_session)):
    await ensure_data_sources(session)
    result = await session.execute(select(DataSourceConfig))
    configs = {c.source_key: c for c in result.scalars().all()}

    response = []
    for key, meta in DATA_SOURCE_META.items():
        config = configs.get(key)
        response.append(
            DataSourceConfigResponse(
                source_key=key,
                title=meta["title"],
                description=meta["description"],
                category=meta["category"],
                enabled=config.enabled if config else False,
                sync_interval_minutes=config.sync_interval_minutes
                if config
                else meta["default_interval"],
                last_synced_at=config.last_synced_at if config else None,
            )
        )
    return response


@router.put("/data-sources/{source_key}", response_model=DataSourceConfigResponse)
async def update_data_source(
    source_key: str,
    body: DataSourceConfigUpdate,
    session: AsyncSession = Depends(get_session),
):
    if source_key not in DATA_SOURCE_META:
        raise HTTPException(status_code=404, detail="Источник не найден")

    await ensure_data_sources(session)
    result = await session.execute(
        select(DataSourceConfig).where(DataSourceConfig.source_key == source_key)
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="Конфигурация не найдена")

    config.enabled = body.enabled
    config.sync_interval_minutes = body.sync_interval_minutes
    await session.commit()
    await session.refresh(config)

    meta = DATA_SOURCE_META[source_key]
    return DataSourceConfigResponse(
        source_key=source_key,
        title=meta["title"],
        description=meta["description"],
        category=meta["category"],
        enabled=config.enabled,
        sync_interval_minutes=config.sync_interval_minutes,
        last_synced_at=config.last_synced_at,
    )


@router.post("/sync", response_model=list[SyncResult])
async def sync_data(
    body: SyncRequest | None = None,
    session: AsyncSession = Depends(get_session),
):
    keys = body.source_keys if body else None
    results = await sync_enabled_sources(session, keys)
    return [
        SyncResult(
            source_key=key,
            success=success,
            message=message,
            records_count=count,
        )
        for key, success, message, count in results
    ]


@router.get("/dashboard", response_model=DashboardData)
async def get_dashboard(session: AsyncSession = Depends(get_session)):
    return await build_dashboard_from_cache(session)
