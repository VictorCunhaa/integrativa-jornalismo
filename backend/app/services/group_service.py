import csv
import io
import re
import uuid
from datetime import datetime, timezone
from math import ceil

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.models.group import Group, GroupMember, GroupMemberRole, Challenge, ChallengeSubmission
from app.models.user import User, AccountType
from app.models.post import Post, PostVisibility
from app.schemas.group import (
    GroupCreateIn, InviteUsersIn, ChallengeCreateIn,
    SubmissionCreateIn, GradeIn,
)
from app.utils.sanitize import sanitize_html


# ─── helpers ──────────────────────────────────────────────────────────────

async def _load_user_public(db: AsyncSession, user_id: int) -> User:
    r = await db.execute(
        select(User).options(selectinload(User.interests)).where(User.id == user_id)
    )
    u = r.scalar_one_or_none()
    if not u:
        raise HTTPException(404, "Usuário não encontrado.")
    return u


async def _get_group_or_404(db: AsyncSession, group_id: int) -> Group:
    r = await db.execute(
        select(Group)
        .options(
            selectinload(Group.creator).selectinload(User.interests),
            selectinload(Group.members).selectinload(GroupMember.user).selectinload(User.interests),
            selectinload(Group.challenges),
        )
        .where(Group.id == group_id)
    )
    g = r.scalar_one_or_none()
    if not g:
        raise HTTPException(404, "Grupo não encontrado.")
    return g


async def _require_member(db: AsyncSession, group_id: int, user_id: int) -> GroupMember:
    r = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
        )
    )
    m = r.scalar_one_or_none()
    if not m:
        raise HTTPException(403, "Você não é membro deste grupo.")
    return m


async def _require_owner(db: AsyncSession, group_id: int, user_id: int) -> GroupMember:
    m = await _require_member(db, group_id, user_id)
    if m.role != GroupMemberRole.owner:
        raise HTTPException(403, "Apenas o professor/dono pode realizar esta ação.")
    return m


async def _submission_count(db: AsyncSession, challenge_id: int) -> int:
    return await db.scalar(
        select(func.count()).select_from(ChallengeSubmission).where(
            ChallengeSubmission.challenge_id == challenge_id
        )
    ) or 0


async def _my_submission(db: AsyncSession, challenge_id: int, user_id: int):
    r = await db.execute(
        select(ChallengeSubmission)
        .options(
            selectinload(ChallengeSubmission.student).selectinload(User.interests),
            selectinload(ChallengeSubmission.post).selectinload(Post.author).selectinload(User.interests),
            selectinload(ChallengeSubmission.post).selectinload(Post.editoria),
            selectinload(ChallengeSubmission.post).selectinload(Post.media),
        )
        .where(
            ChallengeSubmission.challenge_id == challenge_id,
            ChallengeSubmission.user_id == user_id,
        )
    )
    sub = r.scalar_one_or_none()
    if sub is None:
        return None
    return await _enrich_submission(db, sub)


async def _enrich_submission(db: AsyncSession, sub: ChallengeSubmission) -> dict:
    from app.models.comment import Comment
    from app.models.post_like import PostLike
    import re as _re

    p = sub.post
    cc = await db.scalar(select(func.count()).select_from(Comment).where(Comment.post_id == p.id)) or 0
    lc = await db.scalar(select(func.count()).select_from(PostLike).where(PostLike.post_id == p.id)) or 0
    snippet = _re.sub(r"<[^>]+>", "", p.content_html)[:200]

    post_dict = {
        **p.__dict__,
        "comment_count": cc,
        "content_snippet": snippet,
        "like_count": lc,
        "liked_by_me": False,
    }
    return {
        **sub.__dict__,
        "grade": float(sub.grade) if sub.grade is not None else None,
        "post": post_dict,
    }


# ─── groups ───────────────────────────────────────────────────────────────

async def create_group(db: AsyncSession, data: GroupCreateIn, user: User) -> dict:
    if user.account_type != AccountType.professor:
        raise HTTPException(403, "Apenas professores podem criar grupos.")

    group = Group(
        name=data.name,
        description=data.description,
        created_by=user.id,
        invite_token=uuid.uuid4().hex,
    )
    db.add(group)
    await db.flush()  # get group.id

    # add creator as owner
    db.add(GroupMember(group_id=group.id, user_id=user.id, role=GroupMemberRole.owner))

    # manual invites
    if data.invite_usernames:
        await _invite_users(db, group.id, data.invite_usernames, group_name=group.name)

    await db.commit()
    return await get_group(db, group.id, user)


