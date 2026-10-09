from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings

PRODUCT = {
    "slug": "test-adhesive",
    "name": "Test Adhesive",
    "category": "adhesives",
    "unit": "pack",
    "summary_sq": "Ngjitës prove",
    "summary_en": "A test adhesive",
    "pack_sizes_kg": [25, 5, 25],
    "coverage_min_m2_per_kg": "2",
    "coverage_max_m2_per_kg": "4",
    "is_published": False,
}
# The smallest valid WebP header is enough for the type check.
WEBP = b"RIFF\x24\x00\x00\x00WEBPVP8 " + b"\x00" * 24


def create(client: TestClient, headers: dict[str, str], **change) -> dict:
    response = client.post("/api/v1/admin/products", json={**PRODUCT, **change}, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


def test_admin_endpoints_need_a_session(db_client: TestClient) -> None:
    assert db_client.get("/api/v1/admin/products").status_code == 401
    assert db_client.post("/api/v1/admin/products", json=PRODUCT).status_code == 401


def test_create_update_publish_delete(db_client: TestClient, admin_headers: dict[str, str]) -> None:
    product = create(db_client, admin_headers)
    assert product["pack_sizes_kg"] == [5, 25]  # sorted, duplicates removed
    assert db_client.get("/api/v1/products").json() == []  # not published yet
    assert db_client.get("/api/v1/products/test-adhesive").status_code == 404

    url = f"/api/v1/admin/products/{product['id']}"
    published = db_client.patch(
        f"{url}/publish", json={"is_published": True}, headers=admin_headers
    )
    assert published.json()["is_published"] is True
    public = db_client.get("/api/v1/products").json()
    assert [p["slug"] for p in public] == ["test-adhesive"]
    assert "id" not in public[0] and "is_published" not in public[0]

    updated = db_client.put(
        url, json={**PRODUCT, "name": "Renamed", "is_published": True}, headers=admin_headers
    )
    assert updated.json()["name"] == "Renamed"
    assert db_client.get("/api/v1/products/test-adhesive").json()["name"] == "Renamed"

    assert db_client.delete(url, headers=admin_headers).status_code == 204
    assert db_client.get(url, headers=admin_headers).status_code == 404


def test_slugs_are_unique(db_client: TestClient, admin_headers: dict[str, str]) -> None:
    first = create(db_client, admin_headers)
    create(db_client, admin_headers, slug="other")
    clash = db_client.post("/api/v1/admin/products", json=PRODUCT, headers=admin_headers)
    assert clash.status_code == 409
    renamed = db_client.put(
        f"/api/v1/admin/products/{first['id']}",
        json={**PRODUCT, "slug": "other"},
        headers=admin_headers,
    )
    assert renamed.status_code == 409


@pytest.mark.parametrize(
    "change",
    [
        {"slug": "Not A Slug"},
        {"category": "tools"},
        {"name": ""},
        {"coverage_min_m2_per_kg": "5", "coverage_max_m2_per_kg": "4"},
        {"coverage_max_m2_per_kg": None},
        {"unit": "roll"},  # rolls have no pack sizes in kg
        {"image": "https://example.com/x.png"},
        {"pack_sizes_kg": [0]},
    ],
)
def test_invalid_products_are_rejected(
    db_client: TestClient, admin_headers: dict[str, str], change: dict
) -> None:
    response = db_client.post(
        "/api/v1/admin/products", json={**PRODUCT, **change}, headers=admin_headers
    )
    assert response.status_code == 422


def test_image_upload(db_client: TestClient, admin_headers: dict[str, str], tmp_path: Path) -> None:
    settings = get_settings()
    original = settings.media_root
    settings.media_root = tmp_path
    try:
        url = "/api/v1/admin/uploads/product-image"
        response = db_client.put(url, content=WEBP, headers=admin_headers)
        assert response.status_code == 201
        path = response.json()["url"]
        assert path.startswith("/media/products/") and path.endswith(".webp")
        assert (tmp_path / path.removeprefix("/media/")).read_bytes() == WEBP

        not_an_image = db_client.put(url, content=b"<svg onload=alert(1)>", headers=admin_headers)
        assert not_an_image.status_code == 415
    finally:
        settings.media_root = original
