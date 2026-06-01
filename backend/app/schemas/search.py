from pydantic import BaseModel
from app.schemas.user import UserPublicOut
from app.schemas.post import PostListItem


class SearchResponse(BaseModel):
    profiles: list[UserPublicOut]
    posts: list[PostListItem]
    total_profiles: int
    total_posts: int
