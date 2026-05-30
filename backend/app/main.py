from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pathlib import Path

from app.config import settings
from app.routers import auth, users, posts, comments, uploads, taxonomies, user_posts

app = FastAPI(
    title="Redação-Escola Digital API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

storage_path = Path(settings.STORAGE_PATH)
storage_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(storage_path)), name="uploads")

PREFIX = "/api/v1"
app.include_router(auth.router, prefix=PREFIX)
app.include_router(users.router, prefix=PREFIX)
app.include_router(posts.router, prefix=PREFIX)
app.include_router(comments.router, prefix=PREFIX)
app.include_router(uploads.router, prefix=PREFIX)
app.include_router(taxonomies.router, prefix=PREFIX)
app.include_router(user_posts.router, prefix=PREFIX)


@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    from fastapi import HTTPException
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": "HTTP_ERROR", "message": exc.detail}},
        )
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": "Erro interno do servidor."}},
    )


@app.get("/health")
async def health():
    return {"status": "ok"}
