from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_db
from app.schemas.post import PostsPage
from app.services import post_service

router = APIRouter(tags=["posts"])


@router.get("/users/{username}/posts", response_model=PostsPage)
async def user_posts(
    username: str,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await post_service.get_user_posts(db, username, page, size)
