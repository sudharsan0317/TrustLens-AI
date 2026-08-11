# File: backend/schemas/schemas.py

from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ScanRequest(BaseModel):
    input_data: str
    scan_type: Optional[str] = "url"

class ScanResponse(BaseModel):
    id: int
    input_data: str
    scan_type: str
    trust_score: float
    threat_label: str
    details: Optional[dict] = None

    class Config:
        from_attributes = True