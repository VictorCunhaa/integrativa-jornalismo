from fastapi import APIRouter, Depends, UploadFile, File

from app.deps import get_current_user
from app.services.upload_service import upload_image, upload_video, upload_audio

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/image")
async def upload_image_endpoint(
    file: UploadFile = File(...),
    _=Depends(get_current_user),
):
    return await upload_image(file)


@router.post("/video")
async def upload_video_endpoint(
    file: UploadFile = File(...),
    _=Depends(get_current_user),
):
    return await upload_video(file)


@router.post("/audio")
async def upload_audio_endpoint(
    file: UploadFile = File(...),
    _=Depends(get_current_user),
):
    return await upload_audio(file)
