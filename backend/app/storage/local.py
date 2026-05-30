import uuid
from datetime import datetime
from pathlib import Path

import aiofiles
from fastapi import UploadFile

from app.config import settings
from app.storage.base import StorageBackend


class LocalStorageBackend(StorageBackend):
    def __init__(self):
        self.base_path = Path(settings.STORAGE_PATH)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def save(self, file: UploadFile, subfolder: str = "") -> tuple[str, str]:
        now = datetime.now()
        year_month = now.strftime("%Y/%m")
        ext = Path(file.filename or "file").suffix.lower()
        filename = f"{uuid.uuid4().hex}{ext}"
        rel_path = f"{year_month}/{filename}"
        full_dir = self.base_path / year_month
        full_dir.mkdir(parents=True, exist_ok=True)
        full_path = full_dir / filename

        content = await file.read()
        async with aiofiles.open(full_path, "wb") as f:
            await f.write(content)

        url = f"/uploads/{rel_path}"
        return url, str(full_path)

    async def delete(self, path: str) -> None:
        full_path = Path(path)
        if full_path.exists():
            full_path.unlink()


storage = LocalStorageBackend()
