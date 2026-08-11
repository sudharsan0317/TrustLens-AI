"""
Scan Model
SQLAlchemy ORM model for the scans table.
"""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text

from backend.db.base_class import Base


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    scan_type = Column(String, nullable=False)   # "url" | "email" | "message"
    input_data = Column(Text, nullable=False)
    trust_score = Column(Float, nullable=False)
    threat_label = Column(String, nullable=False)  # e.g. "SAFE", "SUSPICIOUS", "PHISHING"
    details = Column(Text, nullable=True)          # JSON string with extra info
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
