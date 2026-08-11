# File: backend/db/models.py

from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from backend.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    input_data = Column(Text, nullable=False)
    scan_type = Column(String, nullable=False)  # url, email, message
    trust_score = Column(Float, nullable=False)
    threat_label = Column(String, nullable=False)  # SAFE, SUSPICIOUS, MALICIOUS
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)