from abc import ABC, abstractmethod
from fastapi import UploadFile


class StorageBackend(ABC):
    @abstractmethod
    async def save(self, file: UploadFile, subfolder: str) -> tuple[str, str]:
        """Save file and return (url, full_path)."""
        ...

    @abstractmethod
    async def delete(self, path: str) -> None:
        ...
