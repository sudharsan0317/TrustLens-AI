"""
Database Base Imports
Import all models here so Alembic and create_all() can discover them.
"""
from backend.db.base_class import Base  # noqa: F401
from backend.models.user import User    # noqa: F401
from backend.models.scan import Scan   # noqa: F401
