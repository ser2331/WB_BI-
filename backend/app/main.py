import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.api.routes import router
from app.config import settings
from app.database import init_db
from app.models.database import WBAccount
from app.services.data_sync import ensure_data_sources
from app.services.mock.token import is_mock_token
from app.services.mock_seed import seed_mock_analytics
from app.database import async_session

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
    logger.info("WB BI backend started (mock_wb=%s)", settings.mock_wb)
    yield


app = FastAPI(
    title="WB BI",
    description="Business Intelligence для продавцов Wildberries",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
async def root():
    return {
        "service": "WB BI API",
        "health": "/api/health",
        "docs": "/docs",
    }
