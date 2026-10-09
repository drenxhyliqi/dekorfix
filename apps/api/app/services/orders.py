import secrets

from app.models.order import DeliveryMethod, Order, OrderItem
from app.repositories.orders import OrderRepository
from app.schemas.order import OrderCreate, OrderCreated

# No 0/O or 1/I, so a reference read out over the phone is unambiguous.
REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"


def _blank_to_none(value: str | None) -> str | None:
    return value or None


class OrderService:
    def __init__(self, repository: OrderRepository) -> None:
        self._repository = repository

    def _new_reference(self) -> str:
        while True:
            reference = "DF-" + "".join(secrets.choice(REFERENCE_ALPHABET) for _ in range(6))
            if not self._repository.reference_exists(reference):
                return reference

    def place(self, data: OrderCreate) -> OrderCreated:
        pickup = data.delivery_method is DeliveryMethod.PICKUP
        order = Order(
            reference=self._new_reference(),
            locale=data.locale,
            customer_name=data.customer_name,
            phone=data.phone,
            email=data.email,
            company=_blank_to_none(data.company),
            business_number=_blank_to_none(data.business_number),
            delivery_method=data.delivery_method,
            city=None if pickup else data.city,
            address=None if pickup else data.address,
            notes=_blank_to_none(data.notes),
            items=[
                OrderItem(
                    product_slug=item.product_slug,
                    product_name=item.product_name,
                    pack_kg=item.pack_kg,
                    quantity=item.quantity,
                )
                for item in data.items
            ],
        )
        order = self._repository.add(order)
        return OrderCreated(reference=order.reference, created_at=order.created_at)
