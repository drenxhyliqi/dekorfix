from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import DbSession
from app.models.product import Product
from app.repositories.products import ProductRepository
from app.schemas.product import PublicProduct
from app.services.products import ProductNotFound, ProductService

router = APIRouter(prefix="/products", tags=["products"])


def get_product_service(db: DbSession) -> ProductService:
    return ProductService(ProductRepository(db))


ProductServiceDep = Annotated[ProductService, Depends(get_product_service)]


@router.get("", response_model=list[PublicProduct])
def published_products(service: ProductServiceDep) -> list[Product]:
    """The catalogue as the website shows it: published products only, in display order."""
    return service.list(published_only=True)


@router.get("/{slug}", response_model=PublicProduct)
def published_product(slug: str, service: ProductServiceDep) -> Product:
    try:
        return service.get_published(slug)
    except ProductNotFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.") from None
