from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User, Student
from app.schemas.user import ForgotPasswordIn, LoginIn, RegisterIn, Token, UserOut
from app.core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_password_hash,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut)
def register(body: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == str(body.email)).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        login=body.login,
        email=str(body.email).lower(),
        password_hash=get_password_hash(body.password),
    )
    db.add(user)
    db.flush()
    db.add(Student(id_user=user.id))
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(body: LoginIn, db: Session = Depends(get_db)):
    email = str(body.email).lower()
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user or not verify_password(body.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": db_user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserOut.model_validate(db_user),
    }


@router.post("/forgot-password")
def forgot_password(_: ForgotPasswordIn):
    return {"detail": "If the account exists, password reset instructions would be sent."}
