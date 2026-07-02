from datetime import date, datetime

from app.services.mock import data


class MockWBClient:
    """Имитация WB API — без сетевых запросов."""

    def __init__(self, api_token: str):
        self.api_token = api_token

    async def ping(self) -> bool:
        return True

    async def get_seller_info(self) -> dict:
        return data.get_seller_info()

    async def get_sales(self, date_from: datetime) -> list[dict]:
        return data.generate_sales()

    async def get_orders(self, date_from: datetime) -> list[dict]:
        return data.generate_orders()

    async def get_stocks(self, date_from: datetime) -> list[dict]:
        return data.generate_stocks()

    async def get_sales_funnel(self, date_from: date, date_to: date) -> list[dict]:
        return data.generate_sales_funnel(date_from, date_to)

    async def get_region_sales(self) -> list[dict]:
        return data.generate_region_sales()
