import secrets
from pathlib import Path

from app.models.product import Product
from app.repositories.products import ProductRepository
from app.schemas.product import ProductIn


class ProductNotFound(Exception):
    pass


class SlugTaken(Exception):
    pass


class InvalidImage(Exception):
    pass


# Accepted uploads, recognised by their first bytes rather than the name or header.
_SIGNATURES = {
    b"\x89PNG\r\n\x1a\n": "png",
    b"\xff\xd8\xff": "jpg",
}
MAX_IMAGE_BYTES = 5 * 1024 * 1024


def image_extension(data: bytes) -> str:
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    for signature, extension in _SIGNATURES.items():
        if data.startswith(signature):
            return extension
    raise InvalidImage


class ProductService:
    def __init__(self, repository: ProductRepository) -> None:
        self._repository = repository

    def list(self, published_only: bool = False) -> list[Product]:
        return self._repository.all(published_only)

    def get(self, product_id: int) -> Product:
        product = self._repository.by_id(product_id)
        if not product:
            raise ProductNotFound
        return product

    def get_published(self, slug: str) -> Product:
        product = self._repository.by_slug(slug)
        if not product or not product.is_published:
            raise ProductNotFound
        return product

    def create(self, data: ProductIn) -> Product:
        if self._repository.by_slug(data.slug):
            raise SlugTaken
        return self._repository.save(Product(**data.model_dump()))

    def update(self, product_id: int, data: ProductIn) -> Product:
        product = self.get(product_id)
        other = self._repository.by_slug(data.slug)
        if other and other.id != product.id:
            raise SlugTaken
        for field, value in data.model_dump().items():
            setattr(product, field, value)
        return self._repository.save(product)

    def set_published(self, product_id: int, published: bool) -> Product:
        product = self.get(product_id)
        product.is_published = published
        return self._repository.save(product)

    def delete(self, product_id: int) -> None:
        self._repository.delete(self.get(product_id))


def store_image(data: bytes, media_root: Path) -> str:
    """Saves an uploaded product image under a random name and returns its site path."""
    if not data or len(data) > MAX_IMAGE_BYTES:
        raise InvalidImage
    extension = image_extension(data)
    folder = media_root / "products"
    folder.mkdir(parents=True, exist_ok=True)
    name = f"{secrets.token_hex(12)}.{extension}"
    (folder / name).write_bytes(data)
    return f"/media/products/{name}"
