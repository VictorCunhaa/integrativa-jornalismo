from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_db, get_current_user
from app.schemas.auth import RegisterIn, LoginIn, RefreshIn, TokenOut, AccessTokenOut
from app.schemas.user import UserOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut, status_code=201)
async def register(data: RegisterIn, db: AsyncSession = Depends(get_db)):
    user = await auth_service.register(db, data)
    tokens = auth_service.make_tokens(user)
    return {**tokens, "user": user}


@router.post("/login", response_model=TokenOut)
async def login(data: LoginIn, db: AsyncSession = Depends(get_db)):
    user = await auth_service.login(db, data)
    tokens = auth_service.make_tokens(user)
    return {**tokens, "user": user}


@router.post("/refresh", response_model=AccessTokenOut)
async def refresh(data: RefreshIn, db: AsyncSession = Depends(get_db)):
    access_token = await auth_service.refresh_access_token(db, data.refresh_token)
    return {"access_token": access_token}


@router.get("/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return user
