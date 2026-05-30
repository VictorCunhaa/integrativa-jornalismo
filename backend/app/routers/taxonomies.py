from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.deps import get_db
from app.models.user import Interest
from app.models.editoria import Editoria
from app.schemas.user import InterestOut
from app.schemas.post import EditoriaOut

router = APIRouter(tags=["taxonomias"])


@router.get("/interests", response_model=list[InterestOut])
async def list_interests(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Interest).order_by(Interest.label))
    return result.scalars().all()


@router.get("/editorias", response_model=list[EditoriaOut])
async def list_editorias(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Editoria).order_by(Editoria.label))
    return result.scalars().all()
