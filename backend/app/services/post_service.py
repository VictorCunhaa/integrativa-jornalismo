from datetime import datetime, timezone
from math import ceil

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from app.models.post import Post, PostVisibility
from app.models.comment import Comment
from app.models.post_media import PostMedia, MediaType
from app.models.user import User
from app.schemas.post import PostCreateIn, PostUpdateIn, PostMediaCreateIn
from app.utils.sanitize import sanitize_html


async def get_feed(
    db: AsyncSession,
    editoria: str | None,
    format: str | None,
    page: int,
    size: int,
    current_user: User | None,
) -> dict:
    visibility_filter = [PostVisibility.public]
    if current_user:
        visibility_filter.append(PostVisibility.restricted)

    conditions = [
        Post.published_at.isnot(None),
        Post.visibility.in_(visibility_filter),
    ]
    if editoria:
        from app.models.editoria import Editoria
        sub = select(Editoria.id).where(Editoria.slug == editoria).scalar_subquery()
        conditions.append(Post.editoria_id == sub)
    if format:
        conditions.append(Post.format == format)

    count_q = select(func.count()).select_from(Post).where(and_(*conditions))
    total_result = await db.execute(count_q)
    total = total_result.scalar_one()

    q = (
        select(Post)
        .options(
            selectinload(Post.author).selectinload(User.interests),
            selectinload(Post.editoria),
            selectinload(Post.media),
        )
        .where(and_(*conditions))
        .order_by(Post.published_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    result = await db.execute(q)
    posts = result.scalars().all()

    items = []
    for post in posts:
        comment_count = await db.scalar(
            select(func.count()).select_from(Comment).where(Comment.post_id == post.id)
        ) or 0
        import re
        snippet = re.sub(r"<[^>]+>", "", post.content_html)[:200]
        items.append({**post.__dict__, "comment_count": comment_count, "content_snippet": snippet})

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": ceil(total / size) if size else 1,
    }


async def get_post(db: AsyncSession, post_id: int, current_user: User | None) -> Post:
    q = (
        select(Post)
        .options(
            selectinload(Post.author).selectinload(User.interests),
            selectinload(Post.editoria),
            selectinload(Post.media),
        )
        .where(Post.id == post_id)
    )
    result = await db.execute(q)
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado.")

    if post.visibility == PostVisibility.private:
        if not current_user or current_user.id != post.user_id:
            raise HTTPException(status_code=403, detail="Acesso negado.")
    if post.visibility == PostVisibility.restricted and not current_user:
        raise HTTPException(status_code=401, detail="Login necessário.")

    return post


async def create_post(db: AsyncSession, data: PostCreateIn, user: User) -> Post:
    post = Post(
        user_id=user.id,
        editoria_id=data.editoria_id,
        title=data.title,
        subtitle=data.subtitle,
        format=data.format,
        content_html=sanitize_html(data.content_html),
        content_json=data.content_json,
        cover_url=data.cover_url,
        visibility=data.visibility,
        published_at=data.published_at,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return await get_post(db, post.id, user)


async def update_post(db: AsyncSession, post_id: int, data: PostUpdateIn, user: User) -> Post:
    post = await _get_owned_post(db, post_id, user)
    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "content_html" and value is not None:
            value = sanitize_html(value)
        setattr(post, field, value)
    await db.commit()
    return await get_post(db, post.id, user)


async def delete_post(db: AsyncSession, post_id: int, user: User) -> None:
    post = await _get_owned_post(db, post_id, user)
    await db.delete(post)
    await db.commit()


async def publish_post(db: AsyncSession, post_id: int, user: User) -> Post:
    post = await _get_owned_post(db, post_id, user)
    post.published_at = datetime.now(timezone.utc)
    await db.commit()
    return await get_post(db, post.id, user)


async def add_media(db: AsyncSession, post_id: int, data: PostMediaCreateIn, user: User) -> PostMedia:
    await _get_owned_post(db, post_id, user)
    media = PostMedia(post_id=post_id, **data.model_dump())
    db.add(media)
    await db.commit()
    await db.refresh(media)
    return media


async def remove_media(db: AsyncSession, post_id: int, media_id: int, user: User) -> None:
    await _get_owned_post(db, post_id, user)
    result = await db.execute(
        select(PostMedia).where(PostMedia.id == media_id, PostMedia.post_id == post_id)
    )
    media = result.scalar_one_or_none()
    if not media:
        raise HTTPException(status_code=404, detail="Mídia não encontrada.")
    await db.delete(media)
    await db.commit()


async def get_user_posts(db: AsyncSession, username: str, page: int, size: int) -> dict:
    from app.models.editoria import Editoria
    user_result = await db.execute(select(User).where(User.username == username))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    conditions = [
        Post.user_id == user.id,
        Post.published_at.isnot(None),
        Post.visibility == PostVisibility.public,
    ]
    total = await db.scalar(select(func.count()).select_from(Post).where(and_(*conditions))) or 0

    q = (
        select(Post)
        .options(selectinload(Post.author).selectinload(User.interests), selectinload(Post.editoria), selectinload(Post.media))
        .where(and_(*conditions))
        .order_by(Post.published_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    posts = (await db.execute(q)).scalars().all()
    items = []
    for p in posts:
        import re
        snippet = re.sub(r"<[^>]+>", "", p.content_html)[:200]
        cc = await db.scalar(select(func.count()).select_from(Comment).where(Comment.post_id == p.id)) or 0
        items.append({**p.__dict__, "comment_count": cc, "content_snippet": snippet})
    return {"items": items, "total": total, "page": page, "size": size, "pages": ceil(total / size) if size else 1}


async def _get_owned_post(db: AsyncSession, post_id: int, user: User) -> Post:
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado.")
    if post.user_id != user.id:
        raise HTTPException(status_code=403, detail="Sem permissão.")
    return post
