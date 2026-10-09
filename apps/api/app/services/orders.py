from app.models.order import DeliveryMethod, Order, OrderItem
from app.repositories.orders import OrderRepository
from app.schemas.order import OrderCreate, OrderCreated
from app.utils.references import new_reference


def _blank_to_none(value: str | None) -> str | None:
    return value or None


class OrderService:
    def __init__(self, repository: OrderRepository) -> None:
        self._repository = repository

    def place(self, data: OrderCreate) -> OrderCreated:
        pickup = data.delivery_method is DeliveryMethod.PICKUP
        order = Order(
            reference=new_reference("DF", self._repository.reference_exists),
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
