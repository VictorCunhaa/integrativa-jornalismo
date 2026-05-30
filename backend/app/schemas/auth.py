from pydantic import BaseModel, EmailStr
from app.schemas.user import UserOut
from app.models.user import AccountType


class RegisterIn(BaseModel):
    email: EmailStr
    username: str
    password: str
    display_name: str
    account_type: AccountType = AccountType.student


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RefreshIn(BaseModel):
    refresh_token: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class AccessTokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
