"""
Unified Database Module forwarding to database connection.
"""

try:
    from backend.app.database.connection import (
        engine,
        SessionLocal,
        Base,
        get_db,
        SQLALCHEMY_DATABASE_URL
    )
except ImportError:
    from app.database.connection import (
        engine,
        SessionLocal,
        Base,
        get_db,
        SQLALCHEMY_DATABASE_URL
    )

__all__ = ["engine", "SessionLocal", "Base", "get_db", "SQLALCHEMY_DATABASE_URL"]
