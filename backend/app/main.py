import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth_routes import router as auth_router
from app.api.dashboard_routes import router as dashboard_router
from app.api.health_routes import router as health_router
from app.api.import_routes import router as import_router
from app.config import settings
from app.services.dataset_memory import load_from_disk

logging.basicConfig(level=logging.INFO if settings.debug else logging.WARNING)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if load_from_disk():
        logger.info("Imported dataset restored from disk")
    logger.info(
        "Auth users: admin=%s, user=%s",
        settings.admin_username,
        settings.user_username,
    )
    logger.info("WB BI backend started")
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

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(import_router)
app.include_router(dashboard_router)


@app.get("/")
async def root():
    return {
        "service": "WB BI API",
        "health": "/api/health",
        "docs": "/docs",
    }
