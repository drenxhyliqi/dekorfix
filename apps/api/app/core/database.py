"""SQLAlchemy engine and session factory."""

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

# The engine connects lazily, so importing this module never touches the database.
engine = create_engine(
    settings.sqlalchemy_database_url,
    echo=settings.database_echo,
    pool_pre_ping=True,
    connect_args={"connect_timeout": 5},
)

SessionLocal = sessionmaker[Session](bind=engine, autoflush=False, expire_on_commit=False)