async def _invite_users(db: AsyncSession, group_id: int, usernames: list[str], group_name: str = ""):
    from app.models.notification import Notification, NotificationType

    for username in usernames:
        username = username.strip()
        if not username:
            continue
        r = await db.execute(select(User).where(User.username == username))
        u = r.scalar_one_or_none()
        if not u:
            continue
        # skip if already member
        existing = await db.execute(
            select(GroupMember).where(
                GroupMember.group_id == group_id,
                GroupMember.user_id == u.id,
            )
        )
        if existing.scalar_one_or_none():
            continue
        db.add(GroupMember(group_id=group_id, user_id=u.id, role=GroupMemberRole.member))

        # Notification for invited user
        db.add(Notification(
            user_id=u.id,
            type=NotificationType.group_invite,
            title="Você foi convidado para um grupo",
            body=group_name or None,
            payload={"group_id": group_id, "group_name": group_name},
        ))


async def get_my_groups(db: AsyncSession, user: User) -> list[dict]:
    r = await db.execute(
        select(GroupMember).where(GroupMember.user_id == user.id)
    )
    memberships = r.scalars().all()
    groups = []
    for m in memberships:
        g = await _get_group_or_404(db, m.group_id)
        mc = await db.scalar(
            select(func.count()).select_from(GroupMember).where(GroupMember.group_id == g.id)
        ) or 0
        groups.append({**g.__dict__, "member_count": mc})
    return groups


async def get_group(db: AsyncSession, group_id: int, current_user: User) -> dict:
    g = await _get_group_or_404(db, group_id)
    await _require_member(db, group_id, current_user.id)

    challenges_out = []
    for ch in g.challenges:
        sc = await _submission_count(db, ch.id)
        my_sub = await _my_submission(db, ch.id, current_user.id)
        challenges_out.append({**ch.__dict__, "submission_count": sc, "my_submission": my_sub})

    return {
        **g.__dict__,
        "challenges": challenges_out,
    }


async def regenerate_invite(db: AsyncSession, group_id: int, user: User) -> dict:
    await _require_owner(db, group_id, user.id)
    r = await db.execute(select(Group).where(Group.id == group_id))
    g = r.scalar_one_or_none()
    if not g:
        raise HTTPException(404, "Grupo não encontrado.")
    g.invite_token = uuid.uuid4().hex
    await db.commit()
    return {"invite_token": g.invite_token}


async def invite_users(db: AsyncSession, group_id: int, data: InviteUsersIn, user: User):
    await _require_owner(db, group_id, user.id)
    g = await _get_group_or_404(db, group_id)
    await _invite_users(db, group_id, data.usernames, group_name=g.name)
    await db.commit()
    return {"invited": len(data.usernames)}


async def join_by_token(db: AsyncSession, token: str, user: User) -> dict:
    r = await db.execute(select(Group).where(Group.invite_token == token))
    g = r.scalar_one_or_none()
    if not g:
        raise HTTPException(404, "Link de convite inválido.")

    existing = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == g.id,
            GroupMember.user_id == user.id,
        )
    )
    if existing.scalar_one_or_none():
        return {"group_id": g.id, "already_member": True}

    db.add(GroupMember(group_id=g.id, user_id=user.id, role=GroupMemberRole.member))
    await db.commit()
    return {"group_id": g.id, "already_member": False}


async def remove_member(db: AsyncSession, group_id: int, target_user_id: int, user: User):
    await _require_owner(db, group_id, user.id)
    r = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == target_user_id,
        )
    )
    m = r.scalar_one_or_none()
    if not m:
        raise HTTPException(404, "Membro não encontrado.")
    if m.role == GroupMemberRole.owner:
        raise HTTPException(400, "Não é possível remover o dono do grupo.")
    await db.delete(m)
    await db.commit()


# ─── challenges ───────────────────────────────────────────────────────────

async def create_challenge(db: AsyncSession, group_id: int, data: ChallengeCreateIn, user: User) -> dict:
    from app.models.notification import Notification, NotificationType

    await _require_owner(db, group_id, user.id)

    ch = Challenge(
        group_id=group_id,
        created_by=user.id,
        title=data.title,
        description_html=sanitize_html(data.description_html),
        due_at=data.due_at,
    )
    db.add(ch)
    await db.flush()  # get ch.id before notifications

    # Notify all members (except the creator/professor)
    members_r = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id != user.id,
        )
    )
    members = members_r.scalars().all()

    deadline_iso = ch.due_at.isoformat() if ch.due_at else None

    for m in members:
        db.add(Notification(
            user_id=m.user_id,
            type=NotificationType.challenge,
            title=ch.title,
            body=f"Novo desafio no grupo",
            payload={
                "challenge_id": ch.id,
                "group_id": group_id,
                "deadline": deadline_iso,
            },
        ))

    await db.commit()
    await db.refresh(ch)
    return await get_challenge(db, ch.id, user)


