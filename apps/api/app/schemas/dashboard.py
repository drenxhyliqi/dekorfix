from datetime import date, datetime

from pydantic import BaseModel


class DayCount(BaseModel):
    date: date
    count: int


class Totals(BaseModel):
    """A count for the period, the period before it, and the series by day."""

    total: int
    previous_total: int
    new_count: int
    all_time: int
    series: list[DayCount]


class TopProduct(BaseModel):
    slug: str
    name: str
    quantity: int
    orders: int


class RecentOrder(BaseModel):
    reference: str
    customer_name: str
    city: str | None
    delivery_method: str
    status: str
    created_at: datetime
    items: int
    quantity: int


class RecentMessage(BaseModel):
    reference: str
    name: str
    topic: str
    message: str
    status: str
    created_at: datetime


class ProductCounts(BaseModel):
    total: int
    published: int
    by_category: dict[str, int]


class DashboardStats(BaseModel):
    period_days: int
    generated_at: datetime
    orders: Totals
    messages: Totals
    orders_by_status: dict[str, int]
    orders_by_delivery: dict[str, int]
    messages_by_topic: dict[str, int]
    top_products: list[TopProduct]
    products: ProductCounts
    recent_orders: list[RecentOrder]
    recent_messages: list[RecentMessage]
