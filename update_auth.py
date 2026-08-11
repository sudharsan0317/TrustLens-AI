import sys
import re

with open('backend/api/routes/auth.py', 'r') as f:
    content = f.read()

content = content.replace('from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks', 'from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request')
content = content.replace('from backend.models.user import User', 'from backend.models.user import User\nfrom backend.models.session import Session as DBSession\nfrom user_agents import parse')

# Add helper
helper = '''
def _record_session(request: Request, db: Session, user_id: int, jti: str):
    user_agent_str = request.headers.get("user-agent", "")
    user_agent = parse(user_agent_str)
    device = f"{user_agent.device.family}" if user_agent.device.family else "Unknown Device"
    os = f"{user_agent.os.family} {user_agent.os.version_string}".strip()
    browser = f"{user_agent.browser.family} {user_agent.browser.version_string}".strip()
    ip_address = request.client.host if request.client else "127.0.0.1"
    
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
'''
content = content.replace('router = APIRouter(prefix="/auth", tags=["Auth"])', 'router = APIRouter(prefix="/auth", tags=["Auth"])\n' + helper)

content = content.replace('def signup(payload: SignupRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):', 'def signup(payload: SignupRequest, background_tasks: BackgroundTasks, request: Request, db: Session = Depends(get_db)):')
content = content.replace('def login(payload: LoginRequest, db: Session = Depends(get_db)):', 'def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):')
content = content.replace('def oauth_login(payload: OAuthRequest, db: Session = Depends(get_db)):', 'def oauth_login(payload: OAuthRequest, request: Request, db: Session = Depends(get_db)):')
content = content.replace('def oauth_microsoft(payload: OAuthRequest, db: Session = Depends(get_db)):', 'def oauth_microsoft(payload: OAuthRequest, request: Request, db: Session = Depends(get_db)):')
content = content.replace('def login_verify_2fa(payload: TwoFAVerifyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):', 'def login_verify_2fa(payload: TwoFAVerifyRequest, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):')

content = content.replace('token, jti = create_access_token(data={"sub": str(user.id)})', 'token, jti = create_access_token(data={"sub": str(user.id)})\n    _record_session(request, db, user.id, jti)')
content = content.replace('token, jti = create_access_token(data={"sub": str(current_user.id)})', 'token, jti = create_access_token(data={"sub": str(current_user.id)})\n    _record_session(request, db, current_user.id, jti)')

with open('backend/api/routes/auth.py', 'w') as f:
    f.write(content)
print("Updated auth.py")
