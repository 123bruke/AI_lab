"""
Unified Database Module forwarding to backend.app.database.connection.
"""

from backend.app.database.connection import (
    engine,
    SessionLocal,
    Base,
    get_db,
    SQLALCHEMY_DATABASE_URL
)

__all__ = ["engine", "SessionLocal", "Base", "get_db", "SQLALCHEMY_DATABASE_URL"]
