import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.api.dashboard_routes import router as dashboard_router
from app.api.import_routes import router as import_router
from app.api.routes import router as legacy_router
from app.config import settings
from app.database import async_session, init_db
from app.models.database import WBAccount
from app.services.data_sync import ensure_data_sources
from app.services.dataset_memory import load_from_disk
from app.services.mock.token import is_mock_token
from app.services.mock_seed import seed_mock_analytics

logging.basicConfig(level=logging.INFO if settings.debug else logging.WARNING)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    async with async_session() as session:
        await ensure_data_sources(session)
        if settings.mock_wb and settings.auto_seed_mock:
            result = await session.execute(
                select(WBAccount).where(WBAccount.is_active == True)  # noqa: E712
            )
            account = result.scalar_one_or_none()
            if account is None or is_mock_token(account.api_token):
                await seed_mock_analytics(session)
                logger.info("Mock JWT and analytics data seeded")
    if load_from_disk():
        logger.info("Imported dataset restored from disk")
    logger.info("WB BI backend started (mock_wb=%s)", settings.mock_wb)
    yield


app = FastAPI(
    title="WB BI",
    description="Импорт данных и дашборд склеек по предметам",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=settings.cors_origin_regex or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(import_router)
app.include_router(dashboard_router)
app.include_router(legacy_router)


@app.get("/")
async def root():
    return {
        "service": "WB BI API",
        "health": "/api/health",
        "docs": "/docs",
    }
