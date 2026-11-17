import random
import re
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import OtpCode, User

SECRET_KEY = "change-this-secret-in-production"
ALGORITHM = "HS256"
TOKEN_HOURS = 24
PHONE_RE = re.compile(r"^\+923\d{9}$")

router = APIRouter(prefix="/api/auth", tags=["Auth"])
bearer = HTTPBearer()


class SendOtpIn(BaseModel):
    phone: str


class VerifyOtpIn(BaseModel):
    phone: str
    code: str
    role: str = "customer"  # customer | vendor
    name: str = ""


def create_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    try:
        data = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user = db.get(User, int(data["sub"]))
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_role(role: str):
    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role != role:
            raise HTTPException(status_code=403, detail="Access denied for your role")
        return user
    return checker


@router.post("/send-otp")
def send_otp(data: SendOtpIn, db: Session = Depends(get_db)):
    if not PHONE_RE.match(data.phone):
        raise HTTPException(status_code=400, detail="Enter a valid number like +923001234567")

    code = f"{random.randint(0, 999999):06d}"
    db.add(OtpCode(phone=data.phone, code=code,
                   expires_at=datetime.utcnow() + timedelta(minutes=5)))
    db.commit()

    # SMS gateway simulation: in production, integrate an SMS provider here (e.g. Twilio).
    print(f"[SMS SIMULATION] OTP for {data.phone}: {code}")
    # NOTE: "dev_otp" is returned for demo purposes only. Remove it in production.
    return {"message": "OTP sent", "dev_otp": code}


@router.post("/verify-otp")
def verify_otp(data: VerifyOtpIn, db: Session = Depends(get_db)):
    if data.role not in ("customer", "vendor"):
        raise HTTPException(status_code=400, detail="Role must be customer or vendor")

    otp = (
        db.query(OtpCode)
        .filter(OtpCode.phone == data.phone, OtpCode.code == data.code, OtpCode.used == False)  # noqa: E712
        .order_by(OtpCode.id.desc())
        .first()
    )
    if not otp or otp.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    otp.used = True
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        user = User(phone=data.phone, role=data.role, name=data.name)
        db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "access_token": create_token(user),
        "token_type": "bearer",
        "user": {"id": user.id, "phone": user.phone, "name": user.name, "role": user.role},
    }


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "phone": user.phone, "name": user.name, "role": user.role}