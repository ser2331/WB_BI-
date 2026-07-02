import random
from datetime import date, datetime, timedelta

SELLER_NAME = "Демо Магазин WB BI"

PRODUCTS = [
    {
        "nmId": 184729301,
        "supplierArticle": "DRESS-ROSE-01",
        "brand": "StyleLab",
        "title": "Платье летнее розовое",
        "base_price": 2890,
    },
    {
        "nmId": 184729302,
        "supplierArticle": "JEANS-SLIM-42",
        "brand": "DenimPro",
        "title": "Джинсы slim fit",
        "base_price": 3490,
    },
    {
        "nmId": 184729303,
        "supplierArticle": "HOODIE-BLK-M",
        "brand": "UrbanWear",
        "title": "Худи оверсайз чёрное",
        "base_price": 2190,
    },
    {
        "nmId": 184729304,
        "supplierArticle": "SNEAKER-WHT-40",
        "brand": "StepUp",
        "title": "Кроссовки белые",
        "base_price": 4990,
    },
    {
        "nmId": 184729305,
        "supplierArticle": "BAG-LEATHER-TAN",
        "brand": "CraftLine",
        "title": "Сумка кожаная",
        "base_price": 4290,
    },
]

WAREHOUSES = [
    "Коледино",
    "Подольск",
    "Казань",
    "Краснодар",
    "Екатеринбург",
]

_rng = random.Random(42)


def _day_offset(days_ago: int) -> datetime:
    base = datetime.utcnow().replace(hour=12, minute=0, second=0, microsecond=0)
    return base - timedelta(days=days_ago)


def generate_sales(days: int = 30) -> list[dict]:
    records: list[dict] = []
    for days_ago in range(days, 0, -1):
        dt = _day_offset(days_ago)
        daily_orders = _rng.randint(8, 28)
        for _ in range(daily_orders):
            product = _rng.choice(PRODUCTS)
            discount = _rng.uniform(0.85, 1.0)
            price = round(product["base_price"] * discount, 2)
            records.append(
                {
                    "date": dt.isoformat(),
                    "lastChangeDate": dt.isoformat(),
                    "nmId": product["nmId"],
                    "supplierArticle": product["supplierArticle"],
                    "brand": product["brand"],
                    "finishedPrice": price,
                    "priceWithDisc": price,
                    "saleID": f"S{product['nmId']}{days_ago}{_rng.randint(100, 999)}",
                }
            )
    return records


def generate_orders(days: int = 30) -> list[dict]:
    records: list[dict] = []
    for days_ago in range(days, 0, -1):
        dt = _day_offset(days_ago)
        daily = _rng.randint(12, 35)
        for _ in range(daily):
            product = _rng.choice(PRODUCTS)
            records.append(
                {
                    "date": dt.isoformat(),
                    "lastChangeDate": dt.isoformat(),
                    "nmId": product["nmId"],
                    "supplierArticle": product["supplierArticle"],
                    "brand": product["brand"],
                    "orderId": _rng.randint(10_000_000, 99_999_999),
                    "isCancel": _rng.random() < 0.08,
                }
            )
    return records


def generate_stocks() -> list[dict]:
    records: list[dict] = []
    for product in PRODUCTS:
        for warehouse in _rng.sample(WAREHOUSES, k=_rng.randint(2, 4)):
            records.append(
                {
                    "nmId": product["nmId"],
                    "supplierArticle": product["supplierArticle"],
                    "warehouseName": warehouse,
                    "quantity": _rng.randint(15, 320),
                    "quantityFull": _rng.randint(20, 400),
                    "lastChangeDate": datetime.utcnow().isoformat(),
                }
            )
    return records


def generate_sales_funnel(_date_from: date, _date_to: date) -> list[dict]:
    records: list[dict] = []
    for product in PRODUCTS:
        opens = _rng.randint(800, 4500)
        cart = int(opens * _rng.uniform(0.12, 0.22))
        orders = int(cart * _rng.uniform(0.35, 0.55))
        buyouts = int(orders * _rng.uniform(0.78, 0.92))
        records.append(
            {
                "product": {
                    "nmId": product["nmId"],
                    "title": product["title"],
                    "vendorCode": product["supplierArticle"],
                    "brandName": product["brand"],
                },
                "statistic": {
                    "selected": {
                        "openCount": opens,
                        "cartCount": cart,
                        "orderCount": orders,
                        "buyoutCount": buyouts,
                        "orderSum": orders * product["base_price"],
                        "buyoutSum": buyouts * product["base_price"],
                    }
                },
            }
        )
    return records


def generate_region_sales() -> list[dict]:
    regions = [
        ("Москва", "Центральный федеральный округ"),
        ("Санкт-Петербург", "Северо-Западный федеральный округ"),
        ("Казань", "Приволжский федеральный округ"),
        ("Краснодар", "Южный федеральный округ"),
        ("Новосибирск", "Сибирский федеральный округ"),
    ]
    records: list[dict] = []
    for city, fo in regions:
        for product in _rng.sample(PRODUCTS, k=3):
            records.append(
                {
                    "cityName": city,
                    "foName": fo,
                    "nmID": product["nmId"],
                    "sa": product["supplierArticle"],
                    "saleInvoiceCostPrice": round(_rng.uniform(15_000, 85_000), 2),
                    "saleItemInvoiceQty": _rng.randint(20, 120),
                }
            )
    return records


def get_seller_info() -> dict:
    return {
        "name": SELLER_NAME,
        "tradeMark": SELLER_NAME,
        "sid": "mock-seller-uuid",
    }
