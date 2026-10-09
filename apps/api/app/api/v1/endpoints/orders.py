from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.core.dependencies import DbSession
from app.repositories.orders import OrderRepository
from app.schemas.order import OrderCreate, OrderCreated
from app.services.orders import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])


def get_order_service(db: DbSession) -> OrderService:
    return OrderService(OrderRepository(db))


@router.post("", response_model=OrderCreated, status_code=status.HTTP_201_CREATED)
def place_order(
    data: OrderCreate,
    service: Annotated[OrderService, Depends(get_order_service)],
) -> OrderCreated:
    """An order request from the website shop. Listing orders arrives with admin authentication."""
    return service.place(data)
