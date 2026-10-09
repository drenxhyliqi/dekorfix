from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product


class ProductRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def all(self, published_only: bool = False) -> list[Product]:
        query = select(Product).order_by(Product.position, Product.name)
        if published_only:
            query = query.where(Product.is_published.is_(True))
        return list(self._session.scalars(query))

    def by_id(self, product_id: int) -> Product | None:
        return self._session.get(Product, product_id)

    def by_slug(self, slug: str) -> Product | None:
        return self._session.scalar(select(Product).where(Product.slug == slug))

    def save(self, product: Product) -> Product:
        self._session.add(product)
        self._session.commit()
        self._session.refresh(product)
        return product

    def delete(self, product: Product) -> None:
        self._session.delete(product)
        self._session.commit()
