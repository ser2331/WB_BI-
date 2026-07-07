from datetime import datetime
from enum import StrEnum

from sqlalchemy import JSON, Boolean, DateTime, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class DataSourceKey(StrEnum):
    SALES = "sales"
    ORDERS = "orders"
    STOCKS = "stocks"
    SALES_FUNNEL = "sales_funnel"
    REGION_SALES = "region_sales"


class WBAccount(Base):
    __tablename__ = "wb_accounts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    api_token: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class DataSourceConfig(Base):
    __tablename__ = "data_source_configs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    source_key: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    sync_interval_minutes: Mapped[int] = mapped_column(default=60)
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    settings: Mapped[dict | None] = mapped_column(JSON, nullable=True)


class CachedData(Base):
    __tablename__ = "cached_data"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    source_key: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    data: Mapped[dict] = mapped_column(JSON, nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
