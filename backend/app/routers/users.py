from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct

from app.deps import get_db, get_current_user
from app.models.user import User, Interest
from app.schemas.user import UserOut, UserPublicOut, UserUpdateIn, InterestsUpdateIn, AvatarOut, CoverOut
from app.services.upload_service import upload_image
from app.storage.local import storage

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{username}", response_model=UserPublicOut)
async def get_profile(username: str, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import selectinload
    from app.models.post import Post
    from app.models.editoria import Editoria

    result = await db.execute(
        select(User).options(selectinload(User.interests)).where(User.username == username)
    )
    user = result.scalar_one_or_none()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    post_count = await db.scalar(
        select(func.count()).select_from(Post).where(Post.user_id == user.id, Post.published_at.isnot(None))
    ) or 0

    # Unique editorias from user's published posts (for sidebar interest derivation)
    editoria_rows = (
        await db.execute(
            select(Editoria)
            .join(Post, Post.editoria_id == Editoria.id)
            .where(Post.user_id == user.id, Post.published_at.isnot(None))
            .distinct()
        )
    ).scalars().all()
    post_editorias = [{"id": e.id, "slug": e.slug, "label": e.label} for e in editoria_rows]

    return UserPublicOut.model_validate({**user.__dict__, "post_count": post_count, "post_editorias": post_editorias})


@router.patch("/me", response_model=UserOut)
async def update_me(
    data: UserUpdateIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload
    if data.display_name is not None:
        user.display_name = data.display_name
    if data.bio is not None:
        user.bio = data.bio
    await db.commit()
    result = await db.execute(
        select(User).options(selectinload(User.interests)).where(User.id == user.id)
    )
    return result.scalar_one()


@router.post("/me/avatar", response_model=AvatarOut)
async def upload_avatar(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await upload_image(file)
    user.avatar_url = result["url"]
    await db.commit()
    return {"avatar_url": result["url"]}


@router.post("/me/cover", response_model=CoverOut)
async def upload_cover(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await upload_image(file)
    user.cover_url = result["url"]
    await db.commit()
    return {"cover_url": result["url"]}


@router.put("/me/interests", response_model=UserOut)
async def update_interests(
    data: InterestsUpdateIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload

    interests = (
        await db.execute(select(Interest).where(Interest.id.in_(data.interest_ids)))
    ).scalars().all()
    user.interests = list(interests)
    await db.commit()
    result = await db.execute(
        select(User).options(selectinload(User.interests)).where(User.id == user.id)
    )
    return result.scalar_one()
