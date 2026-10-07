"""ORM models.

Import every model module here so `Base.metadata` is complete when Alembic
runs autogenerate.
"""

from app.models.base import Base

__all__ = ["Base"]
