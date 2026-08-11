"""
User Model
SQLAlchemy ORM model for the users table.
"""
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from backend.db.base_class import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    reset_token = Column(String, nullable=True)
    push_subscription = Column(String, nullable=True)
    
    # 2FA fields
    totp_secret = Column(String, nullable=True)
    is_two_fa_enabled = Column(Boolean, default=False)
    
    # Advanced Security
    strict_ip_binding = Column(Boolean, default=False)
    login_alerts_enabled = Column(Boolean, default=True)
    
    # API & Webhooks
    api_key = Column(String, nullable=True, unique=True, index=True)
    webhook_url = Column(String, nullable=True)
    
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    
    # Profile fields
    dob = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    website = Column(String, nullable=True)
    country = Column(String, nullable=True)
    city = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
