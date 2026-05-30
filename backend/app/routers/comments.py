from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from math import ceil

from app.deps import get_db, get_current_user
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.schemas.comment import CommentCreateIn, CommentOut, CommentsPage

router = APIRouter(tags=["comentários"])


@router.get("/posts/{post_id}/comments", response_model=CommentsPage)
async def list_comments(
    post_id: int,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    total = await db.scalar(
        select(func.count()).select_from(Comment).where(Comment.post_id == post_id)
    ) or 0

    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.author).selectinload(User.interests))
        .where(Comment.post_id == post_id)
        .order_by(Comment.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    return {"items": result.scalars().all(), "total": total, "page": page, "size": size}


@router.post("/posts/{post_id}/comments", response_model=CommentOut, status_code=201)
async def create_comment(
    post_id: int,
    data: CommentCreateIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from fastapi import HTTPException
    post = (await db.execute(select(Post).where(Post.id == post_id))).scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado.")

    comment = Comment(post_id=post_id, user_id=user.id, content=data.content)
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.author).selectinload(User.interests))
        .where(Comment.id == comment.id)
    )
    return result.scalar_one()


@router.delete("/comments/{comment_id}", status_code=204)
async def delete_comment(
    comment_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from fastapi import HTTPException
    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.post))
        .where(Comment.id == comment_id)
    )
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comentário não encontrado.")
    if comment.user_id != user.id and comment.post.user_id != user.id:
        raise HTTPException(status_code=403, detail="Sem permissão.")
    await db.delete(comment)
    await db.commit()
