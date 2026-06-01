from datetime import datetime
from typing import Any

from pydantic import BaseModel

from app.models.notification import NotificationType


class NotificationOut(BaseModel):
    id: int
    type: NotificationType
    title: str
    body: str | None
    payload: dict[str, Any] | None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}


class ReadAllResponse(BaseModel):
    marked: int
