import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger, String, Text, DateTime, Enum, ForeignKey,
    Numeric, func, UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class GroupMemberRole(str, enum.Enum):
    owner = "owner"
    member = "member"


class Group(Base):
    __tablename__ = "groups"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    invite_token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, default=lambda: uuid.uuid4().hex)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by])
    members: Mapped[list["GroupMember"]] = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")
    challenges: Mapped[list["Challenge"]] = relationship("Challenge", back_populates="group", cascade="all, delete-orphan")


class GroupMember(Base):
    __tablename__ = "group_members"
    __table_args__ = (
        UniqueConstraint("group_id", "user_id", name="uq_group_member"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    group_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("groups.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[GroupMemberRole] = mapped_column(Enum(GroupMemberRole), nullable=False, default=GroupMemberRole.member)
    joined_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    group: Mapped["Group"] = relationship("Group", back_populates="members")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])


class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    group_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("groups.id", ondelete="CASCADE"), nullable=False)
    created_by: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(280), nullable=False)
    description_html: Mapped[str] = mapped_column(Text, nullable=False, default="")
    due_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    group: Mapped["Group"] = relationship("Group", back_populates="challenges")
    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by])
    submissions: Mapped[list["ChallengeSubmission"]] = relationship(
        "ChallengeSubmission", back_populates="challenge", cascade="all, delete-orphan"
    )


class ChallengeSubmission(Base):
    __tablename__ = "challenge_submissions"
    __table_args__ = (
        UniqueConstraint("challenge_id", "user_id", name="uq_challenge_submission"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    challenge_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    post_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    grade: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    graded_by: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    graded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    challenge: Mapped["Challenge"] = relationship("Challenge", back_populates="submissions")
    post: Mapped["Post"] = relationship("Post", foreign_keys=[post_id])
    student: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    grader: Mapped["User"] = relationship("User", foreign_keys=[graded_by])
