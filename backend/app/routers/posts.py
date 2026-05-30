from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_db, get_current_user, get_optional_user
from app.models.user import User
from app.schemas.post import PostOut, PostCreateIn, PostUpdateIn, PostsPage, PostMediaCreateIn, PostMediaOut
from app.services import post_service

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=PostsPage)
async def feed(
    editoria: str | None = Query(None),
    format: str | None = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    return await post_service.get_feed(db, editoria, format, page, size, current_user)


@router.post("", response_model=PostOut, status_code=201)
async def create(
    data: PostCreateIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await post_service.create_post(db, data, user)


@router.get("/{post_id}", response_model=PostOut)
async def get_post(
    post_id: int,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    return await post_service.get_post(db, post_id, current_user)


@router.patch("/{post_id}", response_model=PostOut)
async def update_post(
    post_id: int,
    data: PostUpdateIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await post_service.update_post(db, post_id, data, user)


@router.delete("/{post_id}", status_code=204)
async def delete_post(
    post_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await post_service.delete_post(db, post_id, user)


@router.post("/{post_id}/publish", response_model=PostOut)
async def publish_post(
    post_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await post_service.publish_post(db, post_id, user)


@router.post("/{post_id}/media", response_model=PostMediaOut, status_code=201)
async def add_media(
    post_id: int,
    data: PostMediaCreateIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await post_service.add_media(db, post_id, data, user)


@router.delete("/{post_id}/media/{media_id}", status_code=204)
async def remove_media(
    post_id: int,
    media_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await post_service.remove_media(db, post_id, media_id, user)
