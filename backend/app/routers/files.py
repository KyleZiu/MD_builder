from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/files", tags=["files"])


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    return {"filename": file.filename, "content_type": file.content_type}
