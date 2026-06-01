from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
import io

from app.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.group import (
    GroupCreateIn, GroupOut, GroupDetailOut,
    InviteUsersIn,
    ChallengeCreateIn, ChallengeDetailOut,
    SubmissionCreateIn, GradeIn,
)
from app.services import group_service
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/groups", tags=["groups"])


# ─── Groups ───────────────────────────────────────────────────────────────

@router.post("", status_code=201)
async def create_group(
    data: GroupCreateIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await group_service.create_group(db, data, user)


@router.get("")
async def my_groups(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await group_service.get_my_groups(db, user)


@router.get("/{group_id}")
async def get_group(
    group_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await group_service.get_group(db, group_id, user)


@router.post("/{group_id}/invite/regenerate")
async def regenerate_invite(
    group_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await group_service.regenerate_invite(db, group_id, user)


@router.post("/{group_id}/members")
async def invite_users(
    group_id: int,
    data: InviteUsersIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await group_service.invite_users(db, group_id, data, user)


@router.delete("/{group_id}/members/{target_user_id}", status_code=204)
async def remove_member(
    group_id: int,
    target_user_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await group_service.remove_member(db, group_id, target_user_id, user)


@router.get("/join/{token}")
async def join_by_token(
    token: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await group_service.join_by_token(db, token, user)


# ─── Challenges ───────────────────────────────────────────────────────────

@router.post("/{group_id}/challenges", status_code=201)
async def create_challenge(
    group_id: int,
    data: ChallengeCreateIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await group_service.create_challenge(db, group_id, data, user)


@router.get("/{group_id}/challenges/{challenge_id}")
async def get_challenge(
    group_id: int,
    challenge_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await group_service.get_challenge(db, challenge_id, user)


@router.post("/{group_id}/challenges/{challenge_id}/submit", status_code=201)
async def submit_post(
    group_id: int,
    challenge_id: int,
    data: SubmissionCreateIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await group_service.submit_post(db, challenge_id, data, user)


@router.patch("/{group_id}/challenges/{challenge_id}/submissions/{submission_id}/grade")
async def grade_submission(
    group_id: int,
    challenge_id: int,
    submission_id: int,
    data: GradeIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await group_service.grade_submission(db, challenge_id, submission_id, data, user)


@router.get("/{group_id}/challenges/{challenge_id}/export")
async def export_csv(
    group_id: int,
    challenge_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    csv_content = await group_service.export_challenge_csv(db, challenge_id, user)
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=desafio_{challenge_id}.csv"},
    )
