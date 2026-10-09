from collections import Counter
from datetime import UTC, date, datetime, timedelta
from zoneinfo import ZoneInfo

from app.models.contact_message import ContactStatus, ContactTopic
from app.models.order import DeliveryMethod, OrderStatus
from app.models.product import ProductCategory
from app.repositories.dashboard import DashboardRepository
from app.schemas.dashboard import (
    DashboardStats,
    DayCount,
    ProductCounts,
    RecentMessage,
    RecentOrder,
    TopProduct,
    Totals,
)

# Days are counted in Kosovo's time zone.
LOCAL = ZoneInfo("Europe/Belgrade")
PERIODS = (7, 30, 90)
RECENT = 6
TOP_PRODUCTS = 6


def _aware(value: datetime) -> datetime:
    # SQLite (tests) returns naive datetimes; stored values are UTC.
    return value if value.tzinfo else value.replace(tzinfo=UTC)


def _local_day(value: datetime) -> date:
    return _aware(value).astimezone(LOCAL).date()


class DashboardService:
    def __init__(self, repository: DashboardRepository) -> None:
        self._repository = repository

    def stats(self, days: int, now: datetime | None = None) -> DashboardStats:
        now = now or datetime.now(UTC)
        today = now.astimezone(LOCAL).date()
        first_day = today - timedelta(days=days - 1)
        # The period and the one before it, both whole local days.
        start = datetime.combine(first_day, datetime.min.time(), LOCAL)
        previous_start = start - timedelta(days=days)
        days_in_period = [first_day + timedelta(days=i) for i in range(days)]

        orders = self._repository.orders_since(previous_start)
        messages = self._repository.messages_since(previous_start)
        current_orders = [o for o in orders if _aware(o.created_at) >= start]
        current_messages = [m for m in messages if _aware(m.created_at) >= start]

        def totals(rows: list, current: list, new_status: str, all_time: int) -> Totals:
            per_day = Counter(_local_day(row.created_at) for row in current)
            return Totals(
                total=len(current),
                previous_total=len(rows) - len(current),
                new_count=sum(1 for row in current if row.status == new_status),
                all_time=all_time,
                series=[DayCount(date=day, count=per_day.get(day, 0)) for day in days_in_period],
            )

        products: dict[str, dict] = {}
        for order in current_orders:
            for item in order.items:
                entry = products.setdefault(
                    item.product_slug,
                    {
                        "slug": item.product_slug,
                        "name": item.product_name,
                        "quantity": 0,
                        "orders": set(),
                    },
                )
                entry["quantity"] += item.quantity
                entry["orders"].add(order.id)
        top = sorted(products.values(), key=lambda entry: entry["quantity"], reverse=True)[
            :TOP_PRODUCTS
        ]

        catalogue = self._repository.products()
        return DashboardStats(
            period_days=days,
            generated_at=now,
            orders=totals(orders, current_orders, OrderStatus.NEW, self._repository.count_orders()),
            messages=totals(
                messages, current_messages, ContactStatus.NEW, self._repository.count_messages()
            ),
            orders_by_status={
                status.value: sum(1 for o in current_orders if o.status == status)
                for status in OrderStatus
            },
            orders_by_delivery={
                method.value: sum(1 for o in current_orders if o.delivery_method == method)
                for method in DeliveryMethod
            },
            messages_by_topic={
                topic.value: sum(1 for m in current_messages if m.topic == topic)
                for topic in ContactTopic
            },
            top_products=[
                TopProduct(
                    slug=entry["slug"],
                    name=entry["name"],
                    quantity=entry["quantity"],
                    orders=len(entry["orders"]),
                )
                for entry in top
            ],
            products=ProductCounts(
                total=len(catalogue),
                published=sum(1 for p in catalogue if p.is_published),
                by_category={
                    category.value: sum(1 for p in catalogue if p.category == category)
                    for category in ProductCategory
                },
            ),
            recent_orders=[
                RecentOrder(
                    reference=o.reference,
                    customer_name=o.customer_name,
                    city=o.city,
                    delivery_method=o.delivery_method,
                    status=o.status,
                    created_at=_aware(o.created_at),
                    items=len(o.items),
                    quantity=sum(item.quantity for item in o.items),
                )
                for o in self._repository.recent_orders(RECENT)
            ],
            recent_messages=[
                RecentMessage(
                    reference=m.reference,
                    name=m.name,
                    topic=m.topic,
                    message=m.message[:160],
                    status=m.status,
                    created_at=_aware(m.created_at),
                )
                for m in self._repository.recent_messages(RECENT)
            ],
        )
