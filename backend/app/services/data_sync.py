import logging
from datetime import datetime, timedelta

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import CachedData, DataSourceConfig, WBAccount
from app.schemas.api import DATA_SOURCE_META, DataSourceKey
from app.services.wb_client import WBAPIError
from app.services.wb_factory import create_wb_client

logger = logging.getLogger(__name__)


async def get_active_token(session: AsyncSession) -> str | None:
    result = await session.execute(
        select(WBAccount)
        .where(WBAccount.is_active == True)  # noqa: E712
        .order_by(WBAccount.updated_at.desc())
        .limit(1)
    )
    account = result.scalar_one_or_none()
    return account.api_token if account else None


async def ensure_data_sources(session: AsyncSession) -> None:
    for key, meta in DATA_SOURCE_META.items():
        existing = await session.execute(
            select(DataSourceConfig).where(DataSourceConfig.source_key == key)
        )
        if existing.scalar_one_or_none() is None:
            session.add(
                DataSourceConfig(
                    source_key=key,
                    enabled=False,
                    sync_interval_minutes=meta["default_interval"],
                )
            )
    await session.commit()


async def save_cached_data(
    session: AsyncSession, source_key: str, data: dict
) -> None:
    await session.execute(
        delete(CachedData).where(CachedData.source_key == source_key)
    )
    session.add(
        CachedData(
            source_key=source_key,
            data=data,
            fetched_at=datetime.utcnow(),
        )
    )


async def sync_source(
    session: AsyncSession, client, source_key: str
) -> tuple[bool, str, int]:
    date_from = datetime.utcnow() - timedelta(days=30)

    try:
        if source_key == DataSourceKey.SALES:
            records = await client.get_sales(date_from)
            payload = {"records": records}
        elif source_key == DataSourceKey.ORDERS:
            records = await client.get_orders(date_from)
            payload = {"records": records}
        elif source_key == DataSourceKey.STOCKS:
            records = await client.get_stocks(date_from)
            payload = {"records": records}
        elif source_key == DataSourceKey.SALES_FUNNEL:
            today = datetime.utcnow().date()
            week_ago = today - timedelta(days=7)
            records = await client.get_sales_funnel(week_ago, today)
            payload = {"records": records}
        elif source_key == DataSourceKey.REGION_SALES:
            records = await client.get_region_sales()
            payload = {"records": records}
        else:
            return False, f"Неизвестный источник: {source_key}", 0

        await save_cached_data(session, source_key, payload)

        config_result = await session.execute(
            select(DataSourceConfig).where(DataSourceConfig.source_key == source_key)
        )
        config = config_result.scalar_one_or_none()
        if config:
            config.last_synced_at = datetime.utcnow()

        await session.commit()
        count = len(records) if isinstance(records, list) else 0
        return True, "OK", count

    except WBAPIError as e:
        logger.error("WB sync error for %s: %s", source_key, e)
        return False, str(e), 0
    except Exception as e:
        logger.exception("Unexpected sync error for %s", source_key)
        return False, str(e), 0


async def sync_enabled_sources(
    session: AsyncSession, source_keys: list[str] | None = None
) -> list[tuple[str, bool, str, int]]:
    token = await get_active_token(session)
    if not token:
        return [("all", False, "WB аккаунт не подключён", 0)]

    client = create_wb_client(token)
    results: list[tuple[str, bool, str, int]] = []

    query = select(DataSourceConfig).where(DataSourceConfig.enabled == True)  # noqa: E712
    if source_keys:
        query = query.where(DataSourceConfig.source_key.in_(source_keys))

    configs = (await session.execute(query)).scalars().all()

    if not configs:
        return [("all", False, "Нет включённых источников данных", 0)]

    for config in configs:
        success, message, count = await sync_source(session, client, config.source_key)
        results.append((config.source_key, success, message, count))

    return results
