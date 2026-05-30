from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.user import User, Interest
from app.schemas.auth import RegisterIn, LoginIn, RefreshIn, TokenOut, AccessTokenOut
from app.schemas.user import UserOut
from app.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from jose import JWTError


def _user_query():
    return select(User).options(selectinload(User.interests))


async def register(db: AsyncSession, data: RegisterIn) -> User:
    existing = await db.execute(
        select(User).where((User.email == data.email) | (User.username == data.username))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="E-mail ou username já em uso.")

    user = User(
        email=data.email,
        username=data.username,
        password_hash=hash_password(data.password),
        display_name=data.display_name,
        account_type=data.account_type,
    )
    db.add(user)
    await db.commit()
    result = await db.execute(_user_query().where(User.id == user.id))
    return result.scalar_one()


async def login(db: AsyncSession, data: LoginIn) -> User:
    result = await db.execute(_user_query().where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas.",
        )
    return user


def make_tokens(user: User) -> dict:
    payload = {"sub": str(user.id)}
    return {
        "access_token": create_access_token(payload),
        "refresh_token": create_refresh_token(payload),
    }


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> str:
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise ValueError
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Refresh token inválido.")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado.")

    return create_access_token({"sub": str(user.id)})
