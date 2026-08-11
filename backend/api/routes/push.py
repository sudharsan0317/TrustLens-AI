from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.api.deps import get_db, get_current_user
from backend.models.user import User
import json
from pywebpush import webpush, WebPushException

router = APIRouter(prefix="/push", tags=["Push"])

# In a real app, this would be read from a file or env var
VAPID_PRIVATE_KEY = "vapid_private.pem" 
VAPID_CLAIMS = {"sub": "mailto:admin@trustlens.ai"}

class PushSubscription(BaseModel):
    endpoint: str
    keys: dict

@router.post("/subscribe")
def subscribe(subscription: PushSubscription, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Save the subscription in the DB
    current_user.push_subscription = json.dumps(subscription.dict())
    db.commit()
    return {"message": "Subscribed successfully"}

@router.post("/test")
def test_push(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.push_subscription:
        raise HTTPException(status_code=400, detail="No push subscription found")
    
    sub_info = json.loads(current_user.push_subscription)
    
    try:
        webpush(
            subscription_info=sub_info,
            data=json.dumps({"title": "TrustLens AI Alert", "body": "This is a real push notification!"}),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=VAPID_CLAIMS
        )
        return {"message": "Push sent"}
    except WebPushException as ex:
        print("WebPush Exception:", ex)
        raise HTTPException(status_code=500, detail="Failed to send push notification")
