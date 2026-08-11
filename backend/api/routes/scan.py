# File: backend/api/routes/scan.py

import json
from typing import Optional

from fastapi import APIRouter, Depends, Header, BackgroundTasks
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.api.deps import get_db, get_current_user
from backend.core.config import settings
from backend.models.scan import Scan
from backend.models.user import User
from backend.schemas.scan import (
    URLScanRequest,
    EmailScanRequest,
    MessageScanRequest,
    ScanResponse,
)

from pydantic import BaseModel
from typing import List, Optional as OptionalField
import asyncio

class BulkScanRequest(BaseModel):
    items: List[str]

class FusionScanRequest(BaseModel):
    url: OptionalField[str] = None
    message: OptionalField[str] = None
    email: OptionalField[str] = None
from backend.services.analyzer import analyze_url, analyze_email, analyze_message, analyze_fusion
from backend.api.routes.ws import manager

router = APIRouter(prefix="/scan", tags=["Scan"])


def get_optional_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Helper: optionally extract current user if bearer token exists, else return None."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    
    if token.startswith("tl_live_"):
        return db.query(User).filter(User.api_key == token).first()
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return db.query(User).filter(User.id == int(user_id)).first()
    except (JWTError, ValueError):
        return None


def _save_scan(db: Session, scan_type: str, input_data: str, result: dict, user: Optional[User], background_tasks: BackgroundTasks = None) -> Scan:
    """Helper: persist a scan result to the database."""
    scan = Scan(
        user_id=user.id if user else None,
        scan_type=scan_type,
        input_data=input_data,
        trust_score=result["trust_score"],
        threat_label=result["threat_label"],
        details=json.dumps(result.get("details", {})),
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    if user and user.webhook_url and background_tasks and result.get("threat_label") in ["CRITICAL", "SUSPICIOUS"]:
        from backend.services.webhook import send_webhook_payload
        scan_data = _scan_to_response(scan)
        background_tasks.add_task(send_webhook_payload, user.webhook_url, scan_data)

    if result.get("trust_score", 100) < 60 and background_tasks:
        # Broadcast critical alert via WebSocket
        background_tasks.add_task(manager.broadcast, {
            "type": "CRITICAL_THREAT",
            "title": "Critical threat blocked",
            "message": f"Malicious payload intercepted for target: {input_data[:30]}...",
            "time": "Just now",
            "id": scan.id
        })

    return scan


def _scan_to_response(scan: Scan) -> dict:
    """Convert a Scan ORM object to a response dict."""
    details = {}
    if scan.details:
        try:
            details = json.loads(scan.details)
        except Exception:
            pass
    return {
        "id": scan.id,
        "scan_type": scan.scan_type,
        "input_data": scan.input_data,
        "trust_score": scan.trust_score,
        "threat_label": scan.threat_label,
        "details": details,
        # Append 'Z' so the frontend knows this is UTC and converts correctly
        "created_at": scan.created_at.isoformat() + "Z" if scan.created_at else None,
    }


@router.post("/url", response_model=ScanResponse)
def scan_url(
    payload: URLScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Analyze a URL for phishing or malicious content."""
    options_dict = payload.options.dict() if payload.options else {}
    result = analyze_url(payload.url, options=options_dict)
    scan = _save_scan(db, "url", payload.url, result, current_user, background_tasks)
    return _scan_to_response(scan)


@router.post("/email", response_model=ScanResponse)
def scan_email(
    payload: EmailScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Analyze an email for phishing indicators."""
    options_dict = payload.options.dict() if payload.options else {}
    result = analyze_email(payload.subject or "", payload.body, options=options_dict)
    input_data = payload.subject or payload.body[:80]
    scan = _save_scan(db, "email", input_data, result, current_user, background_tasks)
    return _scan_to_response(scan)


@router.post("/message", response_model=ScanResponse)
def scan_message(
    payload: MessageScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Analyze a message or SMS for scam/phishing content."""
    options_dict = payload.options.dict() if payload.options else {}
    result = analyze_message(payload.message, options=options_dict)
    scan = _save_scan(db, "message", payload.message[:80], result, current_user, background_tasks)
    return _scan_to_response(scan)


@router.get("/history", response_model=list[ScanResponse])
def get_history(
    limit: int = 1000,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the scan history for the authenticated user."""
    scans = (
        db.query(Scan)
        .filter(Scan.user_id == current_user.id)
        .order_by(Scan.created_at.desc())
        .limit(limit)
        .all()
    )
    return [_scan_to_response(s) for s in scans]

@router.post("/bulk")
def bulk_scan(
    payload: BulkScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Analyze multiple URLs or emails in bulk."""
    results = []
    for item in payload.items:
        item = item.strip()
        if not item: continue
        
        # better heuristic to detect url vs email vs message
        if item.startswith("http://") or item.startswith("https://") or ("." in item and " " not in item and "@" not in item):
            scan_type = "url"
            result = analyze_url(item, options={})
            input_data = item
        elif "@" in item and " " not in item:
            scan_type = "email"
            result = analyze_email("", item, options={})
            input_data = item[:80]
        else:
            scan_type = "message"
            result = analyze_message(item, options={})
            input_data = item[:80]
            
        scan = _save_scan(db, scan_type, input_data, result, current_user, background_tasks)
        results.append(_scan_to_response(scan))
        
    return {
        "scanned_count": len(results),
        "results": results
    }


@router.post("/fusion")
def scan_fusion(
    payload: FusionScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Run the ML Fusion model combining URL, message, and email signals into one verdict."""
    if not any([payload.url, payload.message, payload.email]):
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="At least one of url, message, or email must be provided.")

    result = analyze_fusion(
        url=payload.url,
        message=payload.message,
        email=payload.email,
    )

    # Pick the best label for DB storage
    primary_input = payload.url or payload.message or payload.email or "fusion"
    scan_type = "url" if payload.url else ("email" if payload.email else "message")

    scan = _save_scan(db, scan_type, primary_input[:120], result, current_user, background_tasks)
    response = _scan_to_response(scan)
    # Pass through fusion-specific fields not stored in DB
    response["risk_probability"] = result.get("risk_probability")
    response["details"] = result.get("details", {})
    return response