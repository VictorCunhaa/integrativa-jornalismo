from datetime import datetime
from pydantic import BaseModel
from app.schemas.user import UserPublicOut


class CommentCreateIn(BaseModel):
    content: str


class CommentOut(BaseModel):
    id: int
    content: str
    created_at: datetime
    author: UserPublicOut

    model_config = {"from_attributes": True}


class CommentsPage(BaseModel):
    items: list[CommentOut]
    total: int
    page: int
    size: int
