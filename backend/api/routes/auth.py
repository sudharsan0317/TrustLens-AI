# File: backend/api/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import secrets
import httpx
import pyotp
import qrcode
import io
import base64

from backend.api.deps import get_db, get_current_user
from backend.core.security import get_password_hash, verify_password, create_access_token
from backend.models.user import User
from backend.models.session import Session as DBSession
from user_agents import parse
from backend.services.email import send_verification_email, send_reset_password_email, send_unrecognized_login_alert

router = APIRouter(prefix="/auth", tags=["Auth"])

def _record_session(request: Request, db: Session, user_id: int, jti: str, background_tasks: BackgroundTasks = None):
    user_agent_str = request.headers.get("user-agent", "")
    user_agent = parse(user_agent_str)
    device = f"{user_agent.device.family}" if user_agent.device.family else "Unknown Device"
    os = f"{user_agent.os.family} {user_agent.os.version_string}".strip()
    browser = f"{user_agent.browser.family} {user_agent.browser.version_string}".strip()
    ip_address = request.client.host if request.client else "127.0.0.1"
    
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.login_alerts_enabled and background_tasks:
        existing = db.query(DBSession).filter(DBSession.user_id == user_id, DBSession.ip_address == ip_address).first()
        if not existing:
            background_tasks.add_task(send_unrecognized_login_alert, user.email, device, browser, ip_address)
    
    session_record = DBSession(
        user_id=user_id,
        token_jti=jti,
        device=device,
        os=os,
        browser=browser,
        ip_address=ip_address,
        location="Unknown"
    )
    db.add(session_record)
    db.commit()

@router.get("/sessions")
def get_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sessions = db.query(DBSession).filter(DBSession.user_id == current_user.id).order_by(DBSession.last_active.desc()).all()
    return sessions

@router.delete("/sessions/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(DBSession).filter(DBSession.id == session_id, DBSession.user_id == current_user.id).first()
    if session:
        db.delete(session)
        db.commit()
    return {"message": "Session revoked"}

@router.delete("/sessions")
def delete_all_other_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(DBSession).filter(DBSession.user_id == current_user.id).delete()
    db.commit()
    return {"message": "All sessions revoked"}



class SignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class OAuthRequest(BaseModel):
    token: str
    provider: str

class VerifyEmailRequest(BaseModel):
    token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    dob: str | None = None
    gender: str | None = None
    phone: str | None = None
    website: str | None = None
    country: str | None = None
    city: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    strict_ip_binding: bool | None = None
    login_alerts_enabled: bool | None = None
    webhook_url: str | None = None


@router.get("/me")
def get_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from backend.models.scan import Scan
    scan_count = db.query(Scan).filter(Scan.user_id == current_user.id).count()
    return {
        "id": current_user.id,
        "name": current_user.full_name,
        "email": current_user.email,
        "is_verified": current_user.is_verified,
        "is_two_fa_enabled": current_user.is_two_fa_enabled,
        "strict_ip_binding": current_user.strict_ip_binding,
        "login_alerts_enabled": current_user.login_alerts_enabled,
        "dob": current_user.dob,
        "gender": current_user.gender,
        "phone": current_user.phone,
        "website": current_user.website,
        "country": current_user.country,
        "city": current_user.city,
        "bio": current_user.bio,
        "avatar_url": current_user.avatar_url,
        "api_key": current_user.api_key,
        "webhook_url": current_user.webhook_url,
        "scan_count": scan_count
    }

@router.put("/me")
def update_me(payload: UpdateProfileRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    current_user.dob = payload.dob
    current_user.gender = payload.gender
    current_user.phone = payload.phone
    current_user.website = payload.website
    current_user.country = payload.country
    current_user.city = payload.city
    current_user.bio = payload.bio
    current_user.avatar_url = payload.avatar_url
    if payload.strict_ip_binding is not None:
        current_user.strict_ip_binding = payload.strict_ip_binding
    if payload.login_alerts_enabled is not None:
        current_user.login_alerts_enabled = payload.login_alerts_enabled
    if payload.webhook_url is not None:
        current_user.webhook_url = payload.webhook_url
    db.commit()
    db.refresh(current_user)
    return {
        "id": current_user.id,
        "name": current_user.full_name,
        "email": current_user.email,
        "is_verified": current_user.is_verified,
        "is_two_fa_enabled": current_user.is_two_fa_enabled,
        "dob": current_user.dob,
        "gender": current_user.gender,
        "phone": current_user.phone,
        "website": current_user.website,
        "country": current_user.country,
        "city": current_user.city,
        "bio": current_user.bio,
        "avatar_url": current_user.avatar_url,
        "api_key": current_user.api_key,
        "webhook_url": current_user.webhook_url
    }

@router.post("/api-key/regenerate")
def regenerate_api_key(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_key = "tl_live_" + secrets.token_hex(16)
    current_user.api_key = new_key
    db.commit()
    db.refresh(current_user)
    return {"api_key": new_key}

@router.delete("/me")
def delete_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted successfully."}

@router.post("/signup")
def signup(payload: SignupRequest, background_tasks: BackgroundTasks, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password before storing (bcrypt via passlib)
    hashed = get_password_hash(payload.password)
    ver_token = secrets.token_urlsafe(32)
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hashed,
        verification_token=ver_token,
        is_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Send real verification email in the background
    background_tasks.add_task(send_verification_email, user.email, ver_token)

    token, jti = create_access_token(data={"sub": str(user.id)})
    _record_session(request, db, user.id, jti, background_tasks=background_tasks if 'background_tasks' in locals() else None)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.full_name, "email": user.email, "is_verified": user.is_verified},
    }


@router.post("/login")
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    # Use bcrypt verify — NOT plain string comparison
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if user.is_two_fa_enabled:
        # Return a temporary token strictly for 2FA verification
        temp_token, jti = create_access_token(data={"sub": str(user.id), "type": "2fa_temp"})
        return {
            "requires_2fa": True,
            "temp_token": temp_token
        }

    token, jti = create_access_token(data={"sub": str(user.id)})
    _record_session(request, db, user.id, jti, background_tasks=background_tasks if 'background_tasks' in locals() else None)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.full_name, "email": user.email, "is_verified": user.is_verified},
    }


