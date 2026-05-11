import os
from pathlib import Path
from contextlib import asynccontextmanager
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import FileResponse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import tasks, files, config as config_router


frontend_build = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"


class SPAFallbackMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        if response.status_code == 404 and frontend_build.exists() and not request.url.path.startswith("/api/"):
            path = request.url.path.lstrip("/")
            file_path = frontend_build / path
            if file_path.exists() and file_path.is_file():
                return FileResponse(str(file_path))
            return FileResponse(str(frontend_build / "index.html"))
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="MD_Builder",
    description="基于 MarkItDown 的文件转 Markdown Web 工具",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
allow_origins = [o.strip() for o in origins_str.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SPA fallback must be after CORS but needs to intercept 404s
if frontend_build.exists() and frontend_build.is_dir():
    app.add_middleware(SPAFallbackMiddleware)

# API 路由
app.include_router(tasks.router)
app.include_router(files.router)
app.include_router(config_router.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
