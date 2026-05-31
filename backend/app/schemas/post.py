from datetime import datetime
from pydantic import BaseModel
from app.models.post import PostFormat, PostVisibility
from app.schemas.user import UserPublicOut


class EditoriaOut(BaseModel):
    id: int
    slug: str
    label: str

    model_config = {"from_attributes": True}


class PostMediaOut(BaseModel):
    id: int
    media_type: str
    url: str
    caption: str | None
    credit: str | None
    position: int

    model_config = {"from_attributes": True}


class PostOut(BaseModel):
    id: int
    title: str
    subtitle: str | None
    format: PostFormat
    content_html: str
    content_json: dict | None
    cover_url: str | None
    visibility: PostVisibility
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    editoria: EditoriaOut
    author: UserPublicOut
    media: list[PostMediaOut] = []
    comment_count: int = 0
    like_count: int = 0
    liked_by_me: bool = False

    model_config = {"from_attributes": True}


class PostListItem(BaseModel):
    id: int
    title: str
    subtitle: str | None
    format: PostFormat
    cover_url: str | None
    visibility: PostVisibility
    published_at: datetime | None
    created_at: datetime
    editoria: EditoriaOut
    author: UserPublicOut
    comment_count: int = 0
    content_snippet: str = ""
    like_count: int = 0
    liked_by_me: bool = False

    model_config = {"from_attributes": True}


class PostCreateIn(BaseModel):
    title: str
    subtitle: str | None = None
    format: PostFormat = PostFormat.text
    editoria_id: int
    content_html: str = ""
    content_json: dict | None = None
    cover_url: str | None = None
    visibility: PostVisibility = PostVisibility.public
    published_at: datetime | None = None


class PostUpdateIn(BaseModel):
    title: str | None = None
    subtitle: str | None = None
    format: PostFormat | None = None
    editoria_id: int | None = None
    content_html: str | None = None
    content_json: dict | None = None
    cover_url: str | None = None
    visibility: PostVisibility | None = None


class PostMediaCreateIn(BaseModel):
    media_type: str
    url: str
    caption: str | None = None
    credit: str | None = None
    position: int = 0


class PostsPage(BaseModel):
    items: list[PostListItem]
    total: int
    page: int
    size: int
    pages: int
