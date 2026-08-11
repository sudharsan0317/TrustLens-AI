"""
Scan Schemas
Pydantic models for scan request/response validation.
"""
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class ScanOptions(BaseModel):
    deepDns: bool = False
    darkWeb: bool = False
    bypassCache: bool = False

# --- Request Schemas ---

class URLScanRequest(BaseModel):
    url: str
    options: Optional[ScanOptions] = None


class EmailScanRequest(BaseModel):
    subject: Optional[str] = ""
    body: str
    options: Optional[ScanOptions] = None


class MessageScanRequest(BaseModel):
    message: str
    options: Optional[ScanOptions] = None


# --- Response Schemas ---

class ScanResponse(BaseModel):
    id: int
    scan_type: str
    input_data: str
    trust_score: float
    threat_label: str
    details: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = {"from_attributes": True}