async def get_challenge(db: AsyncSession, challenge_id: int, current_user: User) -> dict:
    r = await db.execute(
        select(Challenge)
        .options(
            selectinload(Challenge.creator).selectinload(User.interests),
            selectinload(Challenge.submissions)
            .selectinload(ChallengeSubmission.student)
            .selectinload(User.interests),
            selectinload(Challenge.submissions)
            .selectinload(ChallengeSubmission.post)
            .selectinload(Post.author)
            .selectinload(User.interests),
            selectinload(Challenge.submissions)
            .selectinload(ChallengeSubmission.post)
            .selectinload(Post.editoria),
            selectinload(Challenge.submissions)
            .selectinload(ChallengeSubmission.post)
            .selectinload(Post.media),
        )
        .where(Challenge.id == challenge_id)
    )
    ch = r.scalar_one_or_none()
    if not ch:
        raise HTTPException(404, "Desafio não encontrado.")

    # verify membership
    await _require_member(db, ch.group_id, current_user.id)

    enriched_subs = []
    my_sub = None
    for sub in ch.submissions:
        es = await _enrich_submission(db, sub)
        enriched_subs.append(es)
        if sub.user_id == current_user.id:
            my_sub = es

    return {
        **ch.__dict__,
        "submissions": enriched_subs,
        "my_submission": my_sub,
    }


async def submit_post(db: AsyncSession, challenge_id: int, data: SubmissionCreateIn, user: User) -> dict:
    r = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    ch = r.scalar_one_or_none()
    if not ch:
        raise HTTPException(404, "Desafio não encontrado.")

    await _require_member(db, ch.group_id, user.id)

    # check due_at
    if ch.due_at and datetime.now(timezone.utc) > ch.due_at.replace(tzinfo=timezone.utc):
        raise HTTPException(400, "O prazo deste desafio já encerrou.")

    # verify post ownership
    pr = await db.execute(select(Post).where(Post.id == data.post_id))
    post = pr.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post não encontrado.")
    if post.user_id != user.id:
        raise HTTPException(403, "Você só pode submeter seus próprios posts.")

    # check duplicate
    existing = await db.execute(
        select(ChallengeSubmission).where(
            ChallengeSubmission.challenge_id == challenge_id,
            ChallengeSubmission.user_id == user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Você já submeteu um post para este desafio.")

    sub = ChallengeSubmission(
        challenge_id=challenge_id,
        post_id=data.post_id,
        user_id=user.id,
    )
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return await get_challenge(db, challenge_id, user)


async def grade_submission(
    db: AsyncSession, challenge_id: int, submission_id: int, data: GradeIn, user: User
) -> dict:
    r = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    ch = r.scalar_one_or_none()
    if not ch:
        raise HTTPException(404, "Desafio não encontrado.")

    await _require_owner(db, ch.group_id, user.id)

    if not (0 <= data.grade <= 10):
        raise HTTPException(422, "A nota deve ser entre 0 e 10.")

    sr = await db.execute(
        select(ChallengeSubmission).where(
            ChallengeSubmission.id == submission_id,
            ChallengeSubmission.challenge_id == challenge_id,
        )
    )
    sub = sr.scalar_one_or_none()
    if not sub:
        raise HTTPException(404, "Submissão não encontrada.")

    sub.grade = data.grade
    sub.graded_by = user.id
    sub.graded_at = datetime.now(timezone.utc)
    await db.commit()
    return await get_challenge(db, challenge_id, user)


async def export_challenge_csv(db: AsyncSession, challenge_id: int, user: User) -> str:
    r = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    ch = r.scalar_one_or_none()
    if not ch:
        raise HTTPException(404, "Desafio não encontrado.")

    await _require_owner(db, ch.group_id, user.id)

    sr = await db.execute(
        select(ChallengeSubmission)
        .options(
            selectinload(ChallengeSubmission.student),
            selectinload(ChallengeSubmission.post),
        )
        .where(ChallengeSubmission.challenge_id == challenge_id)
    )
    subs = sr.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["nome", "email", "username", "post_url", "nota"])
    for sub in subs:
        writer.writerow([
            sub.student.display_name,
            sub.student.email,
            sub.student.username,
            f"/post/{sub.post_id}",
            float(sub.grade) if sub.grade is not None else "",
        ])
    return output.getvalue()
