import re

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func, and_
from sqlalchemy.orm import selectinload

from app.deps import get_db, get_optional_user
from app.models.user import User
from app.models.post import Post, PostVisibility
from app.models.comment import Comment
from app.models.post_like import PostLike
from app.schemas.user import UserPublicOut
from app.schemas.search import SearchResponse

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=SearchResponse)
async def search(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    q = q.strip()
    if not q:
        raise HTTPException(status_code=400, detail="O parâmetro 'q' não pode ser vazio.")

    term = f"%{q}%"

    # --- Profiles ---
    profile_conditions = or_(
        User.username.ilike(term),
        User.display_name.ilike(term),
    )
    profiles_result = await db.execute(
        select(User)
        .options(selectinload(User.interests))
        .where(profile_conditions)
        .order_by(User.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    profiles = profiles_result.scalars().all()

    total_profiles = await db.scalar(
        select(func.count()).select_from(User).where(profile_conditions)
    ) or 0

    # --- Posts ---
    post_conditions = and_(
        Post.published_at.isnot(None),
        Post.visibility == PostVisibility.public,
        or_(
            Post.title.ilike(term),
            Post.subtitle.ilike(term),
        ),
    )
    posts_result = await db.execute(
        select(Post)
        .options(
            selectinload(Post.author).selectinload(User.interests),
            selectinload(Post.editoria),
            selectinload(Post.media),
        )
        .where(post_conditions)
        .order_by(Post.published_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    posts = posts_result.scalars().all()

    total_posts = await db.scalar(
        select(func.count()).select_from(Post).where(post_conditions)
    ) or 0

    post_items = []
    for post in posts:
        comment_count = await db.scalar(
            select(func.count()).select_from(Comment).where(Comment.post_id == post.id)
        ) or 0
        like_count = await db.scalar(
            select(func.count()).select_from(PostLike).where(PostLike.post_id == post.id)
        ) or 0
        liked_by_me = False
        if current_user:
            liked = await db.scalar(
                select(func.count()).select_from(PostLike).where(
                    PostLike.post_id == post.id,
                    PostLike.user_id == current_user.id,
                )
            ) or 0
            liked_by_me = liked > 0
        snippet = re.sub(r"<[^>]+>", "", post.content_html)[:200]
        post_items.append({
            **post.__dict__,
            "comment_count": comment_count,
            "like_count": like_count,
            "liked_by_me": liked_by_me,
            "content_snippet": snippet,
        })

    return {
        "profiles": [UserPublicOut.model_validate(p.__dict__ | {"post_count": 0, "post_editorias": [], "interests": p.interests}) for p in profiles],
        "posts": post_items,
        "total_profiles": total_profiles,
        "total_posts": total_posts,
    }
