from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status

from app.api.v1.endpoints.auth import current_user
from app.api.v1.endpoints.products import ProductServiceDep
from app.core.dependencies import DbSession, SettingsDep
from app.models.product import Product
from app.repositories.dashboard import DashboardRepository
from app.schemas.dashboard import DashboardStats
from app.schemas.product import ProductIn, ProductOut, PublishIn, UploadOut
from app.services.dashboard import PERIODS, DashboardService
from app.services.products import (
    MAX_IMAGE_BYTES,
    InvalidImage,
    ProductNotFound,
    SlugTaken,
    store_image,
)

# Everything here needs a signed-in admin.
router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(current_user)])


def get_dashboard_service(db: DbSession) -> DashboardService:
    return DashboardService(DashboardRepository(db))


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(
    service: Annotated[DashboardService, Depends(get_dashboard_service)],
    days: Annotated[int, Query()] = 30,
) -> DashboardStats:
    """Orders and contact messages for the last `days` days (7, 30 or 90)."""
    if days not in PERIODS:
        raise HTTPException(422, "days must be 7, 30 or 90.")
    return service.stats(days)


# ---- Products ------------------------------------------------------------------------

NOT_FOUND = HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")
SLUG_TAKEN = HTTPException(status.HTTP_409_CONFLICT, "Another product already uses this slug.")


@router.get("/products", response_model=list[ProductOut])
def admin_products(service: ProductServiceDep) -> list[Product]:
    """Every product, published or not."""
    return service.list()


@router.get("/products/{product_id}", response_model=ProductOut)
def admin_product(product_id: int, service: ProductServiceDep) -> Product:
    try:
        return service.get(product_id)
    except ProductNotFound:
        raise NOT_FOUND from None


@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductIn, service: ProductServiceDep) -> Product:
    try:
        return service.create(data)
    except SlugTaken:
        raise SLUG_TAKEN from None


@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, data: ProductIn, service: ProductServiceDep) -> Product:
    try:
        return service.update(product_id, data)
    except ProductNotFound:
        raise NOT_FOUND from None
    except SlugTaken:
        raise SLUG_TAKEN from None


@router.patch("/products/{product_id}/publish", response_model=ProductOut)
def publish_product(product_id: int, data: PublishIn, service: ProductServiceDep) -> Product:
    try:
        return service.set_published(product_id, data.is_published)
    except ProductNotFound:
        raise NOT_FOUND from None


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, service: ProductServiceDep) -> Response:
    try:
        service.delete(product_id)
    except ProductNotFound:
        raise NOT_FOUND from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/uploads/product-image", response_model=UploadOut, status_code=status.HTTP_201_CREATED)
async def upload_product_image(request: Request, settings: SettingsDep) -> UploadOut:
    """The raw image bytes as the request body (PNG, JPEG or WebP, up to 5 MB)."""
    data = await request.body()
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status.HTTP_413_CONTENT_TOO_LARGE, "Images can be up to 5 MB.")
    try:
        return UploadOut(url=store_image(data, settings.media_root))
    except InvalidImage:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Use a PNG, JPEG or WebP image."
        ) from None
