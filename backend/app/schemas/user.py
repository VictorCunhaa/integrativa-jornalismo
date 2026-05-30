from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.user import AccountType


class InterestOut(BaseModel):
    id: int
    slug: str
    label: str

    model_config = {"from_attributes": True}


class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str
    display_name: str
    account_type: AccountType
    bio: str | None
    avatar_url: str | None
    cover_url: str | None
    created_at: datetime
    interests: list[InterestOut] = []

    model_config = {"from_attributes": True}


class UserPublicOut(BaseModel):
    id: int
    username: str
    display_name: str
    account_type: AccountType
    bio: str | None
    avatar_url: str | None
    cover_url: str | None
    created_at: datetime
    interests: list[InterestOut] = []
    post_count: int = 0

    model_config = {"from_attributes": True}


class UserUpdateIn(BaseModel):
    display_name: str | None = None
    bio: str | None = None


class InterestsUpdateIn(BaseModel):
    interest_ids: list[int]


class AvatarOut(BaseModel):
    avatar_url: str


class CoverOut(BaseModel):
    cover_url: str
