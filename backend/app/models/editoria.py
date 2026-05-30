from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Editoria(Base):
    __tablename__ = "editorias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    label: Mapped[str] = mapped_column(String(80), nullable=False)

    posts: Mapped[list["Post"]] = relationship("Post", back_populates="editoria", lazy="select")
