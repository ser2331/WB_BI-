import asyncio
import logging
from datetime import date, datetime, timedelta
from typing import Any

import httpx

logger = logging.getLogger(__name__)

STATISTICS_API = "https://statistics-api.wildberries.ru"
ANALYTICS_API = "https://seller-analytics-api.wildberries.ru"
COMMON_API = "https://common-api.wildberries.ru"


class WBAPIError(Exception):
    def __init__(self, message: str, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


class WBClient:
    """Клиент Wildberries API с учётом rate limits."""

    def __init__(self, api_token: str):
        self.api_token = api_token
        self._headers = {"Authorization": api_token}
        self._last_request: dict[str, datetime] = {}
        self._min_intervals = {
            "statistics": 60.0,
            "analytics": 20.0,
            "common": 1.0,
        }

    async def _throttle(self, category: str) -> None:
        min_interval = self._min_intervals.get(category, 1.0)
        last = self._last_request.get(category)
        if last:
            elapsed = (datetime.utcnow() - last).total_seconds()
            if elapsed < min_interval:
                await asyncio.sleep(min_interval - elapsed)
        self._last_request[category] = datetime.utcnow()

    async def _request(
        self,
        method: str,
        base_url: str,
        path: str,
        *,
        category: str = "common",
        params: dict | None = None,
        json_body: dict | None = None,
    ) -> Any:
        await self._throttle(category)
        url = f"{base_url}{path}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method,
                url,
                headers=self._headers,
                params=params,
                json=json_body,
            )

        if response.status_code == 401:
            raise WBAPIError("Неверный API-токен", 401)
        if response.status_code == 429:
            raise WBAPIError("Превышен лимит запросов WB API", 429)
        if response.status_code >= 400:
            raise WBAPIError(
                f"WB API ошибка: {response.status_code} — {response.text[:200]}",
                response.status_code,
            )

        if response.status_code == 204 or not response.content:
            return []
        return response.json()

    async def ping(self) -> bool:
        try:
            await self._request("GET", COMMON_API, "/ping", category="common")
            return True
        except WBAPIError:
            return False

    async def get_seller_info(self) -> dict:
        return await self._request(
            "GET", COMMON_API, "/api/v1/seller-info", category="common"
        )

    async def get_sales(self, date_from: datetime) -> list[dict]:
        return await self._request(
            "GET",
            STATISTICS_API,
            "/api/v1/supplier/sales",
            category="statistics",
            params={"dateFrom": date_from.strftime("%Y-%m-%dT%H:%M:%S")},
        )

    async def get_orders(self, date_from: datetime) -> list[dict]:
        return await self._request(
            "GET",
            STATISTICS_API,
            "/api/v1/supplier/orders",
            category="statistics",
            params={"dateFrom": date_from.strftime("%Y-%m-%dT%H:%M:%S")},
        )

    async def get_stocks(self, date_from: datetime) -> list[dict]:
        return await self._request(
            "GET",
            STATISTICS_API,
            "/api/v1/supplier/stocks",
            category="statistics",
            params={"dateFrom": date_from.strftime("%Y-%m-%dT%H:%M:%S")},
        )

    async def get_sales_funnel(
        self, date_from: date, date_to: date
    ) -> list[dict]:
        body = {
            "selectedPeriod": {
                "start": date_from.isoformat(),
                "end": date_to.isoformat(),
            },
            "nmIds": [],
            "brandNames": [],
            "subjectIds": [],
            "tagIds": [],
            "skipDeletedNm": True,
            "limit": 100,
            "offset": 0,
        }
        result = await self._request(
            "POST",
            ANALYTICS_API,
            "/api/analytics/v3/sales-funnel/products",
            category="analytics",
            json_body=body,
        )
        if isinstance(result, dict):
            return result.get("data", {}).get("products", result.get("products", []))
        return result if isinstance(result, list) else []

    async def get_region_sales(self) -> list[dict]:
        return await self._request(
            "GET",
            ANALYTICS_API,
            "/api/v1/analytics/region-sale",
            category="analytics",
        )
