import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import DataSourceConfig, WBAccount
from app.schemas.api import DATA_SOURCE_META
from app.services.data_sync import ensure_data_sources, sync_source
from app.services.mock.token import create_mock_jwt, is_mock_token
from app.services.wb_factory import create_wb_client

logger = logging.getLogger(__name__)

MOCK_SELLER_NAME = "Демо Магазин WB BI"


async def connect_mock_account(session: AsyncSession) -> tuple[str, str]:
    """Создаёт mock JWT, сохраняет аккаунт, включает все источники."""
    token = create_mock_jwt(MOCK_SELLER_NAME)

    existing = await session.execute(select(WBAccount))
    for acc in existing.scalars().all():
        acc.is_active = False

    session.add(WBAccount(api_token=token, is_active=True))
    await ensure_data_sources(session)

    result = await session.execute(select(DataSourceConfig))
    for config in result.scalars().all():
        config.enabled = True

    await session.commit()
    return token, MOCK_SELLER_NAME


async def seed_mock_analytics(session: AsyncSession) -> int:
    """Синхронизирует все источники через MockWBClient."""
    token_result = await session.execute(
        select(WBAccount)
        .where(WBAccount.is_active == True)  # noqa: E712
        .order_by(WBAccount.updated_at.desc())
        .limit(1)
    )
    account = token_result.scalar_one_or_none()
    if not account or not is_mock_token(account.api_token):
        token, _ = await connect_mock_account(session)
    else:
        token = account.api_token

    client = create_wb_client(token)
    total = 0

    for key in DATA_SOURCE_META:
        success, _, count = await sync_source(session, client, key)
        if success:
            total += count

    logger.info("Mock analytics seeded: %d records", total)
    return total