@router.post("/oauth-login")
def oauth_login(payload: OAuthRequest, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Accepts the Google OAuth access_token from the frontend (@react-oauth/google).
    Calls Google's userinfo endpoint to get the real email, then creates or
    looks up the user in our DB and issues our own JWT.
    """
    import httpx

    try:
        resp = httpx.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {payload.token}"},
            timeout=10.0,
        )
        resp.raise_for_status()
        google_info = resp.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to verify Google token. Please try again.",
        )

    google_email = google_info.get("email")
    google_name = google_info.get("name", "User")

    if not google_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not retrieve email from Google account.",
        )

    # Find or create the user
    user = db.query(User).filter(User.email == google_email).first()
    if not user:
        user = User(
            full_name=google_name,
            email=google_email,
            hashed_password="oauth_managed",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if user.is_two_fa_enabled:
        temp_token, jti = create_access_token(data={"sub": str(user.id), "type": "2fa_temp"})
        return {
            "requires_2fa": True,
            "temp_token": temp_token
        }

    token, jti = create_access_token(data={"sub": str(user.id)})
    _record_session(request, db, user.id, jti, background_tasks=background_tasks)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.full_name, "email": user.email, "is_verified": user.is_verified},
    }

@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == payload.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token.")
    
    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Email verified successfully."}

@router.post("/resend-verification")
def resend_verification(background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.is_verified:
        return {"message": "Email is already verified."}
    
    ver_token = secrets.token_urlsafe(32)
    current_user.verification_token = ver_token
    db.commit()
    background_tasks.add_task(send_verification_email, current_user.email, ver_token)
    return {"message": "Verification email sent."}

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Prevent email enumeration by returning a generic success message
        return {"message": "If that email is registered, a reset link has been sent."}
    
    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    db.commit()

    # Send real reset email in the background
    background_tasks.add_task(send_reset_password_email, user.email, reset_token)

    return {"message": "If that email is registered, a reset link has been sent."}

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == payload.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    
    user.hashed_password = get_password_hash(payload.new_password)
    user.reset_token = None
    db.commit()
    return {"message": "Password reset successfully."}

@router.post("/oauth-microsoft")
def oauth_microsoft(payload: OAuthRequest, request: Request, db: Session = Depends(get_db)):
    """
    Accepts the Microsoft access_token from the frontend (@azure/msal-react).
    Calls MS Graph API to get the user's info.
    """
    try:
        resp = httpx.get(
            "https://graph.microsoft.com/v1.0/me",
            headers={"Authorization": f"Bearer {payload.token}"},
            timeout=10.0,
        )
        resp.raise_for_status()
        ms_info = resp.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to verify Microsoft token. Please try again.",
        )

    ms_email = ms_info.get("mail") or ms_info.get("userPrincipalName")
    ms_name = ms_info.get("displayName", "User")

    if not ms_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not retrieve email from Microsoft account.",
        )

    # Find or create the user
    user = db.query(User).filter(User.email == ms_email).first()
    if not user:
        user = User(
            full_name=ms_name,
            email=ms_email,
            hashed_password="oauth_managed_ms",
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if user.is_two_fa_enabled:
        temp_token, jti = create_access_token(data={"sub": str(user.id), "type": "2fa_temp"})
        return {
            "requires_2fa": True,
            "temp_token": temp_token
        }

    token, jti = create_access_token(data={"sub": str(user.id)})
    _record_session(request, db, user.id, jti, background_tasks=background_tasks if 'background_tasks' in locals() else None)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.full_name, "email": user.email, "is_verified": user.is_verified},
    }

class TwoFASetupResponse(BaseModel):
    secret: str
    qr_code: str

class TwoFAVerifyRequest(BaseModel):
    code: str
    secret: str | None = None

@router.post("/2fa/setup", response_model=TwoFASetupResponse)
def setup_2fa(current_user: User = Depends(get_current_user)):
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=current_user.email, issuer_name="TrustLens AI")
    
    img = qrcode.make(uri)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    qr_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    
    return {"secret": secret, "qr_code": f"data:image/png;base64,{qr_base64}"}

@router.post("/2fa/verify")
def verify_2fa(payload: TwoFAVerifyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    secret = payload.secret or current_user.totp_secret
    if not secret:
        raise HTTPException(status_code=400, detail="No 2FA secret found.")
    
    totp = pyotp.TOTP(secret)
    if not totp.verify(payload.code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code.")
    
    current_user.totp_secret = secret
    current_user.is_two_fa_enabled = True
    db.commit()
    return {"message": "2FA successfully enabled."}

@router.post("/2fa/disable")
def disable_2fa(payload: TwoFAVerifyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA is not enabled.")
        
    totp = pyotp.TOTP(current_user.totp_secret)
    if not totp.verify(payload.code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code.")
        
    current_user.is_two_fa_enabled = False
    current_user.totp_secret = None
    db.commit()
    return {"message": "2FA successfully disabled."}

@router.post("/2fa/login-verify")
def login_verify_2fa(payload: TwoFAVerifyRequest, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # The `current_user` dependency will decode the token.
    # Note: Ensure the provided token is the temporary token and user actually requires 2FA.
    if not current_user.is_two_fa_enabled or not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA is not enabled for this account.")
        
    totp = pyotp.TOTP(current_user.totp_secret)
    if not totp.verify(payload.code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code.")
        
    token, jti = create_access_token(data={"sub": str(current_user.id)})
    _record_session(request, db, current_user.id, jti, background_tasks=background_tasks)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": current_user.id, "name": current_user.full_name, "email": current_user.email, "is_verified": current_user.is_verified},
    }

@router.get("/export")
def export_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_data = {
        "profile": {
            "id": current_user.id,
            "name": current_user.full_name,
            "email": current_user.email,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            "is_verified": current_user.is_verified,
            "is_two_fa_enabled": current_user.is_two_fa_enabled,
            "strict_ip_binding": current_user.strict_ip_binding,
            "login_alerts_enabled": current_user.login_alerts_enabled,
            "dob": current_user.dob,
            "phone": current_user.phone
        },
        "sessions": []
    }
    for s in current_user.sessions:
        user_data["sessions"].append({
            "device": s.device,
            "browser": s.browser,
            "ip_address": s.ip_address,
            "last_active": s.last_active.isoformat() if s.last_active else None
        })
    return user_data