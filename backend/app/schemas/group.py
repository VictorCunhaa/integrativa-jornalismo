from datetime import datetime
from pydantic import BaseModel
from app.models.group import GroupMemberRole
from app.schemas.user import UserPublicOut
from app.schemas.post import PostListItem


# ── Group ──────────────────────────────────────────────────────────────────

class GroupCreateIn(BaseModel):
    name: str
    description: str | None = None
    invite_usernames: list[str] = []  # manual invite on creation


class GroupOut(BaseModel):
    id: int
    name: str
    description: str | None
    invite_token: str
    created_at: datetime
    creator: UserPublicOut
    member_count: int = 0

    model_config = {"from_attributes": True}


class GroupDetailOut(BaseModel):
    id: int
    name: str
    description: str | None
    invite_token: str
    created_at: datetime
    creator: UserPublicOut
    members: list["GroupMemberOut"] = []
    challenges: list["ChallengeListOut"] = []

    model_config = {"from_attributes": True}


class GroupMemberOut(BaseModel):
    id: int
    role: GroupMemberRole
    joined_at: datetime
    user: UserPublicOut

    model_config = {"from_attributes": True}


class InviteUsersIn(BaseModel):
    usernames: list[str]


# ── Challenge ──────────────────────────────────────────────────────────────

class ChallengeCreateIn(BaseModel):
    title: str
    description_html: str = ""
    due_at: datetime | None = None


class ChallengeListOut(BaseModel):
    id: int
    title: str
    description_html: str
    due_at: datetime | None
    created_at: datetime
    submission_count: int = 0
    my_submission: "SubmissionOut | None" = None

    model_config = {"from_attributes": True}


class ChallengeDetailOut(BaseModel):
    id: int
    group_id: int
    title: str
    description_html: str
    due_at: datetime | None
    created_at: datetime
    creator: UserPublicOut
    submissions: list["SubmissionOut"] = []
    my_submission: "SubmissionOut | None" = None

    model_config = {"from_attributes": True}


# ── Submission ─────────────────────────────────────────────────────────────

class SubmissionCreateIn(BaseModel):
    post_id: int


class GradeIn(BaseModel):
    grade: float  # 0–10


class SubmissionOut(BaseModel):
    id: int
    challenge_id: int
    post_id: int
    user_id: int
    grade: float | None
    graded_by: int | None
    graded_at: datetime | None
    created_at: datetime
    student: UserPublicOut
    post: PostListItem

    model_config = {"from_attributes": True}
