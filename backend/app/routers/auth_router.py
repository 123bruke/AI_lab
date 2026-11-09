from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserLogin, UserOut, Token
from ..auth import hash_password, verify_password, create_access_token, require_current_user, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if username or email already exists
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is already registered."
        )

    hashed_pw = hash_password(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_pw,
        full_name=user_data.full_name or user_data.username,
        role=user_data.role or "student",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.username, "user_id": new_user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    token = create_access_token(data={"sub": user.username, "user_id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def get_current_user_profile(user: User = Depends(require_current_user)):
    return user
