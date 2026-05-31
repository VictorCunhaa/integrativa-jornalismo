import enum
from datetime import datetime

from sqlalchemy import (
    BigInteger, String, Text, DateTime, Enum, Integer,
    ForeignKey, JSON, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PostFormat(str, enum.Enum):
    text = "text"
    photo = "photo"
    audio = "audio"
    video = "video"
    mixed = "mixed"


class PostVisibility(str, enum.Enum):
    public = "public"
    restricted = "restricted"
    private = "private"


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=False)
    editoria_id: Mapped[int] = mapped_column(Integer, ForeignKey("editorias.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(280), nullable=False)
    subtitle: Mapped[str | None] = mapped_column(String(500), nullable=True)
    format: Mapped[PostFormat] = mapped_column(Enum(PostFormat), nullable=False, default=PostFormat.text)
    content_html: Mapped[str] = mapped_column(Text, nullable=False, default="")
    content_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    cover_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    visibility: Mapped[PostVisibility] = mapped_column(
        Enum(PostVisibility), nullable=False, default=PostVisibility.public
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    author: Mapped["User"] = relationship("User", back_populates="posts")
    editoria: Mapped["Editoria"] = relationship("Editoria", back_populates="posts")
    media: Mapped[list["PostMedia"]] = relationship(
        "PostMedia", back_populates="post", cascade="all, delete-orphan", order_by="PostMedia.position"
    )
    comments: Mapped[list["Comment"]] = relationship(
        "Comment", back_populates="post", cascade="all, delete-orphan"
    )
    likes: Mapped[list["PostLike"]] = relationship(
        "PostLike", back_populates="post", cascade="all, delete-orphan"
    )
