import io
from pathlib import Path

import filetype
from fastapi import HTTPException, UploadFile
from PIL import Image

from app.config import settings
from app.storage.local import storage

ALLOWED_IMAGES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEOS = {"video/mp4", "video/webm"}
ALLOWED_AUDIOS = {"audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav", "audio/x-wav"}


async def upload_image(file: UploadFile) -> dict:
    content = await file.read()
    _check_size(content, settings.MAX_IMAGE_SIZE_MB)
    mime = _detect_mime(content)
    if mime not in ALLOWED_IMAGES:
        raise HTTPException(400, f"Formato de imagem não suportado: {mime}")

    await file.seek(0)
    url, full_path = await storage.save(file, "images")

    thumb_url = await _make_thumbnail(full_path, url)
    img = Image.open(full_path)
    width, height = img.size
    return {"url": url, "thumb_url": thumb_url, "width": width, "height": height}


async def upload_video(file: UploadFile) -> dict:
    content = await file.read()
    _check_size(content, settings.MAX_VIDEO_SIZE_MB)
    mime = _detect_mime(content)
    if mime not in ALLOWED_VIDEOS:
        raise HTTPException(400, f"Formato de vídeo não suportado: {mime}")

    await file.seek(0)
    url, _ = await storage.save(file, "videos")
    return {"url": url, "mime_type": mime, "size_bytes": len(content)}


async def upload_audio(file: UploadFile) -> dict:
    content = await file.read()
    _check_size(content, settings.MAX_AUDIO_SIZE_MB)
    mime = _detect_mime(content)
    if mime not in ALLOWED_AUDIOS:
        raise HTTPException(400, f"Formato de áudio não suportado: {mime}")

    await file.seek(0)
    url, _ = await storage.save(file, "audio")
    return {"url": url, "mime_type": mime, "size_bytes": len(content)}


def _check_size(content: bytes, max_mb: int) -> None:
    if len(content) > max_mb * 1024 * 1024:
        raise HTTPException(400, f"Arquivo excede o limite de {max_mb} MB.")


def _detect_mime(content: bytes) -> str:
    kind = filetype.guess(content)
    return kind.mime if kind else "application/octet-stream"


async def _make_thumbnail(full_path: str, original_url: str) -> str:
    try:
        img = Image.open(full_path)
        img.thumbnail((400, 400))
        p = Path(full_path)
        thumb_path = p.parent / f"thumb_{p.name}"
        img.save(thumb_path)
        parts = original_url.rsplit("/", 1)
        return f"{parts[0]}/thumb_{parts[1]}"
    except Exception:
        return original_url
